"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PlayerAnalytics, SimulationResult, WeeklyRecap } from "@/lib/types";
import PlayerCard from "@/components/PlayerCard";
import RivalryCard from "@/components/RivalryCard";
import Ticker from "@/components/Ticker";

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<(PlayerAnalytics & { titleOdds: number })[]>([]);
  const [simulation, setSimulation] = useState<SimulationResult[]>([]);
  const [recap, setRecap] = useState<WeeklyRecap | null>(null);
  const [matchReport, setMatchReport] = useState<{ headline: string; narrative: string } | null>(null);
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

      // Get match report
      if (recapData.narratives?.length > 0) {
        setMatchReport({
          headline: recapData.headline,
          narrative: recapData.narratives[0],
        });
      }

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

  // Featured Rivalry: top 2 by title odds
  const sortedByOdds = [...analytics].sort((a, b) => b.titleOdds - a.titleOdds);
  const rivalA = sortedByOdds[0];
  const rivalB = sortedByOdds[1];

  // Biggest Mover
  const biggestMover = [...analytics].sort((a, b) => a.momentum - b.momentum)[0];
  // Highest Volatility
  const highestVol = [...analytics].sort((a, b) => b.volatility - a.volatility)[0];

  return (
    <div className="space-y-0">
      {/* NEWS TICKER */}
      {recap && <Ticker recap={recap} analytics={analytics} />}

      {/* SHOCK ALERTS */}
      <AnimatePresence>
        {analytics
          .filter((a) => a.recentShock === "Historic Collapse" || a.recentShock === "Statistical Event")
          .map((a) => (
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
                  <span className={`
                    inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black tracking-[0.1em] uppercase
                    border
                    ${a.recentShock === "Historic Collapse"
                      ? "bg-alert-red/10 border-alert-red/40 text-alert-red shock-alert-pulse"
                      : "bg-hot-orange/8 border-hot-orange/30 text-hot-orange"
                    }
                  `}>
                    {a.recentShock === "Historic Collapse" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-alert-red live-dot" />
                    )}
                    {a.recentShock}
                  </span>
                </div>
                <span className="text-text-muted text-[10px] tracking-wider uppercase hidden md:block">
                  Deviation from predicted Mean Tactical Output
                </span>
              </div>
            </motion.div>
          ))}
      </AnimatePresence>

      <div className="mt-6 space-y-6">
        {/* TOP ROW: Broadcast Headline + Latest Round Report */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* BROADCAST HEADLINE */}
          {recap && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="card-broadcast glow-gold p-6 rounded-sm lg:col-span-2"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="section-label">State of the Tour</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <h2 className="text-xl md:text-2xl font-black leading-tight tracking-tight mb-5">
                {recap.headline}
              </h2>
              <div className="space-y-4">
                {recap.narratives.slice(0, 2).map((n, i) => (
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

          {/* LATEST ROUND REPORT */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card-broadcast rounded-sm p-5 flex flex-col"
          >
            <span className="section-label">Latest Round Report</span>
            {matchReport ? (
              <div className="mt-4 flex-1 flex flex-col">
                <h3 className="text-sm font-black tracking-tight leading-snug mb-3">
                  {matchReport.headline}
                </h3>
                <p className="text-text-secondary text-xs leading-relaxed flex-1">
                  {matchReport.narrative}
                </p>
                <div className="mt-4 pt-3 border-t border-border">
                  <div className="text-[9px] text-text-muted tracking-[0.15em] uppercase">
                    Filed by the RSPI Analytics Bureau
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-text-muted text-xs mt-4 tracking-wider uppercase">
                No recent field intelligence available.
              </p>
            )}
          </motion.section>
        </div>

        {/* ANALYTICS DESK ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Biggest Mover */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
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
                <div className="font-black text-lg">{highestVol?.playerName || "—"}</div>
                <div className="text-chaos-purple text-xs font-bold tracking-wider">
                  σ = {highestVol?.volatility.toFixed(2) || "0"}
                </div>
              </div>
            </div>
            <p className="text-text-muted text-[10px] mt-3 tracking-wide leading-relaxed uppercase">
              Prediction confidence interval has been widened. The models are struggling.
            </p>
          </motion.div>

          {/* Title Odds — Donut Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="card-broadcast rounded-sm p-5"
          >
            <span className="section-label">Title Probability</span>
            <div className="mt-4 flex items-center gap-5">
              {/* SVG Donut */}
              <div className="relative shrink-0">
                <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
                  {(() => {
                    const sorted = [...analytics].sort((a, b) => b.titleOdds - a.titleOdds);
                    const COLORS = ["#D4AF37", "#f0d060", "#a08020", "#777777", "#444444"];
                    const circumference = 2 * Math.PI * 45;
                    let cumulativeOffset = 0;
                    return sorted.map((p, i) => {
                      const pct = p.titleOdds / 100;
                      const dashLength = circumference * pct;
                      const offset = cumulativeOffset;
                      cumulativeOffset += dashLength;
                      return (
                        <circle
                          key={p.playerId}
                          cx="60"
                          cy="60"
                          r="45"
                          fill="none"
                          stroke={COLORS[i % COLORS.length]}
                          strokeWidth="16"
                          strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                          strokeDashoffset={-offset}
                          className="transition-all duration-1000"
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-[9px] text-text-muted tracking-wider uppercase">10K</div>
                    <div className="text-[8px] text-text-muted tracking-wider uppercase">Sims</div>
                  </div>
                </div>
              </div>
              {/* Legend */}
              <div className="space-y-2 flex-1">
                {(() => {
                  const COLORS = ["#D4AF37", "#f0d060", "#a08020", "#777777", "#444444"];
                  return [...analytics]
                    .sort((a, b) => b.titleOdds - a.titleOdds)
                    .map((p, i) => (
                      <div key={p.playerId} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-[10px] font-bold tracking-wide">{p.playerName}</span>
                        </div>
                        <span className="text-gold font-black tabular-nums text-xs">{p.titleOdds.toFixed(1)}%</span>
                      </div>
                    ));
                })()}
              </div>
            </div>
            <p className="text-[9px] text-text-muted mt-3 tracking-wide uppercase">
              Based on 10,000 simulated season outcomes
            </p>
          </motion.div>
        </div>

        {/* FEATURED RIVALRY */}
        {rivalA && rivalB && (
          <RivalryCard playerA={rivalA} playerB={rivalB} />
        )}

        {/* POWER RANKINGS — PLAYER CARDS */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="section-label">Power Rankings</span>
            <div className="flex-1 h-px bg-border" />
            <span className="text-[9px] text-text-muted tracking-[0.15em] uppercase">
              Sorted by Russley Performance Rating™
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ranked.map((player, index) => (
              <PlayerCard
                key={player.playerId}
                player={player}
                rank={index + 1}
                index={index}
              />
            ))}
          </div>

          <div className="mt-4 text-center">
            <p className="text-[9px] text-text-muted tracking-[0.15em] uppercase">
              MTO = Mean Tactical Output (Course-Normalised) | Win % via 10,000 Monte Carlo Simulations | σ = Volatility Index™
            </p>
          </div>
        </motion.section>

        {/* SIDEBAR-STYLE SECTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                    <div className="w-20 h-1.5 bg-border rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${player.volatility > 4 ? "bg-chaos-purple" : player.volatility > 2.5 ? "bg-hot-orange" : "bg-perf-green/50"}`}
                        style={{ width: `${Math.min((player.volatility / 6) * 100, 100)}%` }}
                      />
                    </div>
                    <span className={`tabular-nums text-sm font-black w-10 text-right ${player.volatility > 4 ? "text-chaos-purple" : "text-text-secondary"}`}>
                      {player.volatility.toFixed(2)}
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
            transition={{ duration: 0.5, delay: 0.65 }}
            className="card-broadcast rounded-sm p-5"
          >
            <div className="flex items-center gap-2 mb-5">
              <span className="section-label">Archetype Classification</span>
            </div>
            <div className="space-y-3">
              {analytics.map((player) => {
                const icons: Record<string, string> = {
                  Heater: "🔥", "Stable Veteran": "⚖️", "Ice Veins": "🧊",
                  "Regression Watch": "📉", "Chaos Merchant": "🌪️",
                };
                const labels: Record<string, string> = {
                  Heater: "THE FURNACE", "Stable Veteran": "THE TACTICIAN", "Ice Veins": "THE MACHINE",
                  "Regression Watch": "THE REGRESSION CANDIDATE", "Chaos Merchant": "THE CHAOS MERCHANT",
                };
                const colors: Record<string, string> = {
                  Heater: "text-hot-orange", "Stable Veteran": "text-gold", "Ice Veins": "text-ice-blue",
                  "Regression Watch": "text-accent-red", "Chaos Merchant": "text-chaos-purple",
                };
                return (
                  <div key={player.playerId} className="flex items-center justify-between">
                    <span className="text-xs font-semibold">{player.playerName}</span>
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black tracking-[0.1em] uppercase ${colors[player.performanceState] || "text-gold"}`}>
                      <span>{icons[player.performanceState] || "⚖️"}</span>
                      {labels[player.performanceState] || "THE TACTICIAN"}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-[9px] text-text-muted mt-4 tracking-wide uppercase leading-relaxed">
              Classifications derived from proprietary Momentum-Volatility-Form matrix analysis
            </p>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
