"use client";

import type { PlayerAnalytics, WeeklyRecap } from "@/lib/types";

function generatePlayerHeadlines(analytics: PlayerAnalytics[]): string[] {
  const headlines: string[] = [];
  const ranked = [...analytics].sort((a, b) => b.rpr - a.rpr);

  for (const p of analytics) {
    if (p.performanceState === "Heater") {
      headlines.push(`🔥 BREAKING: ${p.playerName.toUpperCase()}'s RPR trajectory classified as "UNSUSTAINABLE" by three independent models. Analytics Desk cites "unprecedented thermal output."`);
    }
    if (p.performanceState === "Chaos Merchant") {
      headlines.push(`🌪️ ALERT: ${p.playerName.toUpperCase()}'s Volatility Index (${p.volatility.toFixed(2)}σ) has triggered FOUR separate circuit breakers. Our prediction models are "asking questions."`);
    }
    if (p.performanceState === "Regression Watch") {
      headlines.push(`📉 DEVELOPING: ${p.playerName.toUpperCase()} enters formal REGRESSION WATCH — Momentum Vector has been negative for consecutive weeks. The Performance Index does not forget.`);
    }
    if (p.recentShock === "Historic Collapse") {
      headlines.push(`🚨 HISTORIC COLLAPSE: ${p.playerName.toUpperCase()}'s last round triggered a >2σ deviation alert. Performance Forensics team has been deployed. This is not a drill.`);
    }
    if (p.recentShock === "Statistical Event") {
      headlines.push(`⚠️ STATISTICAL ANOMALY: ${p.playerName.toUpperCase()} generates data point that has broken the prediction model. Recalibration in progress.`);
    }
  }

  if (ranked[0]) {
    headlines.push(`🏆 ${ranked[0].playerName.toUpperCase()} maintains STRANGLEHOLD on #1 with RPR ${ranked[0].rpr.toFixed(0)} — sources close to the leaderboard say rivals are "deeply concerned"`);
  }

  if (ranked.length >= 2) {
    const gap = ranked[0].rpr - ranked[1].rpr;
    if (gap < 30) {
      headlines.push(`⚔️ TITLE RACE INTENSIFIES: Only ${gap.toFixed(0)} RPR points separate ${ranked[0].playerName} and ${ranked[1].playerName} — senior analysts describe this as "a knife fight in a phone booth"`);
    }
  }

  return headlines;
}

const SHAME_FAME = [
  "🚨 SOURCES: Performance Forensics Team deployed to Russley Golf Club after 'alarming data anomalies'",
  "📊 BREAKING: Monte Carlo engine requests emergency compute budget — '10,000 simulations were not enough'",
  "🧠 EXCLUSIVE: Psychological Warfare Division confirms rivalries have reached 'personal vendetta' classification",
  "⚠️ REPORT: Senior analyst describes current RPR distribution as 'a statistical crime scene'",
  "🔬 DEVELOPING: Three-putt on 18 triggers automatic recalculation of 847 statistical parameters across all models",
  "📡 ALERT: The algorithms are watching. The algorithms are ALWAYS watching. This has been a public service announcement.",
  "🧬 UNCONFIRMED: A player's regression coefficient has achieved sentience and is 'filing formal complaints'",
  "🌊 UPDATE: Course conditions reclassified from 'challenging' to 'TACTICALLY HOSTILE' by Intelligence Bureau",
];

export default function Ticker({
  recap,
  analytics,
}: {
  recap: WeeklyRecap;
  analytics: PlayerAnalytics[];
}) {
  const ranked = [...analytics].sort((a, b) => b.rpr - a.rpr);
  const highVol = [...analytics].sort((a, b) => b.volatility - a.volatility)[0];
  const playerHeadlines = generatePlayerHeadlines(analytics);

  const items = [
    `RSPI POWER RANKING: ${ranked.map((p, i) => `#${i + 1} ${p.playerName} (${p.rpr.toFixed(0)})`).join(" | ")}`,
    ...playerHeadlines,
    recap.momentumCommentary,
    ...SHAME_FAME,
    `VOLATILITY LEADERBOARD: ${highVol?.playerName || "N/A"} leads at ${highVol?.volatility.toFixed(2) || "0"}σ — models recalibrating — confidence intervals widened`,
    ...recap.narratives.map((n) => n.substring(0, 160) + "..."),
  ];

  const tickerText = items.join("     ///     ");

  return (
    <div className="relative overflow-hidden bg-bg-surface border-y-2 border-gold/30 py-3">
      <div className="flex items-center">
        {/* LIVE badge — large and bold */}
        <div className="shrink-0 flex items-center gap-2 px-5 border-r-2 border-gold/30 mr-5">
          <div className="w-3 h-3 rounded-full bg-alert-red live-dot" />
          <span className="text-[12px] font-black tracking-[0.2em] text-alert-red uppercase">
            Live
          </span>
        </div>
        {/* Scrolling text */}
        <div className="overflow-hidden whitespace-nowrap">
          <div className="ticker-scroll inline-block">
            <span className="text-[13px] text-text-secondary font-bold tracking-wide">
              {tickerText}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;///&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{tickerText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
