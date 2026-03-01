"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { PlayerAnalytics, SimulationResult, WeeklyRecap } from "@/lib/types";

// === ARCHETYPE SYSTEM ===
const ARCHETYPE_CONFIG: Record<string, { icon: string; label: string; color: string; cssClass: string }> = {
  Heater:           { icon: "🔥", label: "THE FURNACE",              color: "text-hot-orange",    cssClass: "momentum-heater" },
  "Stable Veteran": { icon: "⚖️",  label: "THE TACTICIAN",           color: "text-gold",          cssClass: "" },
  "Ice Veins":      { icon: "🧊", label: "THE MACHINE",             color: "text-ice-blue",      cssClass: "momentum-ice" },
  "Regression Watch":{ icon: "📉", label: "THE REGRESSION CANDIDATE", color: "text-accent-red",    cssClass: "momentum-decline" },
  "Chaos Merchant": { icon: "🌪️", label: "THE CHAOS MERCHANT",       color: "text-chaos-purple",  cssClass: "" },
};

const SHOCK_CONFIG: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  Expected:          { bg: "bg-perf-green/5",  border: "border-perf-green/20",  text: "text-perf-green/70",  glow: "" },
  "Mild Disturbance":{ bg: "bg-gold/5",        border: "border-gold/20",        text: "text-gold",           glow: "" },
  "Statistical Event":{ bg: "bg-hot-orange/8",  border: "border-hot-orange/30",  text: "text-hot-orange",     glow: "shadow-[0_0_15px_rgba(255,107,0,0.15)]" },
  "Historic Collapse":{ bg: "bg-alert-red/10",  border: "border-alert-red/40",   text: "text-alert-red",      glow: "shadow-[0_0_20px_rgba(255,0,0,0.2)]" },
};

// === SUB-COMPONENTS ===

function MomentumIndicator({ value, state }: { value: number; state: string }) {
  const cfg = ARCHETYPE_CONFIG[state] || ARCHETYPE_CONFIG["Stable Veteran"];
  if (value < -0.5) {
    return (
      <span className={`inline-flex items-center gap-1 text-perf-green ${cfg.cssClass}`} title={`Momentum: ${value.toFixed(2)}`}>
        <span className="text-lg">▲</span>
        <span className="text-[10px] font-black tracking-wider">HOT</span>
      </span>
    );
  }
  if (value > 0.5) {
    return (
      <span className={`inline-flex items-center gap-1 text-accent-red momentum-decline`} title={`Momentum: ${value.toFixed(2)}`}>
        <span className="text-lg">▼</span>
        <span className="text-[10px] font-black tracking-wider">COLD</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-text-muted" title={`Momentum: ${value.toFixed(2)}`}>
      <span className="text-sm">━</span>
      <span className="text-[10px] font-black tracking-wider">HOLD</span>
    </span>
  );
}

function ArchetypeBadge({ state }: { state: string }) {
  const cfg = ARCHETYPE_CONFIG[state] || ARCHETYPE_CONFIG["Stable Veteran"];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black tracking-[0.12em] uppercase ${cfg.color}`}>
      <span className={cfg.cssClass}>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

function ShockAlert({ label }: { label: string | null }) {
  if (!label || label === "Expected") return null;
  const cfg = SHOCK_CONFIG[label] || SHOCK_CONFIG["Expected"];
  const isHistoric = label === "Historic Collapse";
  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black tracking-[0.1em] uppercase
      border ${cfg.bg} ${cfg.border} ${cfg.text} ${cfg.glow}
      ${isHistoric ? "shock-alert-pulse" : ""}
    `}>
      {isHistoric && <span className="w-1.5 h-1.5 rounded-full bg-alert-red live-dot" />}
      {label === "Historic Collapse" ? "HISTORIC COLLAPSE" :
       label === "Statistical Event" ? "STATISTICAL ANOMALY" :
       label}
    </span>
  );
}

