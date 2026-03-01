import { NextRequest, NextResponse } from "next/server";
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
  courseStatsForPlayer,
  homeCourseIndex,
  courseAdaptability,
  buildRivalryMatrix,
} from "@/lib/analytics";
import type { Player, Course, Round, RatingSnapshot } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [playerRes, coursesRes, roundsRes, ratingsRes, allPlayersRes, allRoundsRes] =
    await Promise.all([
      supabase.from("players").select("*").eq("id", id).single(),
      supabase.from("courses").select("*"),
      supabase
        .from("rounds")
        .select("*")
        .eq("player_id", id)
        .order("date", { ascending: false }),
      supabase
        .from("ratings_history")
        .select("*")
        .eq("player_id", id)
        .order("date", { ascending: false }),
      supabase.from("players").select("id, name"),
      supabase.from("rounds").select("*").order("date", { ascending: false }),
    ]);

  if (playerRes.error || coursesRes.error || roundsRes.error) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  const player = playerRes.data as Player;
  const courses = coursesRes.data as Course[];
  const playerRounds = roundsRes.data as Round[];
  const allPlayers = (allPlayersRes.data ?? []) as { id: string; name: string }[];
  const allRounds = (allRoundsRes.data ?? []) as Round[];

  const adjustedRounds = buildAdjustedRounds(playerRounds, courses);
  const adjScores = adjustedRounds.map((ar) => ar.adjustedScore);

  const ratingsData = (ratingsRes.data ?? []) as RatingSnapshot[];
  const latestRating = ratingsData[0];
  const rpr = latestRating?.rpr ?? 1500;
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

  // Course intelligence
  const courseStats = courseStatsForPlayer(adjustedRounds);
  // Russley is the home course
  const russleyCourse = courses.find((c) =>
    c.name.toLowerCase().includes("russley")
  );
  const homeIndex = russleyCourse
    ? homeCourseIndex(adjustedRounds, russleyCourse.id)
    : 0;
  const adaptability = courseAdaptability(courseStats);

  // Rivalry matrix for this player
  const rivalries = buildRivalryMatrix(allRounds, courses, allPlayers).filter(
    (r) => r.playerAId === id || r.playerBId === id
  );

  // Rating history
  const ratingHistory = ratingsData;

  // Round history with course names
  const courseMap = new Map(courses.map((c) => [c.id, c]));
  const roundHistory = playerRounds.map((r) => {
    const course = courseMap.get(r.course_id);
    return {
      ...r,
      courseName: course?.name ?? "Unknown",
      adjustedScore: course
        ? r.score - (course.course_rating - 72)
        : r.score,
    };
  });

  return NextResponse.json({
    player,
    analytics: {
      rpr,
      rollingAverage: Math.round(rollingAvg * 100) / 100,
      volatility: Math.round(vol * 100) / 100,
      momentum: Math.round(mom * 100) / 100,
      performanceState: state,
      recentShock: recentShockLabel,
      careerAverage: Math.round(careerAvg * 100) / 100,
      bestAdjustedScore: bestAdj,
      roundCount: playerRounds.length,
    },
    courseStats,
    courseIntelligence: {
      homeCourseIndex: Math.round(homeIndex * 100),
      courseAdaptability: Math.round(adaptability),
    },
    rivalries,
    ratingHistory,
    roundHistory,
  });
}
