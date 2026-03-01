import type { SimulationResult } from "@/lib/types";

const NUM_SIMULATIONS = 10_000;

interface PlayerProfile {
  playerId: string;
  playerName: string;
  meanAdjustedScore: number;
  stdDev: number;
  bestAdjustedScore: number;
}

/**
 * Generate a normally distributed random number using Box-Muller transform.
 */
function randomNormal(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stdDev;
}

/**
 * Run Monte Carlo simulation for all players.
 * Simulates 10,000 future rounds and computes:
 * - Probability of finishing #1
 * - Probability of beating each other player
 * - Probability of personal best next round
 */
export function runSimulation(profiles: PlayerProfile[]): SimulationResult[] {
  if (profiles.length === 0) return [];

  // Track wins and head-to-head results
  const winCounts = new Map<string, number>();
  const beatCounts = new Map<string, Map<string, number>>();
  const pbCounts = new Map<string, number>();

  for (const p of profiles) {
    winCounts.set(p.playerId, 0);
    pbCounts.set(p.playerId, 0);
    beatCounts.set(p.playerId, new Map());
    for (const q of profiles) {
      if (p.playerId !== q.playerId) {
        beatCounts.get(p.playerId)!.set(q.playerId, 0);
      }
    }
  }

  for (let sim = 0; sim < NUM_SIMULATIONS; sim++) {
    // Simulate a score for each player
    const simScores: { playerId: string; score: number }[] = profiles.map(
      (p) => ({
        playerId: p.playerId,
        score: randomNormal(p.meanAdjustedScore, Math.max(p.stdDev, 1)),
      })
    );

    // Find winner (lowest score)
    let bestScore = Infinity;
    let winnerId = "";
    for (const s of simScores) {
      if (s.score < bestScore) {
        bestScore = s.score;
        winnerId = s.playerId;
      }
    }
    winCounts.set(winnerId, (winCounts.get(winnerId) ?? 0) + 1);

    // Head-to-head
    for (let i = 0; i < simScores.length; i++) {
      for (let j = i + 1; j < simScores.length; j++) {
        const a = simScores[i];
        const b = simScores[j];
        if (a.score < b.score) {
          beatCounts
            .get(a.playerId)!
            .set(
              b.playerId,
              (beatCounts.get(a.playerId)!.get(b.playerId) ?? 0) + 1
            );
        } else if (b.score < a.score) {
          beatCounts
            .get(b.playerId)!
            .set(
              a.playerId,
              (beatCounts.get(b.playerId)!.get(a.playerId) ?? 0) + 1
            );
        }
      }
    }

    // Personal best check
    for (const s of simScores) {
      const profile = profiles.find((p) => p.playerId === s.playerId)!;
      if (s.score < profile.bestAdjustedScore) {
        pbCounts.set(s.playerId, (pbCounts.get(s.playerId) ?? 0) + 1);
      }
    }
  }

  return profiles.map((p) => {
    const beatProbs: Record<string, number> = {};
    const beats = beatCounts.get(p.playerId)!;
    for (const [oppId, count] of beats) {
      beatProbs[oppId] =
        Math.round((count / NUM_SIMULATIONS) * 10000) / 100;
    }

    return {
      playerId: p.playerId,
      playerName: p.playerName,
      winProbability:
        Math.round(
          ((winCounts.get(p.playerId) ?? 0) / NUM_SIMULATIONS) * 10000
        ) / 100,
      beatProbabilities: beatProbs,
      personalBestProbability:
        Math.round(
          ((pbCounts.get(p.playerId) ?? 0) / NUM_SIMULATIONS) * 10000
        ) / 100,
    };
  });
}
