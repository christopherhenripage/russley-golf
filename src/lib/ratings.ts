import type { Round, Course, RatingSnapshot } from "@/lib/types";
import { adjustedScore, volatilityIndex, momentum } from "@/lib/analytics";

const K_FACTOR = 12;
const DEFAULT_RPR = 1500;

/**
 * Elo expected score: probability that player A beats player B.
 */
function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Update RPR ratings for all players after a round date.
 * Lower adjusted score = better performance.
 * Returns new ratings keyed by player ID.
 */
export function updateRatings(
  currentRatings: Map<string, number>,
  roundsOnDate: Round[],
  courses: Course[]
): Map<string, number> {
  const courseMap = new Map(courses.map((c) => [c.id, c]));
  const newRatings = new Map(currentRatings);

  // Calculate adjusted scores for each player in this round
  const playerScores: { playerId: string; adjScore: number }[] = [];
  for (const round of roundsOnDate) {
    const course = courseMap.get(round.course_id);
    if (!course) continue;
    playerScores.push({
      playerId: round.player_id,
      adjScore: adjustedScore(round.score, course.course_rating),
    });
  }

  if (playerScores.length < 2) return newRatings;

  // For each pair, compute Elo update. Lower score = win.
  for (let i = 0; i < playerScores.length; i++) {
    for (let j = i + 1; j < playerScores.length; j++) {
      const a = playerScores[i];
      const b = playerScores[j];

      const ratingA = currentRatings.get(a.playerId) ?? DEFAULT_RPR;
      const ratingB = currentRatings.get(b.playerId) ?? DEFAULT_RPR;

      const expectedA = expectedScore(ratingA, ratingB);
      const expectedB = 1 - expectedA;

      let actualA: number;
      let actualB: number;
      if (a.adjScore < b.adjScore) {
        actualA = 1;
        actualB = 0;
      } else if (a.adjScore > b.adjScore) {
        actualA = 0;
        actualB = 1;
      } else {
        actualA = 0.5;
        actualB = 0.5;
      }

      const deltaA = K_FACTOR * (actualA - expectedA);
      const deltaB = K_FACTOR * (actualB - expectedB);

      newRatings.set(
        a.playerId,
        (newRatings.get(a.playerId) ?? DEFAULT_RPR) + deltaA
      );
      newRatings.set(
        b.playerId,
        (newRatings.get(b.playerId) ?? DEFAULT_RPR) + deltaB
      );
    }
  }

  return newRatings;
}

/**
 * Build full rating history from scratch given all rounds and courses.
 * Returns rating snapshots for each date, incorporating volatility and momentum.
 */
export function buildRatingHistory(
  rounds: Round[],
  courses: Course[],
  playerIds: string[]
): RatingSnapshot[] {
  const courseMap = new Map(courses.map((c) => [c.id, c]));
  const currentRatings = new Map<string, number>();
  for (const pid of playerIds) {
    currentRatings.set(pid, DEFAULT_RPR);
  }

  // Group rounds by date, sorted chronologically
  const byDate = new Map<string, Round[]>();
  for (const r of rounds) {
    if (!byDate.has(r.date)) byDate.set(r.date, []);
    byDate.get(r.date)!.push(r);
  }
  const sortedDates = Array.from(byDate.keys()).sort();

  // Track all adjusted scores per player for volatility/momentum
  const allAdjScores = new Map<string, number[]>();
  for (const pid of playerIds) {
    allAdjScores.set(pid, []);
  }

  const snapshots: RatingSnapshot[] = [];

  for (const date of sortedDates) {
    const dateRounds = byDate.get(date)!;

    // Record adjusted scores
    for (const r of dateRounds) {
      const course = courseMap.get(r.course_id);
      if (!course) continue;
      const adj = adjustedScore(r.score, course.course_rating);
      const scores = allAdjScores.get(r.player_id);
      if (scores) scores.unshift(adj); // newest first
    }

    // Update ratings
    const updated = updateRatings(currentRatings, dateRounds, courses);
    for (const [pid, rating] of updated) {
      currentRatings.set(pid, rating);
    }

    // Create snapshots for players who played on this date
    const playersOnDate = new Set(dateRounds.map((r) => r.player_id));
    for (const pid of playersOnDate) {
      const scores = allAdjScores.get(pid) ?? [];
      snapshots.push({
        id: crypto.randomUUID(),
        player_id: pid,
        date,
        rpr: Math.round((currentRatings.get(pid) ?? DEFAULT_RPR) * 100) / 100,
        volatility: Math.round(volatilityIndex(scores) * 100) / 100,
        momentum: Math.round(momentum(scores) * 100) / 100,
      });
    }
  }

  return snapshots;
}
