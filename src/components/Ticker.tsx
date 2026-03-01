"use client";

import type { PlayerAnalytics, WeeklyRecap } from "@/lib/types";

function generatePlayerHeadlines(analytics: PlayerAnalytics[]): string[] {
  const headlines: string[] = [];
  const ranked = [...analytics].sort((a, b) => b.rpr - a.rpr);

  // Player-specific headlines
  for (const p of analytics) {
    if (p.performanceState === "Heater") {
      headlines.push(`🔥 ${p.playerName.toUpperCase()}'s RPR trajectory classified as "unsustainable" by three independent models`);
    }
    if (p.performanceState === "Chaos Merchant") {
      headlines.push(`🌪️ ALERT: ${p.playerName.toUpperCase()}'s Volatility Index has triggered a formal review by the Analytics Desk`);
    }
    if (p.performanceState === "Regression Watch") {
      headlines.push(`📉 DEVELOPING: ${p.playerName.toUpperCase()} enters Regression Watch — Momentum Vector negative for consecutive weeks`);
    }
    if (p.recentShock === "Historic Collapse") {
      headlines.push(`🚨 BREAKING: ${p.playerName.toUpperCase()}'s last round classified as HISTORIC COLLAPSE — Performance Forensics team deployed`);
    }
    if (p.recentShock === "Statistical Event") {
      headlines.push(`⚠️ ${p.playerName.toUpperCase()} generates Statistical Anomaly — prediction models scrambling to recalibrate`);
    }
  }

  // Leader-specific
  if (ranked[0]) {
    headlines.push(`🏆 ${ranked[0].playerName.toUpperCase()} maintains stranglehold on #1 — RPR ${ranked[0].rpr.toFixed(0)} — sources say rivals are "concerned"`);
  }

  // Rivalry headline
  if (ranked.length >= 2) {
    const gap = ranked[0].rpr - ranked[1].rpr;
    if (gap < 30) {
      headlines.push(`⚔️ TITLE RACE: Only ${gap.toFixed(0)} RPR separating ${ranked[0].playerName} and ${ranked[1].playerName} — the models are calling this "a coin flip with extra steps"`);
    }
  }

  return headlines;
}

const STATIC_HEADLINES = [
  "SOURCES: Performance Forensics Team has been deployed to Russley Golf Club",
  "BREAKING: Monte Carlo engine requests additional compute budget after latest results",
  "DEVELOPING: Psychological Warfare Division confirms 'things are getting personal'",
  "EXCLUSIVE: Senior analyst describes current RPR distribution as 'frankly threatening'",
  "REPORT: The algorithms are watching. The algorithms are always watching.",
  "UNCONFIRMED: A player's regression coefficient has achieved sentience and is 'asking questions'",
  "UPDATE: Course conditions classified as 'tactically hostile' by RSPI Intelligence Bureau",
  "ALERT: Three-putt on 18 triggers automatic recalculation of 847 statistical parameters",
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
    `RSPI POWER RANKING: ${ranked.map((p, i) => `#${i + 1} ${p.playerName}`).join(" | ")}`,
    ...playerHeadlines.slice(0, 4),
    recap.momentumCommentary,
    ...STATIC_HEADLINES.slice(0, 3),
    `VOLATILITY WATCH: ${highVol?.playerName || "N/A"} leads at ${highVol?.volatility.toFixed(2) || "0"}σ — models recalibrating`,
    ...recap.narratives.map((n) => n.substring(0, 140) + "..."),
  ];

  const tickerText = items.join("   ///   ");

  return (
    <div className="relative overflow-hidden bg-bg-surface border-y border-border py-2.5">
      <div className="flex items-center">
        <div className="shrink-0 flex items-center gap-1.5 px-4 border-r border-border mr-4">
          <div className="w-1.5 h-1.5 rounded-full bg-alert-red live-dot" />
          <span className="text-[9px] font-black tracking-[0.2em] text-alert-red uppercase">
            Live
          </span>
        </div>
        <div className="overflow-hidden whitespace-nowrap">
          <div className="ticker-scroll inline-block">
            <span className="text-[11px] text-text-secondary font-medium tracking-wide">
              {tickerText}&nbsp;&nbsp;&nbsp;///&nbsp;&nbsp;&nbsp;{tickerText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
