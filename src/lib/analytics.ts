import type {
  Round,
  Course,
  AdjustedRound,
  ShockLabel,
  PerformanceState,
  CourseStats,
  RivalryRecord,
} from "@/lib/types";

/**
 * Compute adjusted score: RawScore - (CourseRating - 72)
 * Normalises scores to a par-72 baseline.
 */
export function adjustedScore(rawScore: number, courseRating: number): number {
  return rawScore - (courseRating - 72);
}

/**
 * Build adjusted rounds from raw rounds + course data.
 */
export function buildAdjustedRounds(
  rounds: Round[],
  courses: Course[]
): AdjustedRound[] {
  const courseMap = new Map(courses.map((c) => [c.id, c]));
  return rounds
    .map((r) => {
      const course = courseMap.get(r.course_id);
      if (!course) return null;
      return {
        round: r,
        course,
        adjustedScore: adjustedScore(r.score, course.course_rating),
      };
    })
    .filter((x): x is AdjustedRound => x !== null);
}

/**
 * Rolling weighted average of adjusted scores.
 * Most recent 5 rounds weighted 1.5x, older rounds weighted 1.0x.
 */
export function rollingWeightedAverage(adjustedScores: number[]): number {
  if (adjustedScores.length === 0) return 0;
  const sorted = [...adjustedScores];
  let totalWeight = 0;
  let weightedSum = 0;
  for (let i = 0; i < sorted.length; i++) {
    const weight = i < 5 ? 1.5 : 1.0;
    weightedSum += sorted[i] * weight;
    totalWeight += weight;
  }
  return weightedSum / totalWeight;
}

/**
 * Volatility Index™ — standard deviation of last 8 adjusted scores.
 */
export function volatilityIndex(adjustedScores: number[]): number {
  const recent = adjustedScores.slice(0, 8);
  if (recent.length < 2) return 0;
  const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
  const variance =
    recent.reduce((sum, s) => sum + (s - mean) ** 2, 0) / (recent.length - 1);
  return Math.sqrt(variance);
}

/**
 * Momentum — linear regression slope of last 5 adjusted scores.
 * Negative slope = improving (scores getting lower).
 */
export function momentum(adjustedScores: number[]): number {
  const recent = adjustedScores.slice(0, 5);
  if (recent.length < 2) return 0;
  const n = recent.length;
  const reversed = [...recent].reverse();
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += reversed[i];
    sumXY += i * reversed[i];
    sumXX += i * i;
  }
  return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
}

/**
 * Shock Factor for a single round.
 * Shock = (ActualAdjustedScore - PredictedScore) / Volatility
 */
export function shockFactor(
  actualAdjusted: number,
  predictedScore: number,
  volatility: number
): number {
  if (volatility === 0) return 0;
  return (actualAdjusted - predictedScore) / volatility;
}

/**
 * Label a shock factor value.
 */
export function shockLabel(shock: number): ShockLabel {
  const absShock = Math.abs(shock);
  if (absShock < 0.5) return "Expected";
  if (absShock < 1.0) return "Mild Disturbance";
  if (absShock < 2.0) return "Statistical Event";
  return "Historic Collapse";
}

/**
 * Determine performance archetype based on momentum, volatility, and recent form.
 * These are the broadcast-ready designations.
 */
export function performanceState(
  momentumVal: number,
  volatilityVal: number,
  recentAvg: number,
  careerAvg: number
): PerformanceState {
  const formDelta = recentAvg - careerAvg;

  // High volatility = The Chaos Merchant
  if (volatilityVal > 4) return "Chaos Merchant";

  // Strong negative momentum (improving rapidly) + good recent form = On Fire
  if (momentumVal < -1.0 && formDelta < 0) return "Heater";

  // Low volatility + ultra consistent = Ice Veins
  if (volatilityVal < 2.5 && Math.abs(momentumVal) < 0.5) return "Ice Veins";

  // Positive momentum (declining) + worse than average = Regression Watch
  if (momentumVal > 0.8 && formDelta > 1) return "Regression Watch";

  return "Stable Veteran";
}

/**
 * Career average of adjusted scores.
 */
export function careerAverage(adjustedScores: number[]): number {
  if (adjustedScores.length === 0) return 0;
  return adjustedScores.reduce((a, b) => a + b, 0) / adjustedScores.length;
}

/**
 * Psychological Edge Index™ — head-to-head dominance metric.
 * Combines win rate, stroke differential, and consistency of victory.
 * Range: -100 (completely dominated) to +100 (total dominance).
 */