function NewsTicker({ recap, analytics }: { recap: WeeklyRecap; analytics: PlayerAnalytics[] }) {
  const ranked = [...analytics].sort((a, b) => b.rpr - a.rpr);
  const items = [
    `RSPI POWER RANKING: ${ranked.map((p, i) => `#${i + 1} ${p.playerName}`).join(" | ")}`,
    recap.momentumCommentary,
    ...recap.narratives.map((n) => n.substring(0, 120) + "..."),
    `VOLATILITY REPORT: Highest σ = ${[...analytics].sort((a, b) => b.volatility - a.volatility)[0]?.playerName || "N/A"} (${[...analytics].sort((a, b) => b.volatility - a.volatility)[0]?.volatility.toFixed(2) || "0"}σ)`,
  ];
  const tickerText = items.join("   ///   ");
  return (
    <div className="relative overflow-hidden bg-bg-surface border-y border-border py-2">
      <div className="flex items-center">
        <div className="shrink-0 flex items-center gap-1.5 px-4 border-r border-border mr-4">
          <div className="w-1.5 h-1.5 rounded-full bg-alert-red live-dot" />
          <span className="text-[9px] font-black tracking-[0.2em] text-alert-red uppercase">Ticker</span>
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

// === MAIN DASHBOARD ===

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<PlayerAnalytics[]>([]);
  const [simulation, setSimulation] = useState<SimulationResult[]>([]);
  const [recap, setRecap] = useState<WeeklyRecap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/analytics").then((r) => r.json()),
      fetch("/api/simulation").then((r) => r.json()),
      fetch("/api/recap").then((r) => r.json()),
    ]).then(([analyticsData, simData, recapData]) => {
      const simMap = new Map(
        (simData as SimulationResult[]).map((s) => [s.playerId, s.winProbability])
      );
      const merged = (analyticsData as PlayerAnalytics[]).map((a) => ({
        ...a,
        titleOdds: simMap.get(a.playerId) ?? 0,
      }));
      setAnalytics(merged);
      setSimulation(simData);
      setRecap(recapData);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-5xl mb-6">🏆</div>
          <div className="text-gold font-black text-sm tracking-[0.3em] uppercase mb-2">
            Performance Index Loading
          </div>
          <div className="text-text-muted text-[10px] tracking-[0.2em] uppercase">
            Crunching 10,000 Monte Carlo Simulations
          </div>
          <div className="mt-6 w-48 h-0.5 bg-border mx-auto overflow-hidden">
            <motion.div
              className="h-full bg-gold"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  const ranked = [...analytics].sort((a, b) => b.rpr - a.rpr);
  const leader = ranked[0];

  // Analytics Desk data
  const biggestMover = [...analytics].sort((a, b) => a.momentum - b.momentum)[0];
  const highestVolatility = [...analytics].sort((a, b) => b.volatility - a.volatility)[0];

  // Find biggest rivalry (closest title odds)
  const sortedByOdds = [...analytics].sort((a, b) => b.titleOdds - a.titleOdds);
  const rivalryA = sortedByOdds[0];
  const rivalryB = sortedByOdds[1];

  return (
    <div className="space-y-0">
      {/* NEWS TICKER */}
      {recap && <NewsTicker recap={recap} analytics={analytics} />}

      {/* SHOCK ALERTS — only show for Historic Collapse or Statistical Event */}
      <AnimatePresence>
        {analytics.filter((a) => a.recentShock === "Historic Collapse" || a.recentShock === "Statistical Event").map((a) => (
          <motion.div
            key={`shock-${a.playerId}`}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className={`
              shock-alert mx-0 mt-4 p-4 border-l-4
              ${a.recentShock === "Historic Collapse"
                ? "border-l-alert-red bg-alert-red/5"
                : "border-l-hot-orange bg-hot-orange/5"
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-alert-red flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-alert-red live-dot" />
                  Shock Alert
                </span>
                <span className="text-sm font-bold">{a.playerName}</span>
                <ShockAlert label={a.recentShock} />
              </div>
              <span className="text-text-muted text-[10px] tracking-wider uppercase">
                Deviation from predicted Mean Tactical Output
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="mt-6 space-y-6">
        {/* BROADCAST HEADLINE */}
        {recap && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="card-broadcast glow-gold p-6 rounded-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="section-label">State of the Tour</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <h2 className="text-xl md:text-2xl font-black leading-tight tracking-tight mb-5">
              {recap.headline}
            </h2>
            <div className="space-y-4">
              {recap.narratives.map((n, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                  className="text-text-secondary text-sm leading-relaxed"
                >
                  {n}
                </motion.p>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-border">
              <p className="text-[11px] text-text-muted italic leading-relaxed tracking-wide">
                {recap.momentumCommentary}
              </p>
            </div>
          </motion.section>
        )}

        {/* ANALYTICS DESK */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Biggest Mover */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card-broadcast rounded-sm p-5"
          >
            <span className="section-label">Biggest Mover</span>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-3xl momentum-heater">🚀</span>
              <div>
                <div className="font-black text-lg">{biggestMover?.playerName || "—"}</div>
                <div className="text-perf-green text-xs font-bold tracking-wider">
                  MOMENTUM: {biggestMover?.momentum.toFixed(2) || "0"}
                </div>
              </div>
            </div>
            <p className="text-text-muted text-[10px] mt-3 tracking-wide leading-relaxed uppercase">
              Trajectory analysis confirms significant directional shift in Mean Tactical Output.
            </p>
          </motion.div>

          {/* Highest Volatility */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="card-broadcast rounded-sm p-5"
          >
            <span className="section-label">Volatility Alert</span>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-3xl">🌪️</span>
              <div>
                <div className="font-black text-lg">{highestVolatility?.playerName || "—"}</div>
                <div className="text-chaos-purple text-xs font-bold tracking-wider">
                  σ = {highestVolatility?.volatility.toFixed(2) || "0"}
                </div>
              </div>
            </div>
            <p className="text-text-muted text-[10px] mt-3 tracking-wide leading-relaxed uppercase">
              Prediction confidence interval has been widened. The models are struggling.
            </p>
          </motion.div>

          {/* Rivalry of the Week */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="card-broadcast rounded-sm p-5"
          >
            <span className="section-label">Rivalry Watch</span>
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="font-black text-lg">{rivalryA?.playerName || "—"}</div>
                  <div className="text-gold text-xs font-bold">{rivalryA?.titleOdds.toFixed(1)}%</div>
                </div>
                <div className="text-text-muted font-black text-lg px-3">vs</div>
                <div className="text-center flex-1">
                  <div className="font-black text-lg">{rivalryB?.playerName || "—"}</div>
                  <div className="text-gold text-xs font-bold">{rivalryB?.titleOdds.toFixed(1)}%</div>
                </div>
              </div>
            </div>
            <p className="text-text-muted text-[10px] mt-3 tracking-wide leading-relaxed uppercase">
              The Psychological Edge Index™ is being recalculated in real time.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* === POWER RANKINGS TABLE === */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-2 card-broadcast glow-gold rounded-sm overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 pt-5 pb-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="section-label">Power Rankings</span>
                </div>
                <span className="text-[9px] text-text-muted tracking-[0.15em] uppercase">
                  Sorted by Russley Performance Rating™
                </span>
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-[3rem_1fr_5rem_5rem_6rem_5rem] gap-2 px-6 py-2 text-[9px] font-bold tracking-[0.15em] uppercase text-text-muted border-b border-border">
              <div>#</div>
              <div>Competitor</div>
              <div className="text-right">RPR</div>
              <div className="text-right">MTO</div>
              <div className="text-right">Win %</div>
              <div className="text-right">Vol σ</div>
            </div>

            {/* Rows */}
            <div>
              {ranked.map((player, index) => (
                <motion.div
                  key={player.playerId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.08 }}
                >
                  <Link
                    href={`/player/${player.playerId}`}
                    className={`
                      grid grid-cols-[3rem_1fr_5rem_5rem_6rem_5rem] gap-2 items-center px-6 py-4
                      ${index === 0 ? "leaderboard-row-leader" : "leaderboard-row"}
                      group cursor-pointer
                    `}
                  >
                    {/* Rank */}
                    <div className={index === 0 ? "rank-number-leader" : "rank-number"}>
                      {index + 1}
                    </div>

                    {/* Player Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-base group-hover:text-gold transition-colors tracking-tight">
                          {player.playerName}
                        </span>
                        <MomentumIndicator value={player.momentum} state={player.performanceState} />
                        <ShockAlert label={player.recentShock} />
                      </div>
                      <ArchetypeBadge state={player.performanceState} />
                    </div>

                    {/* RPR */}
                    <div className="text-right">
                      <span className="text-gold font-black text-lg tabular-nums tracking-tight">
                        {player.rpr.toFixed(0)}
                      </span>
                    </div>

                    {/* Mean Tactical Output */}
                    <div className="text-right">
                      <span className="font-bold tabular-nums text-sm">
                        {player.rollingAverage.toFixed(1)}
                      </span>
                    </div>

                    {/* Win Probability */}
                    <div className="text-right">
                      <span className={`font-black tabular-nums text-sm ${player.titleOdds > 30 ? "text-perf-green" : player.titleOdds > 15 ? "text-gold" : "text-text-secondary"}`}>
                        {player.titleOdds.toFixed(1)}%
                      </span>
                    </div>

                    {/* Volatility */}
                    <div className="text-right">
                      <span className={`font-bold tabular-nums text-sm ${player.volatility > 4 ? "text-chaos-purple" : "text-text-secondary"}`}>
                        {player.volatility.toFixed(2)}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-border">
              <p className="text-[9px] text-text-muted tracking-[0.15em] uppercase">
                MTO = Mean Tactical Output (Course-Normalised) | Win % via 10,000 Monte Carlo Simulations | σ = Volatility Index™
              </p>
            </div>
          </motion.section>

          {/* === SIDEBAR === */}
          <div className="space-y-5">
            {/* Title Odds Distribution */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="card-broadcast rounded-sm p-5"
            >
              <div className="flex items-center gap-2 mb-5">
                <span className="section-label">Title Probability</span>
              </div>
              <div className="space-y-4">
                {[...analytics]
                  .sort((a, b) => b.titleOdds - a.titleOdds)
                  .map((player) => (
                    <div key={player.playerId}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold tracking-wide">{player.playerName}</span>
                        <span className="text-gold font-black tabular-nums text-sm">
                          {player.titleOdds.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-gold-dark to-gold rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(player.titleOdds, 100)}%` }}
                          transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
              <p className="text-[9px] text-text-muted mt-4 tracking-wide uppercase">
                Based on 10,000 simulated season outcomes
              </p>
            </motion.section>

            {/* Volatility Rankings */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="card-broadcast rounded-sm p-5"
            >
              <div className="flex items-center gap-2 mb-5">
                <span className="section-label">Volatility Index™</span>
              </div>
              <div className="space-y-3">
                {[...analytics].sort((a, b) => b.volatility - a.volatility).map((player, index) => (
                  <div key={player.playerId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-text-muted text-[10px] font-bold tabular-nums w-3">
                        {index + 1}
                      </span>
                      <span className="text-xs font-semibold">{player.playerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1 bg-border rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${player.volatility > 4 ? "bg-chaos-purple" : player.volatility > 2.5 ? "bg-hot-orange" : "bg-perf-green/50"}`}
                          style={{ width: `${Math.min((player.volatility / 6) * 100, 100)}%` }}
                        />
                      </div>
                      <span className={`tabular-nums text-xs font-bold w-8 text-right ${player.volatility > 4 ? "text-chaos-purple" : "text-text-secondary"}`}>
                        {player.volatility.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Archetype Classification */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="card-broadcast rounded-sm p-5"
            >
              <div className="flex items-center gap-2 mb-5">
                <span className="section-label">Archetype Classification</span>
              </div>
              <div className="space-y-3">
                {analytics.map((player) => (
                  <div key={player.playerId} className="flex items-center justify-between">
                    <span className="text-xs font-semibold">{player.playerName}</span>
                    <ArchetypeBadge state={player.performanceState} />
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-text-muted mt-4 tracking-wide uppercase leading-relaxed">
                Classifications derived from proprietary Momentum-Volatility-Form matrix analysis
              </p>
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  );
}
