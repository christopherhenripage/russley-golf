import type { PlayerAnalytics, WeeklyRecap, Round } from "@/lib/types";

const ARCHETYPE_LABELS: Record<string, string> = {
  Heater: "THE FURNACE",
  "Stable Veteran": "THE TACTICIAN",
  "Ice Veins": "THE MACHINE",
  "Regression Watch": "THE REGRESSION CANDIDATE",
  "Chaos Merchant": "THE CHAOS MERCHANT",
};

const ARCHETYPE_DESCRIPTIONS: Record<string, string> = {
  Heater: "Operating at unsustainable levels of excellence. The analytics department has filed a formal inquiry.",
  "Stable Veteran": "Producing the kind of reliable tactical output that keeps the models comfortable.",
  "Ice Veins": "Volatility readings so low the instruments are being recalibrated. A statistical anomaly of consistency.",
  "Regression Watch": "The trend-lines are converging on a narrative no one wants to write.",
  "Chaos Merchant": "Generating data points that have broken three separate prediction models this quarter.",
};

/**
 * Generate a dramatic parody PGA-style weekly recap.
 * Uses deterministic templates with analytics injection.
 * Structured for future LLM API integration.
 */
export function generateWeeklyRecap(
  roundData: (Round & { player_name: string; course_name: string })[],
  analytics: PlayerAnalytics[]
): WeeklyRecap {
  if (roundData.length === 0) {
    return {
      headline: "BREAKING: TOTAL SILENCE FROM THE RSPI — No Intelligence Gathered This Week",
      narratives: [
        "The fairways of Russley lie dormant. The leaderboard, frozen in amber. Sources close to the Performance Index confirm that 'absolutely nothing of statistical significance has occurred.' The tension is, frankly, unbearable. Our Monte Carlo engine sits idle, its 10,000 simulations gathering digital dust. We can only speculate about what forces have conspired to produce this void in the data record.",
      ],
      momentumCommentary: "ALL MOMENTUM VECTORS: FLATLINED. The algorithms are watching. The algorithms are always watching.",
    };
  }

  const sorted = [...analytics].sort((a, b) => b.rpr - a.rpr);
  const topPlayer = sorted[0];
  const bottomPlayer = sorted[sorted.length - 1];

  const dayBest = [...roundData].sort((a, b) => a.score - b.score)[0];
  const dayWorst = [...roundData].sort((a, b) => b.score - a.score)[0];

  // Find biggest mover
  const movers = [...analytics].sort((a, b) => a.momentum - b.momentum);
  const biggestMover = movers[0];

  const headlines = [
    `BREAKING: ${topPlayer.playerName.toUpperCase()} MAINTAINS STRANGLEHOLD ON THE INDEX — Sources Say Rivals Are "Concerned"`,
    `ALERT: SEISMIC ACTIVITY DETECTED AT RUSSLEY — ${dayBest.player_name.toUpperCase()} FIRES A ${dayBest.score} AS PREDICTION MODELS SCRAMBLE`,
    `THE ${topPlayer.playerName.toUpperCase()} ERA: Week ${analytics[0]?.roundCount || "?"} of Calculated Dominance`,
    `RSPI EXCLUSIVE: ${dayBest.player_name.toUpperCase()} POSTS ${dayBest.score} — Volatility Index™ Readings "Off The Charts"`,
  ];
  const headline = headlines[roundData.length % headlines.length];

  const narratives: string[] = [];

  for (const rd of roundData) {
    const playerStats = analytics.find((a) => a.playerId === rd.player_id);
    if (!playerStats) continue;

    const archetype = ARCHETYPE_LABELS[playerStats.performanceState] || "UNCLASSIFIED";
    const shockText = playerStats.recentShock
      ? ` SHOCK CLASSIFICATION: "${playerStats.recentShock.toUpperCase()}".`
      : "";

    if (rd.player_id === dayBest.player_id) {
      narratives.push(
        `${rd.player_name} [${archetype}] commanded the theatre of competition with a tactical output of ${rd.score} at ${rd.course_name}. ` +
        `The RPR now reads ${playerStats.rpr.toFixed(0)} — a number that demands respect from every regression model in the building.${shockText} ` +
        `The Mean Tactical Output sits at ${playerStats.careerAverage.toFixed(1)}. Our senior analysts describe this as "${playerStats.volatility < 2 ? 'surgically precise' : 'aggressively volatile'}."`
      );
    } else if (rd.player_id === dayWorst.player_id) {
      narratives.push(
        `${rd.player_name} [${archetype}] recorded a ${rd.score} at ${rd.course_name}. ` +
        `The Volatility Index™ has been updated to ${playerStats.volatility.toFixed(2)}σ.${shockText} ` +
        `RPR: ${playerStats.rpr.toFixed(0)}. The performance forensics team has been notified. ` +
        `This is not a drill.`
      );
    } else {
      narratives.push(
        `${rd.player_name} [${archetype}] registered a Mean Tactical Output of ${rd.score} at ${rd.course_name}. ` +
        `RPR: ${playerStats.rpr.toFixed(0)}. Momentum Vector: ${playerStats.momentum.toFixed(2)}.${shockText} ` +
        `A data point that the models have classified as "${playerStats.recentShock || 'within operating parameters'}."`
      );
    }
  }

  // Momentum commentary
  const rising = analytics.filter((a) => a.momentum < -0.5).map((a) => a.playerName);
  const falling = analytics.filter((a) => a.momentum > 0.5).map((a) => a.playerName);

  let momentumCommentary = "MOMENTUM INTELLIGENCE REPORT: ";
  if (rising.length > 0) {
    momentumCommentary += `ASCENDING: ${rising.join(", ")} — The algorithms have flagged these trajectory vectors for priority monitoring. `;
  }
  if (falling.length > 0) {
    momentumCommentary += `REGRESSION WATCH: ${falling.join(", ")} — The Performance Index does not forget. The Performance Index does not forgive. `;
  }
  if (rising.length === 0 && falling.length === 0) {
    momentumCommentary +=
      "All momentum vectors in equilibrium. This level of statistical calm has not been observed since Week 1. " +
      "Our analysts have described the current state as 'the silence before the data speaks.'";
  }

  return { headline, narratives, momentumCommentary };
}

export { ARCHETYPE_LABELS, ARCHETYPE_DESCRIPTIONS };