export function psychologicalEdge(
  winPct: number,
  avgStrokeDiff: number,
  totalRounds: number
): number {
  if (totalRounds === 0) return 0;
  // Win rate component: (winPct - 50) scaled to [-50, 50]
  const winComponent = (winPct - 50);
  // Stroke diff component: capped at +/-10, scaled to [-50, 50]
  const strokeComponent = Math.max(-10, Math.min(10, -avgStrokeDiff)) * 5;
  // Confidence multiplier: more rounds = more reliable (caps at 1.0 after 5 rounds)
  const confidence = Math.min(1.0, totalRounds / 5);
  return Math.round((winComponent * 0.6 + strokeComponent * 0.4) * confidence);
}

/**
 * Average score per course per player.
 */
export function courseStatsForPlayer(
  adjustedRounds: AdjustedRound[]
): CourseStats[] {
  const grouped = new Map<string, { name: string; scores: number[] }>();
  for (const ar of adjustedRounds) {
    const key = ar.course.id;
    if (!grouped.has(key)) {
      grouped.set(key, { name: ar.course.name, scores: [] });
    }
    grouped.get(key)!.scores.push(ar.round.score);
  }
  return Array.from(grouped.entries()).map(([courseId, { name, scores }]) => ({
    courseId,
    courseName: name,
    averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
    roundsPlayed: scores.length,
  }));
}

/**
 * Home Course Index: ratio of home course rounds to total rounds.
 */
export function homeCourseIndex(
  adjustedRounds: AdjustedRound[],
  homeCourseId: string
): number {
  if (adjustedRounds.length === 0) return 0;
  const homeRounds = adjustedRounds.filter(
    (ar) => ar.course.id === homeCourseId
  ).length;
  return homeRounds / adjustedRounds.length;
}

/**
 * Course Adaptability Rating: inverse of standard deviation across course averages.
 * Higher = more adaptable (consistent across courses).
 */
export function courseAdaptability(courseStats: CourseStats[]): number {
  if (courseStats.length < 2) return 100;
  const avgs = courseStats.map((cs) => cs.averageScore);
  const mean = avgs.reduce((a, b) => a + b, 0) / avgs.length;
  const variance =
    avgs.reduce((sum, a) => sum + (a - mean) ** 2, 0) / (avgs.length - 1);
  const stdev = Math.sqrt(variance);
  return Math.max(0, 100 - stdev * 10);
}

/**
 * Build rivalry matrix for all player pairs from shared rounds (same date).
 */
export function buildRivalryMatrix(
  rounds: Round[],
  courses: Course[],
  players: { id: string; name: string }[]
): RivalryRecord[] {
  const courseMap = new Map(courses.map((c) => [c.id, c]));
  const playerMap = new Map(players.map((p) => [p.id, p.name]));
  const rivalries: RivalryRecord[] = [];

  const byDate = new Map<string, Round[]>();
  for (const r of rounds) {
    if (!byDate.has(r.date)) byDate.set(r.date, []);
    byDate.get(r.date)!.push(r);
  }

  const playerIds = players.map((p) => p.id);
  for (let i = 0; i < playerIds.length; i++) {
    for (let j = i + 1; j < playerIds.length; j++) {
      const a = playerIds[i];
      const b = playerIds[j];
      let aWins = 0;
      let bWins = 0;
      let totalDiff = 0;
      let matchCount = 0;

      for (const [, dateRounds] of byDate) {
        const roundA = dateRounds.find((r) => r.player_id === a);
        const roundB = dateRounds.find((r) => r.player_id === b);
        if (!roundA || !roundB) continue;

        const courseA = courseMap.get(roundA.course_id);
        const courseB = courseMap.get(roundB.course_id);
        if (!courseA || !courseB) continue;

        const adjA = adjustedScore(roundA.score, courseA.course_rating);
        const adjB = adjustedScore(roundB.score, courseB.course_rating);

        matchCount++;
        totalDiff += adjA - adjB;
        if (adjA < adjB) aWins++;
        else if (adjB < adjA) bWins++;
      }

      if (matchCount > 0) {
        const aWinPct = (aWins / matchCount) * 100;
        const avgDiff = totalDiff / matchCount;
        rivalries.push({
          playerAId: a,
          playerBId: b,
          playerAName: playerMap.get(a) || "Unknown",
          playerBName: playerMap.get(b) || "Unknown",
          playerAWinPct: aWinPct,
          avgStrokeDifferential: avgDiff,
          totalRounds: matchCount,
          psychEdgeA: psychologicalEdge(aWinPct, avgDiff, matchCount),
        });
      }
    }
  }

  return rivalries;
}
