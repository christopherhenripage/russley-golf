"use client";

import type { PlayerAnalytics, WeeklyRecap } from "@/lib/types";

const SHAME_FAME_HEADLINES = [
  "SOURCES: Performance Forensics Team Has Been Deployed To Russley",
  "BREAKING: Monte Carlo Engine Requests Additional Compute Budget After Latest Results",
  "DEVELOPING: One Player's Volatility Index Has Triggered Three Separate Circuit Breakers",
  "ALERT: The Psychological Warfare Division Confirms 'Things Are Getting Personal'",
  "EXCLUSIVE: Senior Analyst Describes Current RPR Distribution As 'Frankly Threatening'",
  "REPORT: The Algorithms Are Watching. The Algorithms Are Always Watching.",
  "UNCONFIRMED: A Player's Regression Coefficient Has Achieved Sentience",
  "UPDATE: Course Conditions Classified As 'Tactically Hostile' By Intelligence Bureau",
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

  const items = [
    `RSPI POWER RANKING: ${ranked.map((p, i) => `#${i + 1} ${p.playerName}`).join(" | ")}`,
    recap.momentumCommentary,
    ...SHAME_FAME_HEADLINES.slice(0, 3),
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
