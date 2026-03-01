"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import RivalryMatrix from "@/components/RivalryMatrix";
import Sparkline from "@/components/Sparkline";
import type { RivalryRecord, CourseStats, SimulationResult } from "@/lib/types";

interface PlayerDetail {
  player: { id: string; name: string };
  analytics: {
    rpr: number;
    rollingAverage: number;
    volatility: number;
    momentum: number;
    performanceState: string;
    recentShock: string | null;
    careerAverage: number;
    bestAdjustedScore: number;
    roundCount: number;
  };
  courseStats: CourseStats[];
  courseIntelligence: {
    homeCourseIndex: number;
    courseAdaptability: number;
  };
  rivalries: RivalryRecord[];
  ratingHistory: { date: string; rpr: number; volatility: number; momentum: number }[];
  roundHistory: {
    id: string;
    date: string;
    score: number;
    courseName: string;
    adjustedScore: number;
  }[];
}

const ARCHETYPE_CONFIG: Record<string, { icon: string; label: string; color: string; bg: string; description: string }> = {
  Heater:            { icon: "🔥", label: "THE FURNACE",              color: "text-hot-orange",   bg: "border-hot-orange/30",   description: "Operating at unsustainable levels of excellence. The analytics department has filed a formal inquiry." },
  "Stable Veteran":  { icon: "⚖️",  label: "THE TACTICIAN",           color: "text-gold",         bg: "border-gold/30",         description: "Producing the kind of reliable tactical output that keeps the models comfortable." },
  "Ice Veins":       { icon: "🧊", label: "THE MACHINE",             color: "text-ice-blue",     bg: "border-ice-blue/30",     description: "Volatility readings so low the instruments are being recalibrated. A statistical anomaly of consistency." },
  "Regression Watch":{ icon: "📉", label: "THE REGRESSION CANDIDATE", color: "text-accent-red",   bg: "border-accent-red/30",   description: "The trend-lines are converging on a narrative no one wants to write." },
  "Chaos Merchant":  { icon: "🌪️", label: "THE CHAOS MERCHANT",       color: "text-chaos-purple", bg: "border-chaos-purple/30", description: "Generating data points that have broken three separate prediction models this quarter." },
};

