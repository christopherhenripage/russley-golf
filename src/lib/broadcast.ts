import type { PlayerAnalytics, WeeklyRecap, Round, Course } from "@/lib/types";

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
      headline: "Silence at Russley: No Rounds Recorded This Week",
      narratives: ["The course stands empty. The leaderboard unchanged. The tension... unbearable."],
      momentumCommentary: "All players remain in a holding pattern. One can only wonder what forces are at play behind closed doors.",
    };
  }

  // Find the best performer this round
  const sorted = [...analytics].sort((a, b) => b.rpr - a.rpr);
  const topPlayer = sorted[0];
  const bottomPlayer = sorted[sorted.length - 1];

  // Find who played best on the day (lowest score in round data)
  const dayBest = [...roundData].sort((a, b) => a.score - b.score)[0];
  const dayWorst = [...roundData].sort((a, b) => b.score - a.score)[0];

  // Generate headline
  const headlines = [
    `${topPlayer.playerName} Maintains Iron Grip on the Index — But For How Long?`,
    `Seismic Shift at Russley: ${dayBest.player_name} Fires a ${dayBest.score} to Shake the Power Rankings`,
    `The ${topPlayer.playerName} Era Continues: A Masterclass in Senior Performance`,
    `Russley Witnesses History: ${dayBest.player_name} Posts ${dayBest.score} as Rivals Crumble`,
  ];
  const headline = headlines[roundData.length % headlines.length];

  // Generate player narratives
  const narratives: string[] = [];

  for (const rd of roundData) {
    const playerStats = analytics.find((a) => a.playerId === rd.player_id);
    if (!playerStats) continue;

    const stateEmoji = getStateEmoji(playerStats.performanceState);
    const shockText = playerStats.recentShock
      ? ` This round has been classified as: "${playerStats.recentShock}".`
      : "";

    if (rd.player_id === dayBest.player_id) {
      narratives.push(
        `${stateEmoji} ${rd.player_name} led the field with a commanding ${rd.score} at ${rd.course_name}. ` +
        `RPR now sits at ${playerStats.rpr.toFixed(0)} with volatility at ${playerStats.volatility.toFixed(1)}.${shockText} ` +
        `The performance analytics team is running additional models to determine if this is sustainable.`
      );
    } else if (rd.player_id === dayWorst.player_id) {
      narratives.push(
        `${stateEmoji} ${rd.player_name} posted a ${rd.score} at ${rd.course_name} — a result that will require ` +
        `careful examination by the analytics department.${shockText} ` +
        `Current RPR: ${playerStats.rpr.toFixed(0)}. The regression models are... concerned.`
      );
    } else {
      narratives.push(
        `${stateEmoji} ${rd.player_name} registered a ${rd.score} at ${rd.course_name}. ` +
        `RPR: ${playerStats.rpr.toFixed(0)}. Momentum index: ${playerStats.momentum.toFixed(2)}.${shockText} ` +
        `A performance that neither excites nor alarms the statistical models.`
      );
    }
  }

  // Momentum commentary
  const rising = analytics
    .filter((a) => a.momentum < -0.5)
    .map((a) => a.playerName);
  const falling = analytics
    .filter((a) => a.momentum > 0.5)
    .map((a) => a.playerName);

  let momentumCommentary = "";
  if (rising.length > 0) {
    momentumCommentary += `📈 Trending upward: ${rising.join(", ")}. The algorithms are paying attention. `;
  }
  if (falling.length > 0) {
    momentumCommentary += `📉 On notice: ${falling.join(", ")}. The Performance Index does not forget. `;
  }
  if (rising.length === 0 && falling.length === 0) {
    momentumCommentary =
      "The momentum indicators show remarkable equilibrium across the field. " +
      "A calm before the storm, perhaps. The models remain vigilant.";
  }

  return { headline, narratives, momentumCommentary };
}

function getStateEmoji(state: string): string {
  switch (state) {
    case "Heater": return "🔥";
    case "Stable Veteran": return "⚖️";
    case "Ice Veins": return "🧊";
    case "Regression Watch": return "📉";
    case "Chaos Merchant": return "🌪️";
    default: return "⛳";
  }
}
