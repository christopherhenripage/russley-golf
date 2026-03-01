import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { updateRatings } from "@/lib/ratings";
import {
  volatilityIndex,
  momentum,
  shockFactor,
  shockLabel,
  performanceState,
  careerAverage,
  rollingWeightedAverage,
  buildAdjustedRounds,
} from "@/lib/analytics";
import type { Course, Round, RatingSnapshot } from "@/lib/types";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { player_id, course_id, score, date } = body;

  if (!player_id || !course_id || !score || !date) {
    return NextResponse.json(
      { error: "Missing required fields: player_id, course_id, score, date" },
      { status: 400 }
    );
  }

  // Insert the round
  const { data: round, error: roundError } = await supabase
    .from("rounds")
    .insert({ player_id, course_id, score, date })
    .select()
    .single();

  if (roundError) {
    return NextResponse.json({ error: roundError.message }, { status: 500 });
  }

  // Recalculate ratings for this date
  const [coursesRes, roundsOnDateRes, allRoundsRes, ratingsRes] =
    await Promise.all([
      supabase.from("courses").select("*"),
      supabase.from("rounds").select("*").eq("date", date),
      supabase
        .from("rounds")
        .select("*")
        .eq("player_id", player_id)
        .order("date", { ascending: false }),
      supabase
        .from("ratings_history")
        .select("*")
        .order("date", { ascending: false }),
    ]);

  if (coursesRes.error || roundsOnDateRes.error || allRoundsRes.error || ratingsRes.error) {
    return NextResponse.json(
      { error: "Round saved but analytics update failed" },
      { status: 207 }
    );
  }

  const courses = coursesRes.data as Course[];
  const roundsOnDate = roundsOnDateRes.data as Round[];

  // Get current ratings for all players on this date
  const playerIds = [...new Set(roundsOnDate.map((r) => r.player_id))];
  const currentRatings = new Map<string, number>();
  const ratings = ratingsRes.data as RatingSnapshot[];
  for (const pid of playerIds) {
    const latest = ratings.find((r) => r.player_id === pid);
    currentRatings.set(pid, latest?.rpr ?? 1500);
  }

  // Update ratings
  const newRatings = updateRatings(currentRatings, roundsOnDate, courses);

  // Calculate volatility and momentum for the submitting player
  const allPlayerRounds = allRoundsRes.data as Round[];
  const adjustedRounds = buildAdjustedRounds(allPlayerRounds, courses);
  const adjScores = adjustedRounds.map((ar) => ar.adjustedScore);
  const vol = volatilityIndex(adjScores);
  const mom = momentum(adjScores);

  // Upsert ratings for all players who played on this date
  for (const pid of playerIds) {
    const rpr = newRatings.get(pid) ?? 1500;

    // Get player-specific volatility/momentum
    let playerVol = 0;
    let playerMom = 0;
    if (pid === player_id) {
      playerVol = vol;
      playerMom = mom;
    } else {
      // Fetch and compute for other players
      const { data: otherRounds } = await supabase
        .from("rounds")
        .select("*")
        .eq("player_id", pid)
        .order("date", { ascending: false });

      if (otherRounds) {
        const otherAdj = buildAdjustedRounds(otherRounds as Round[], courses);
        const otherScores = otherAdj.map((ar) => ar.adjustedScore);
        playerVol = volatilityIndex(otherScores);
        playerMom = momentum(otherScores);
      }
    }

    await supabase.from("ratings_history").insert({
      player_id: pid,
      date,
      rpr: Math.round(rpr * 100) / 100,
      volatility: Math.round(playerVol * 100) / 100,
      momentum: Math.round(playerMom * 100) / 100,
    });
  }

  // Compute impact data for the submitting player
  const oldRpr = currentRatings.get(player_id) ?? 1500;
  const newRpr = newRatings.get(player_id) ?? 1500;

  // Compute ranks
  const allPlayerIds = [...new Set([...currentRatings.keys(), ...newRatings.keys()])];
  const oldRanked = allPlayerIds
    .map((pid) => ({ pid, rpr: currentRatings.get(pid) ?? 1500 }))
    .sort((a, b) => b.rpr - a.rpr);
  const newRanked = allPlayerIds
    .map((pid) => ({ pid, rpr: newRatings.get(pid) ?? 1500 }))
    .sort((a, b) => b.rpr - a.rpr);
  const oldRank = oldRanked.findIndex((r) => r.pid === player_id) + 1;
  const newRank = newRanked.findIndex((r) => r.pid === player_id) + 1;

  // Shock classification
  const predicted = adjScores.length >= 2
    ? rollingWeightedAverage(adjScores.slice(1))
    : adjScores[0] ?? score;
  const shock = vol > 0 ? shockFactor(adjScores[0], predicted, vol) : 0;
  const shockClass = shockLabel(shock);

  // Performance state
  const careerAvg = careerAverage(adjScores);
  const recentForm = adjScores.length >= 3
    ? adjScores.slice(0, 3).reduce((a, b) => a + b, 0) / 3
    : careerAvg;
  const state = performanceState(mom, vol, recentForm, careerAvg);

  // Get player name
  const { data: playerData } = await supabase
    .from("players")
    .select("name")
    .eq("id", player_id)
    .single();

  return NextResponse.json({
    success: true,
    round,
    impact: {
      playerName: playerData?.name || "Unknown",
      oldRpr: Math.round(oldRpr * 100) / 100,
      newRpr: Math.round(newRpr * 100) / 100,
      rprDelta: Math.round((newRpr - oldRpr) * 100) / 100,
      oldRank,
      newRank,
      shockClassification: shockClass,
      performanceState: state,
      score,
    },
  });
}
