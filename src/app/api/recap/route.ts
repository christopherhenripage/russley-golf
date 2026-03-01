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
import { generateWeeklyRecap } from "@/lib/broadcast";
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

  const latestDate = rounds.length > 0 ? rounds[0].date : null;
  if (!latestDate) {
    return NextResponse.json(generateWeeklyRecap([], []));
  }

  const latestRounds = rounds.filter((r) => r.date === latestDate);
  const playerMap = new Map(players.map((p) => [p.id, p.name]));
  const courseMap = new Map(courses.map((c) => [c.id, c.name]));

  const roundData = latestRounds.map((r) => ({
    ...r,
    player_name: playerMap.get(r.player_id) ?? "Unknown",
    course_name: courseMap.get(r.course_id) ?? "Unknown",
  }));

  const analytics: PlayerAnalytics[] = players.map((player) => {
    const playerRounds = rounds.filter((r) => r.player_id === player.id);
    const adjustedRounds = buildAdjustedRounds(playerRounds, courses);
    const adjScores = adjustedRounds.map((ar) => ar.adjustedScore);

    const latestRating = ratingsHistory.find((r) => r.player_id === player.id);
    const rpr = latestRating?.rpr ?? 1500;
    const rollingAvg = rollingWeightedAverage(adjScores);
    const vol = volatilityIndex(adjScores);
    const mom = momentum(adjScores);
    const careerAvg = careerAverage(adjScores);

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

    return {
      playerId: player.id,
      playerName: player.name,
      rpr,
      rollingAverage: Math.round(rollingAvg * 100) / 100,
      volatility: Math.round(vol * 100) / 100,
      momentum: Math.round(mom * 100) / 100,
      performanceState: performanceState(mom, vol, recentForm, careerAvg),
      recentShock: recentShockLabel,
      titleOdds: 0,
      roundCount: playerRounds.length,
      careerAverage: Math.round(careerAvg * 100) / 100,
      bestAdjustedScore: adjScores.length > 0 ? Math.min(...adjScores) : 0,
    };
  });

  const recap = generateWeeklyRecap(roundData, analytics);
  return NextResponse.json(recap);
}
