import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { buildAdjustedRounds, volatilityIndex, careerAverage } from "@/lib/analytics";
import { runSimulation } from "@/lib/simulation";
import type { Player, Course, Round } from "@/lib/types";

export async function GET() {
  const [playersRes, coursesRes, roundsRes] = await Promise.all([
    supabase.from("players").select("*"),
    supabase.from("courses").select("*"),
    supabase.from("rounds").select("*").order("date", { ascending: false }),
  ]);

  if (playersRes.error || coursesRes.error || roundsRes.error) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }

  const players = playersRes.data as Player[];
  const courses = coursesRes.data as Course[];
  const rounds = roundsRes.data as Round[];

  const profiles = players.map((player) => {
    const playerRounds = rounds.filter((r) => r.player_id === player.id);
    const adjustedRounds = buildAdjustedRounds(playerRounds, courses);
    const adjScores = adjustedRounds.map((ar) => ar.adjustedScore);

    return {
      playerId: player.id,
      playerName: player.name,
      meanAdjustedScore: careerAverage(adjScores),
      stdDev: volatilityIndex(adjScores),
      bestAdjustedScore: adjScores.length > 0 ? Math.min(...adjScores) : 100,
    };
  });

  const results = runSimulation(profiles);
  return NextResponse.json(results);
}
