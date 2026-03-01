"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
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

const ARCHETYPE_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  Heater:            { icon: "🔥", label: "THE FURNACE",              color: "text-hot-orange" },
  "Stable Veteran":  { icon: "⚖️",  label: "THE TACTICIAN",           color: "text-gold" },
  "Ice Veins":       { icon: "🧊", label: "THE MACHINE",             color: "text-ice-blue" },
  "Regression Watch":{ icon: "📉", label: "THE REGRESSION CANDIDATE", color: "text-accent-red" },
  "Chaos Merchant":  { icon: "🌪️", label: "THE CHAOS MERCHANT",       color: "text-chaos-purple" },
};

export default function PlayerPage() {
  const params = useParams();
  const playerId = params.id as string;
  const [data, setData] = useState<PlayerDetail | null>(null);
  const [simData, setSimData] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/player/${playerId}`).then((r) => r.json()),
      fetch("/api/simulation").then((r) => r.json()),
    ]).then(([playerData, simResults]) => {
      setData(playerData);
      const playerSim = (simResults as SimulationResult[]).find(
        (s) => s.playerId === playerId
      );
      setSimData(playerSim ?? null);
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

  const { player, analytics, courseStats, courseIntelligence, rivalries, roundHistory } = data;
  const archetype = ARCHETYPE_CONFIG[analytics.performanceState] || ARCHETYPE_CONFIG["Stable Veteran"];

  const stats = [
    { label: "Mean Tactical Output",      value: analytics.careerAverage.toFixed(1),         sub: "Course-Normalised" },
    { label: "Volatility Index™",         value: analytics.volatility.toFixed(2),            sub: "σ (Standard Deviation)" },
    { label: "Momentum Vector",           value: analytics.momentum.toFixed(2),              sub: analytics.momentum < 0 ? "ASCENDING" : analytics.momentum > 0 ? "DECLINING" : "STABLE" },
    { label: "Intel Gathered",            value: analytics.roundCount.toString(),             sub: "Total Data Points" },
    { label: "Weighted Tactical Output",  value: analytics.rollingAverage.toFixed(1),        sub: "Recent 5 at 1.5x" },
    { label: "Peak Performance",          value: analytics.bestAdjustedScore.toFixed(0),     sub: "Best Adjusted Score" },
    { label: "Home Course Dependency",    value: `${courseIntelligence.homeCourseIndex}%`,    sub: "Russley Ratio" },
    { label: "Terrain Adaptability",      value: courseIntelligence.courseAdaptability.toString(), sub: "/ 100" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* HEADER — Broadcast Player Card */}
      <div className="card-broadcast glow-gold-intense rounded-sm overflow-hidden">
        <div className="bg-gold h-[2px]" />
        <div className="p-6 flex items-start justify-between">
          <div>
            <Link href="/" className="text-text-muted text-[10px] tracking-[0.15em] uppercase hover:text-gold transition-colors">
              ← Return to Power Rankings
            </Link>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl font-black mt-3 tracking-tight flex items-center gap-4"
            >
              {player.name}
              <span className="text-3xl">{archetype.icon}</span>
            </motion.h1>
            <div className={`mt-2 text-xs font-black tracking-[0.15em] uppercase ${archetype.color}`}>
              {archetype.label}
            </div>
            {analytics.recentShock && analytics.recentShock !== "Expected" && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-alert-red/8 border border-alert-red/30">
                <span className="w-1.5 h-1.5 rounded-full bg-alert-red live-dot" />
                <span className="text-[10px] font-black tracking-[0.12em] uppercase text-alert-red">
                  Last Round: {analytics.recentShock}
                </span>
              </div>
            )}
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-right"
          >
            <div className="text-[9px] text-text-muted tracking-[0.2em] uppercase mb-1">
              Russley Performance Rating™
            </div>
            <div className="text-gold font-black text-5xl tabular-nums tracking-tighter">
              {analytics.rpr.toFixed(0)}
            </div>
            {simData && (
              <div className="mt-2 text-[10px] text-text-muted tracking-wider uppercase">
                Title Probability: <span className="text-gold font-black">{simData.winProbability.toFixed(1)}%</span>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* STAT GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 + i * 0.05 }}
            className="stat-pill rounded-sm p-4"
          >
            <div className="text-[9px] text-text-muted tracking-[0.12em] uppercase mb-2">{stat.label}</div>
            <div className="text-2xl font-black tabular-nums tracking-tight">{stat.value}</div>
            <div className="text-[9px] text-text-muted tracking-wider uppercase mt-1">{stat.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* SIMULATION INTEL */}
        {simData && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="card-broadcast rounded-sm p-5"
          >
            <span className="section-label">Monte Carlo Intelligence</span>
            <div className="mt-4 text-4xl font-black tabular-nums text-gold tracking-tight">
              {simData.winProbability.toFixed(1)}%
            </div>
            <div className="text-[10px] text-text-muted tracking-wider uppercase mt-1 mb-4">
              Probability of finishing #1 (10,000 simulations)
            </div>
            <div className="space-y-2">
              <div className="text-[9px] text-text-muted font-bold tracking-[0.15em] uppercase">
                Head-to-Head Dominance Probability
              </div>
              {Object.entries(simData.beatProbabilities).map(([oppId, prob]) => (
                <div key={oppId} className="flex items-center justify-between text-sm">
                  <span className="text-text-muted text-xs">vs opponent</span>
                  <span className={`font-bold tabular-nums ${prob > 50 ? "text-perf-green" : "text-accent-red"}`}>
                    {prob.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border">
              <div className="text-[9px] text-text-muted tracking-wider uppercase">Personal Best Probability</div>
              <div className="text-lg font-black tabular-nums mt-1">{simData.personalBestProbability.toFixed(1)}%</div>
            </div>
          </motion.section>
        )}

        {/* COURSE INTELLIGENCE */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="card-broadcast rounded-sm p-5"
        >
          <span className="section-label">Terrain Analysis</span>
          <div className="mt-4 space-y-3">
            {courseStats.map((cs) => (
              <div key={cs.courseId} className="flex items-center justify-between p-3 bg-bg-surface rounded-sm border border-border">
                <div>
                  <div className="font-bold text-sm">{cs.courseName}</div>
                  <div className="text-[10px] text-text-muted tracking-wider uppercase">{cs.roundsPlayed} engagements</div>
                </div>
                <div className="text-right">
                  <div className="font-black tabular-nums text-xl">{cs.averageScore.toFixed(1)}</div>
                  <div className="text-[9px] text-text-muted tracking-wider uppercase">Mean Output</div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* RIVALRY MATRIX */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="card-broadcast rounded-sm p-5 lg:col-span-2"
        >
          <span className="section-label">Psychological Warfare Matrix</span>
          {rivalries.length === 0 ? (
            <p className="text-text-muted text-xs mt-4 tracking-wider uppercase">Insufficient head-to-head intelligence gathered.</p>
          ) : (
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-[9px] text-text-muted font-bold tracking-[0.15em] uppercase">Opponent</th>
                    <th className="text-right py-2 text-[9px] text-text-muted font-bold tracking-[0.15em] uppercase">Dominance %</th>
                    <th className="text-right py-2 text-[9px] text-text-muted font-bold tracking-[0.15em] uppercase">Stroke Edge</th>
                    <th className="text-right py-2 text-[9px] text-text-muted font-bold tracking-[0.15em] uppercase">Psych Edge™</th>
                    <th className="text-right py-2 text-[9px] text-text-muted font-bold tracking-[0.15em] uppercase">Meetings</th>
                  </tr>
                </thead>
                <tbody>
                  {rivalries.map((r) => {
                    const isPlayerA = r.playerAId === playerId;
                    const opponentName = isPlayerA ? r.playerBName : r.playerAName;
                    const winPct = isPlayerA ? r.playerAWinPct : 100 - r.playerAWinPct;
                    const diff = isPlayerA ? r.avgStrokeDifferential : -r.avgStrokeDifferential;
                    const psychEdge = isPlayerA ? (r.psychEdgeA ?? 0) : -(r.psychEdgeA ?? 0);

                    return (
                      <tr key={`${r.playerAId}-${r.playerBId}`} className="border-b border-border/30">
                        <td className="py-3 font-bold">{opponentName}</td>
                        <td className="py-3 text-right font-black tabular-nums">
                          <span className={winPct >= 50 ? "text-perf-green" : "text-accent-red"}>
                            {winPct.toFixed(0)}%
                          </span>
                        </td>
                        <td className="py-3 text-right font-bold tabular-nums">
                          <span className={diff < 0 ? "text-perf-green" : "text-accent-red"}>
                            {diff > 0 ? "+" : ""}{diff.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-3 text-right font-black tabular-nums">
                          <span className={psychEdge > 0 ? "text-perf-green" : psychEdge < 0 ? "text-accent-red" : "text-text-muted"}>
                            {psychEdge > 0 ? "+" : ""}{psychEdge}
                          </span>
                        </td>
                        <td className="py-3 text-right tabular-nums text-text-muted">{r.totalRounds}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.section>

        {/* DATA TRAIL */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="card-broadcast rounded-sm p-5 lg:col-span-2"
        >
          <span className="section-label">The Data Trail</span>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-[9px] text-text-muted font-bold tracking-[0.15em] uppercase">Date</th>
                  <th className="text-left py-2 text-[9px] text-text-muted font-bold tracking-[0.15em] uppercase">Terrain</th>
                  <th className="text-right py-2 text-[9px] text-text-muted font-bold tracking-[0.15em] uppercase">Raw Output</th>
                  <th className="text-right py-2 text-[9px] text-text-muted font-bold tracking-[0.15em] uppercase">Adjusted MTO</th>
                </tr>
              </thead>
              <tbody>
                {roundHistory.map((r) => (
                  <tr key={r.id} className="border-b border-border/30">
                    <td className="py-3 text-text-muted text-xs tabular-nums">{r.date}</td>
                    <td className="py-3 text-xs font-medium">{r.courseName}</td>
                    <td className="py-3 text-right tabular-nums text-text-muted">{r.score}</td>
                    <td className="py-3 text-right tabular-nums font-black text-gold">{r.adjustedScore.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