export default function PlayerPage() {
  const params = useParams();
  const playerId = params.id as string;
  const [data, setData] = useState<PlayerDetail | null>(null);
  const [simData, setSimData] = useState<SimulationResult | null>(null);
  const [playerNameMap, setPlayerNameMap] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/player/${playerId}`).then((r) => r.json()),
      fetch("/api/simulation").then((r) => r.json()),
    ]).then(([playerData, simResults]) => {
      setData(playerData);
      const allSims = simResults as SimulationResult[];
      const playerSim = allSims.find((s) => s.playerId === playerId);
      setSimData(playerSim ?? null);
      setPlayerNameMap(new Map(allSims.map((s) => [s.playerId, s.playerName])));
      setLoading(false);
    });
  }, [playerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="text-4xl mb-4">⛳</div>
          <div className="text-[10px] text-text-muted tracking-[0.3em] uppercase">Loading Dossier</div>
        </motion.div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center text-text-muted py-20 text-sm tracking-wider uppercase">Competitor Not Found In Database</div>;
  }

  const { player, analytics, courseStats, courseIntelligence, rivalries, ratingHistory, roundHistory } = data;
  const archetype = ARCHETYPE_CONFIG[analytics.performanceState] || ARCHETYPE_CONFIG["Stable Veteran"];

  // Volatility gauge percentage
  const volPct = Math.min((analytics.volatility / 6) * 100, 100);
  const volColor = analytics.volatility > 4 ? "bg-chaos-purple" : analytics.volatility > 2.5 ? "bg-hot-orange" : "bg-perf-green/60";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* === THE TRADING CARD === */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card-broadcast glow-gold-intense rounded-sm overflow-hidden"
        >
          <div className="bg-gradient-to-r from-transparent via-gold to-transparent h-[2px]" />
          <div className="p-6">
            <Link href="/dashboard" className="text-text-muted text-[10px] tracking-[0.15em] uppercase hover:text-gold transition-colors">
              ← Return to Power Rankings
            </Link>

            {/* Name + Archetype */}
            <div className="flex items-start justify-between mt-4">
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  className="text-4xl md:text-5xl font-black tracking-tighter leading-none"
                >
                  {player.name}
                </motion.h1>

                {/* Archetype Badge */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                  className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 border ${archetype.bg} bg-bg-surface`}
                >
                  <span className="text-xl">{archetype.icon}</span>
                  <div>
                    <div className={`text-[10px] font-black tracking-[0.12em] uppercase ${archetype.color}`}>
                      {archetype.label}
                    </div>
                    <div className="text-[9px] text-text-muted mt-0.5 leading-snug max-w-[280px]">
                      {archetype.description}
                    </div>
                  </div>
                </motion.div>

                {/* Shock Alert */}
                {analytics.recentShock && analytics.recentShock !== "Expected" && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.35 }}
                    className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-alert-red/8 border border-alert-red/30"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-alert-red live-dot" />
                    <span className="text-[10px] font-black tracking-[0.12em] uppercase text-alert-red">
                      Last Round: {analytics.recentShock}
                    </span>
                  </motion.div>
                )}
              </div>

              {/* RPR Big Number */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-right"
              >
                <div className="text-[9px] text-text-muted tracking-[0.2em] uppercase mb-1">
                  Russley Performance Rating™
                </div>
                <div className="text-gold font-black text-6xl tabular-nums tracking-tighter leading-none">
                  {analytics.rpr.toFixed(0)}
                </div>
                {simData && (
                  <div className="mt-2 text-[10px] text-text-muted tracking-wider uppercase">
                    Title Probability: <span className="text-gold font-black">{simData.winProbability.toFixed(1)}%</span>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Key Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              <div className="bg-bg-surface border border-border rounded-sm p-3">
                <div className="text-[8px] text-text-muted tracking-[0.15em] uppercase font-bold">MTO</div>
                <div className="text-2xl font-black tabular-nums mt-1">{analytics.rollingAverage.toFixed(1)}</div>
                <div className="text-[9px] text-text-muted">Course-Normalised</div>
              </div>
              <div className="bg-bg-surface border border-border rounded-sm p-3">
                <div className="text-[8px] text-text-muted tracking-[0.15em] uppercase font-bold">Career Avg</div>
                <div className="text-2xl font-black tabular-nums mt-1">{analytics.careerAverage.toFixed(1)}</div>
                <div className="text-[9px] text-text-muted">All-Time Mean</div>
              </div>
              <div className="bg-bg-surface border border-border rounded-sm p-3">
                <div className="text-[8px] text-text-muted tracking-[0.15em] uppercase font-bold">Peak</div>
                <div className="text-2xl font-black tabular-nums mt-1 text-perf-green">{analytics.bestAdjustedScore.toFixed(0)}</div>
                <div className="text-[9px] text-text-muted">Best Adjusted</div>
              </div>
              <div className="bg-bg-surface border border-border rounded-sm p-3">
                <div className="text-[8px] text-text-muted tracking-[0.15em] uppercase font-bold">Rounds</div>
                <div className="text-2xl font-black tabular-nums mt-1">{analytics.roundCount}</div>
                <div className="text-[9px] text-text-muted">Data Points</div>
              </div>
            </div>

            {/* Volatility Gauge + Momentum */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              {/* Volatility */}
              <div className="bg-bg-surface border border-border rounded-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] text-text-muted tracking-[0.12em] uppercase font-bold">Volatility Index™</span>
                  <span className={`text-lg font-black tabular-nums ${analytics.volatility > 4 ? "text-chaos-purple" : analytics.volatility > 2.5 ? "text-hot-orange" : "text-perf-green"}`}>
                    {analytics.volatility.toFixed(2)}σ
                  </span>
                </div>
                <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${volColor}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${volPct}%` }}
                    transition={{ duration: 1, delay: 0.4 }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[8px] text-perf-green/50 font-bold">STABLE</span>
                  <span className="text-[8px] text-chaos-purple/50 font-bold">CHAOS</span>
                </div>
              </div>

              {/* Momentum */}
              <div className="bg-bg-surface border border-border rounded-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] text-text-muted tracking-[0.12em] uppercase font-bold">Momentum Vector</span>
                  <span className={`text-lg font-black tabular-nums ${analytics.momentum < -0.5 ? "text-perf-green" : analytics.momentum > 0.5 ? "text-accent-red" : "text-text-secondary"}`}>
                    {analytics.momentum.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {analytics.momentum < -0.5 ? (
                    <>
                      <span className="text-perf-green text-xl">▲</span>
                      <span className="text-[10px] font-black tracking-wider text-perf-green">ASCENDING — Trajectory Improving</span>
                    </>
                  ) : analytics.momentum > 0.5 ? (
                    <>
                      <span className="text-accent-red text-xl">▼</span>
                      <span className="text-[10px] font-black tracking-wider text-accent-red">DECLINING — Regression Detected</span>
                    </>
                  ) : (
                    <>
                      <span className="text-text-muted text-lg">━</span>
                      <span className="text-[10px] font-black tracking-wider text-text-muted">STABLE — Within Operating Parameters</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sidebar: Monte Carlo + Course Intel */}
        <div className="space-y-5">
          {/* Monte Carlo */}
          {simData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="card-broadcast rounded-sm p-5"
            >
              <span className="section-label">Monte Carlo Intelligence</span>
              <div className="mt-4 text-center">
                <div className="text-gold font-black text-5xl tabular-nums tracking-tighter leading-none">
                  {simData.winProbability.toFixed(1)}%
                </div>
                <div className="text-[10px] text-text-muted tracking-wider uppercase mt-1">
                  Title Probability
                </div>
                <div className="text-[9px] text-text-muted mt-0.5">10,000 simulations</div>
              </div>

              <div className="mt-5 space-y-2">
                <div className="text-[9px] text-text-muted font-bold tracking-[0.15em] uppercase mb-2">
                  Head-to-Head Dominance
                </div>
                {Object.entries(simData.beatProbabilities).map(([oppId, prob]) => (
                  <div key={oppId} className="flex items-center justify-between">
                    <span className="text-text-muted text-[10px]">vs {playerNameMap.get(oppId) || "Unknown"}</span>
                    <span className={`font-black tabular-nums text-sm ${prob > 50 ? "text-perf-green" : "text-accent-red"}`}>
                      {prob.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-border">
                <div className="text-[9px] text-text-muted tracking-wider uppercase">PB Probability</div>
                <div className="text-lg font-black tabular-nums mt-1">{simData.personalBestProbability.toFixed(1)}%</div>
              </div>
            </motion.div>
          )}

          {/* Course Intelligence */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="card-broadcast rounded-sm p-5"
          >
            <span className="section-label">Terrain Analysis</span>
            <div className="mt-4 space-y-2.5">
              <div className="flex justify-between bg-bg-surface rounded-sm px-3 py-2 border border-border">
                <span className="text-[9px] text-text-muted tracking-[0.12em] uppercase font-bold">Home Dependency</span>
                <span className="text-sm font-black tabular-nums">{courseIntelligence.homeCourseIndex}%</span>
              </div>
              <div className="flex justify-between bg-bg-surface rounded-sm px-3 py-2 border border-border">
                <span className="text-[9px] text-text-muted tracking-[0.12em] uppercase font-bold">Adaptability</span>
                <span className="text-sm font-black tabular-nums">{courseIntelligence.courseAdaptability}/100</span>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {courseStats.map((cs) => (
                <div key={cs.courseId} className="bg-bg-surface border border-border rounded-sm p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs">{cs.courseName}</div>
                      <div className="text-[9px] text-text-muted">{cs.roundsPlayed} rounds</div>
                    </div>
                    <div className="font-black tabular-nums text-lg">{cs.averageScore.toFixed(1)}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* RPR TREND */}
      {ratingHistory.length >= 2 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="card-broadcast rounded-sm p-5"
        >
          <span className="section-label">RPR Trajectory</span>
          <div className="mt-4 overflow-hidden">
            <div className="w-full">
              <svg viewBox="0 0 600 80" className="w-full h-auto" preserveAspectRatio="none">
                {(() => {
                  const data = ratingHistory.map((r) => r.rpr);
                  const min = Math.min(...data);
                  const max = Math.max(...data);
                  const range = max - min || 1;
                  const points = data.map((val, i) => {
                    const x = (i / (data.length - 1)) * 596 + 2;
                    const y = 78 - ((val - min) / range) * 76;
                    return `${x},${y}`;
                  });
                  const last = points[points.length - 1].split(",");
                  return (
                    <>
                      <polyline points={points.join(" ")} fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                      <circle cx={last[0]} cy={last[1]} r="4" fill="#D4AF37" />
                    </>
                  );
                })()}
              </svg>
            </div>
            <div className="flex justify-between mt-2 text-[9px] text-text-muted tracking-wider">
              <span>{ratingHistory[0]?.date}</span>
              <span>{ratingHistory[ratingHistory.length - 1]?.date}</span>
            </div>
          </div>
        </motion.section>
      )}

      {/* PSYCHOLOGICAL WARFARE MATRIX */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="card-broadcast rounded-sm p-5"
      >
        <span className="section-label">Psychological Warfare Matrix</span>
        <div className="mt-4">
          <RivalryMatrix rivalries={rivalries} playerId={playerId} />
        </div>
      </motion.section>

      {/* THE DATA TRAIL */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="card-broadcast rounded-sm p-5"
      >
        <span className="section-label">The Data Trail</span>
        <div className="mt-4 space-y-2">
          {roundHistory.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.65 + i * 0.03 }}
              className="flex items-center justify-between bg-bg-surface border border-border rounded-sm px-4 py-3"
            >
              <div className="flex items-center gap-4">
                <span className="text-text-muted text-xs tabular-nums w-20">{r.date}</span>
                <span className="text-xs font-medium">{r.courseName}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-text-muted tabular-nums text-sm">{r.score}</span>
                <span className="text-gold font-black tabular-nums text-sm w-12 text-right">{r.adjustedScore.toFixed(1)}</span>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-3 flex justify-between text-[9px] text-text-muted tracking-[0.12em] uppercase">
          <span>Raw Score → Adjusted MTO</span>
          <span>Sorted by date (most recent first)</span>
        </div>
      </motion.section>
    </motion.div>
  );
}
