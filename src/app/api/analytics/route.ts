import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  buildAdjustedRounds,
  rollingWeightedAverage,
  volatilityIndex,
  momentum,
  shockFactor,
  shockLabel,
  performanceState,
  careerAverage,
} from "@/lib/analytics";
import type { Player, Course, Round, RatingSnapshot, PlayerAnalytics } from "@/lib/types";

export async function GET() {
  const [playersRes, coursesRes, roundsRes, ratingsRes] = await Promise.all([
    supabase.from("players").select("*"),
    supabase.from("courses").select("*"),
    supabase.from("rounds").select("*").order("date", { ascending: false }),
    supabase.from("ratings_history").select("*").order("date", { ascending: false }),
  ]);

  if (playersRes.error || coursesRes.error || roundsRes.error || ratingsRes.error) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }

  const players = playersRes.data as Player[];
  const courses = coursesRes.data as Course[];
  const rounds = roundsRes.data as Round[];
  const ratingsHistory = ratingsRes.data as RatingSnapshot[];

  // Group rating history by player (already sorted desc by date)
  const rprHistoryByPlayer = new Map<string, number[]>();
  for (const rh of ratingsHistory) {
    if (!rprHistoryByPlayer.has(rh.player_id)) {
      rprHistoryByPlayer.set(rh.player_id, []);
    }
    const arr = rprHistoryByPlayer.get(rh.player_id)!;
    if (arr.length < 10) arr.push(rh.rpr);
  }

  const analytics: PlayerAnalytics[] = players.map((player) => {
    const playerRounds = rounds.filter((r) => r.player_id === player.id);
    const adjustedRounds = buildAdjustedRounds(playerRounds, courses);
    const adjScores = adjustedRounds.map((ar) => ar.adjustedScore);

    const latestRating = ratingsHistory.find((r) => r.player_id === player.id);
    const rpr = latestRating?.rpr ?? 1500;
    const recentRprHistory = (rprHistoryByPlayer.get(player.id) || [1500]).reverse();

    const rollingAvg = rollingWeightedAverage(adjScores);
    const vol = volatilityIndex(adjScores);
    const mom = momentum(adjScores);
    const careerAvg = careerAverage(adjScores);
    const bestAdj = adjScores.length > 0 ? Math.min(...adjScores) : 0;

    let recentShockLabel = null;
    if (adjScores.length >= 2) {
      const predicted = rollingWeightedAverage(adjScores.slice(1));
      const shock = shockFactor(adjScores[0], predicted, vol);
      recentShockLabel = shockLabel(shock);
    }

    const recentForm =
      adjScores.length >= 3
        ? adjScores.slice(0, 3).reduce((a, b) => a + b, 0) / 3
        : careerAvg;

    const state = performanceState(mom, vol, recentForm, careerAvg);

    return {
      playerId: player.id,
      playerName: player.name,
      rpr,
      rollingAverage: Math.round(rollingAvg * 100) / 100,
      volatility: Math.round(vol * 100) / 100,
      momentum: Math.round(mom * 100) / 100,
      performanceState: state,
      recentShock: recentShockLabel,
      titleOdds: 0,
      roundCount: playerRounds.length,
      careerAverage: Math.round(careerAvg * 100) / 100,
      bestAdjustedScore: bestAdj,
      recentRprHistory,
    };
  });

  return NextResponse.json(analytics);
}
