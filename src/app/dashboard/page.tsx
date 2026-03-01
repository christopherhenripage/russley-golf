"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PlayerAnalytics, SimulationResult, WeeklyRecap } from "@/lib/types";
import PlayerCard from "@/components/PlayerCard";
import RivalryCard from "@/components/RivalryCard";
import Ticker from "@/components/Ticker";

const ARCHETYPE_ICONS: Record<string, string> = {
  Heater: "🔥", "Stable Veteran": "⚖️", "Ice Veins": "🧊",
  "Regression Watch": "📉", "Chaos Merchant": "🌪️",
};
const ARCHETYPE_LABELS: Record<string, string> = {
  Heater: "THE FURNACE", "Stable Veteran": "THE TACTICIAN", "Ice Veins": "THE MACHINE",
  "Regression Watch": "THE REGRESSION CANDIDATE", "Chaos Merchant": "THE CHAOS MERCHANT",
};
const ARCHETYPE_COLORS: Record<string, string> = {
  Heater: "text-hot-orange", "Stable Veteran": "text-gold", "Ice Veins": "text-ice-blue",
  "Regression Watch": "text-accent-red", "Chaos Merchant": "text-chaos-purple",
};
const ARCHETYPE_BORDERS: Record<string, string> = {
  Heater: "border-hot-orange/40 bg-hot-orange/10", "Stable Veteran": "border-gold/30 bg-gold/8",
  "Ice Veins": "border-ice-blue/40 bg-ice-blue/10", "Regression Watch": "border-accent-red/40 bg-accent-red/10",
  "Chaos Merchant": "border-chaos-purple/40 bg-chaos-purple/10",
};

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
          <div className="text-6xl mb-6">🏆</div>
          <div className="text-gold font-black text-lg tracking-[0.3em] uppercase mb-3">
            Performance Index Loading
          </div>
          <div className="text-text-secondary text-xs tracking-[0.2em] uppercase">
            Crunching 10,000 Monte Carlo Simulations...
          </div>
          <div className="mt-8 w-64 h-1 bg-border mx-auto overflow-hidden rounded-full">
            <motion.div
              className="h-full bg-gold rounded-full"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  const ranked = [...analytics].sort((a, b) => b.rpr - a.rpr);
  const sortedByOdds = [...analytics].sort((a, b) => b.titleOdds - a.titleOdds);
  const rivalA = sortedByOdds[0];
  const rivalB = sortedByOdds[1];
  const biggestMover = [...analytics].sort((a, b) => a.momentum - b.momentum)[0];
  const highestVol = [...analytics].sort((a, b) => b.volatility - a.volatility)[0];

  return (
    <div className="space-y-0">
      {/* NEWS TICKER */}
      {recap && <Ticker recap={recap} analytics={analytics} />}

      {/* === SHOCK ALERTS — DRAMATIC RED BANNERS === */}
      <AnimatePresence>
        {analytics
          .filter((a) => a.recentShock === "Historic Collapse" || a.recentShock === "Statistical Event")
          .map((a) => (
            <motion.div
              key={`shock-${a.playerId}`}
              initial={{ opacity: 0, x: -60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className={`
                shock-alert mt-4 p-5 border-l-[6px] border-2
                ${a.recentShock === "Historic Collapse"
                  ? "border-l-alert-red border-alert-red/30 bg-alert-red/10 shock-alert-pulse"
                  : "border-l-hot-orange border-hot-orange/30 bg-hot-orange/10"
                }
              `}
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-alert-red live-dot" />
                    <span className="text-[13px] font-black tracking-[0.15em] uppercase text-alert-red">
                      Shock Alert
                    </span>
                  </div>
                  <span className="text-lg font-black">{a.playerName}</span>
                  <span className={`
                    inline-flex items-center gap-2 px-4 py-1.5 text-[12px] font-black tracking-[0.1em] uppercase
                    border-2
                    ${a.recentShock === "Historic Collapse"
                      ? "bg-alert-red/20 border-alert-red/50 text-alert-red"
                      : "bg-hot-orange/15 border-hot-orange/40 text-hot-orange"
                    }
                  `}>
                    {a.recentShock === "Historic Collapse" && (
                      <span className="w-2 h-2 rounded-full bg-alert-red live-dot" />
                    )}
                    {a.recentShock}
                  </span>
                </div>
                <span className="text-text-secondary text-[11px] tracking-wider uppercase font-bold">
                  &gt;2σ deviation from predicted MTO
                </span>
              </div>
            </motion.div>
          ))}
      </AnimatePresence>

      <div className="mt-5 space-y-5">
        {/* === TOP ROW: Broadcast Headline + Latest Round Report === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* BROADCAST HEADLINE */}
          {recap && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="card-broadcast glow-gold p-6 rounded-sm lg:col-span-2"
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="section-label">State of the Tour</span>
                <div className="flex-1 gold-divider" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black leading-tight tracking-tight mb-5">
                {recap.headline}
              </h2>
              <div className="space-y-4">
                {recap.narratives.slice(0, 2).map((n, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                    className="text-text-secondary text-sm leading-relaxed"
                  >
                    {n}
                  </motion.p>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t-2 border-border">
                <p className="text-[12px] text-text-secondary italic leading-relaxed tracking-wide">
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
                <h3 className="text-base font-black tracking-tight leading-snug mb-3">
                  {matchReport.headline}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed flex-1">
                  {matchReport.narrative}
                </p>
                <div className="mt-4 pt-3 border-t-2 border-border">
                  <div className="text-[10px] text-text-muted tracking-[0.15em] uppercase font-bold">
                    Filed by the RSPI Analytics Bureau
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-text-muted text-sm mt-4 tracking-wider uppercase">
                No recent field intelligence available.
              </p>
            )}
          </motion.section>
        </div>

        {/* === ANALYTICS DESK — 3-COLUMN === */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Biggest Mover */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="card-broadcast rounded-sm p-5"
          >
            <span className="section-label">Biggest Mover</span>
            <div className="mt-4 flex items-center gap-4">
              <span className="text-4xl momentum-heater">🚀</span>
              <div>
                <div className="font-black text-xl">{biggestMover?.playerName || "—"}</div>
                <div className="text-perf-green text-sm font-black tracking-wider momentum-up">
                  MOMENTUM: {biggestMover?.momentum.toFixed(2) || "0"}
                </div>
              </div>
            </div>
            <p className="text-text-secondary text-[11px] mt-3 tracking-wide leading-relaxed uppercase">
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
            <div className="mt-4 flex items-center gap-4">
              <span className="text-4xl">🌪️</span>
              <div>
                <div className="font-black text-xl">{highestVol?.playerName || "—"}</div>
                <div className="text-chaos-purple text-sm font-black tracking-wider">
                  σ = {highestVol?.volatility.toFixed(2) || "0"}
                </div>
              </div>
            </div>
            <p className="text-text-secondary text-[11px] mt-3 tracking-wide leading-relaxed uppercase">
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
              <div className="relative shrink-0">
                <svg width="110" height="110" viewBox="0 0 120 120" className="-rotate-90">
                  {(() => {
                    const sorted = [...analytics].sort((a, b) => b.titleOdds - a.titleOdds);
                    const COLORS = ["#D4AF37", "#f0d060", "#a08020", "#2a6635", "#1a4d25"];
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
                          strokeWidth="18"
                          strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                          strokeDashoffset={-offset}
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-[10px] text-text-secondary font-black tracking-wider uppercase">10K</div>
                    <div className="text-[9px] text-text-muted tracking-wider uppercase">Sims</div>
                  </div>
                </div>
              </div>
              <div className="space-y-2.5 flex-1">
                {(() => {
                  const COLORS = ["#D4AF37", "#f0d060", "#a08020", "#2a6635", "#1a4d25"];
                  return [...analytics]
                    .sort((a, b) => b.titleOdds - a.titleOdds)
                    .map((p, i) => (
                      <div key={p.playerId} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-[11px] font-bold">{p.playerName}</span>
                        </div>
                        <span className="text-gold font-black tabular-nums text-sm">{p.titleOdds.toFixed(1)}%</span>
                      </div>
                    ));
                })()}
              </div>
            </div>
            <p className="text-[10px] text-text-muted mt-3 tracking-wide uppercase font-bold">
              Based on 10,000 simulated season outcomes
            </p>
          </motion.div>
        </div>

        {/* === FEATURED RIVALRY — TALE OF THE TAPE === */}
        {rivalA && rivalB && (
          <RivalryCard playerA={rivalA} playerB={rivalB} />
        )}

        {/* === POWER RANKINGS — PLAYER CARDS === */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="section-label">Power Rankings</span>
            <div className="flex-1 gold-divider" />
            <span className="text-[10px] text-text-secondary tracking-[0.15em] uppercase font-bold">
              Russley Performance Rating™
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ranked.map((player, index) => (
              <PlayerCard
                key={player.playerId}
                player={player}
                rank={index + 1}
                index={index}
              />
            ))}
          </div>

          <div className="mt-5 text-center">
            <p className="text-[10px] text-text-secondary tracking-[0.15em] uppercase font-bold">
              MTO = Mean Tactical Output (Course-Normalised) | Win % via 10,000 Monte Carlo Simulations | σ = Volatility Index™
            </p>
          </div>
        </motion.section>

        {/* === BOTTOM ROW: Volatility + Archetypes === */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Volatility Rankings */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="card-broadcast rounded-sm p-5"
          >
            <span className="section-label">Volatility Index™</span>
            <div className="mt-5 space-y-4">
              {[...analytics].sort((a, b) => b.volatility - a.volatility).map((player, index) => (
                <div key={player.playerId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-text-secondary text-sm font-black tabular-nums w-4">
                      {index + 1}
                    </span>
                    <span className="text-sm font-bold">{player.playerName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2.5 bg-border rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${player.volatility > 4 ? "bg-chaos-purple" : player.volatility > 2.5 ? "bg-hot-orange" : "bg-perf-green/60"}`}
                        style={{ width: `${Math.min((player.volatility / 6) * 100, 100)}%` }}
                      />
                    </div>
                    <span className={`tabular-nums text-sm font-black w-12 text-right ${player.volatility > 4 ? "text-chaos-purple" : player.volatility > 2.5 ? "text-hot-orange" : "text-text-secondary"}`}>
                      {player.volatility.toFixed(2)}σ
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Archetype Classification — BOLD badges */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.65 }}
            className="card-broadcast rounded-sm p-5"
          >
            <span className="section-label">Archetype Classification</span>
            <div className="mt-5 space-y-3">
              {analytics.map((player) => (
                <div key={player.playerId} className="flex items-center justify-between bg-bg-surface border-2 border-border rounded-sm px-4 py-3">
                  <span className="text-sm font-bold">{player.playerName}</span>
                  <span className={`
                    archetype-badge text-[11px]
                    ${ARCHETYPE_BORDERS[player.performanceState] || "border-gold/30 bg-gold/8"}
                    ${ARCHETYPE_COLORS[player.performanceState] || "text-gold"}
                  `}>
                    <span className="text-base">{ARCHETYPE_ICONS[player.performanceState] || "⚖️"}</span>
                    {ARCHETYPE_LABELS[player.performanceState] || "THE TACTICIAN"}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-text-secondary mt-4 tracking-wide uppercase leading-relaxed font-bold">
              Classifications derived from proprietary Momentum-Volatility-Form matrix analysis
            </p>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
