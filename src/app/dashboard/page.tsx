"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { PlayerAnalytics, SimulationResult, WeeklyRecap } from "@/lib/types";
import RotatingHeadline from "@/components/RotatingHeadline";
import LeaderboardRow from "@/components/LeaderboardRow";
import RivalryCard from "@/components/RivalryCard";

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<(PlayerAnalytics & { titleOdds: number })[]>([]);
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

  return (
    <div className="space-y-0">
      {/* ROTATING HEADLINE */}
      {recap && <RotatingHeadline recap={recap} analytics={analytics} />}

      <div className="mt-5 space-y-5">
        {/* === POWER RANKINGS — THE STAR === */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="section-label">Power Rankings</span>
            <div className="flex-1 gold-divider" />
          </div>

          <div className="card-broadcast rounded-sm overflow-hidden">
            {/* Header row */}
            <div className="flex items-center gap-3 px-4 py-2.5 border-b-2 border-border text-[9px] text-text-muted tracking-[0.15em] uppercase font-black">
              <span className="w-8 text-center">#</span>
              <span className="w-7" />
              <span className="flex-1">Player</span>
              <span className="hidden sm:block w-[70px]" />
              <span className="w-16 text-right">RPR</span>
              <span className="w-14 text-right hidden sm:block">Odds</span>
              <span className="w-6" />
            </div>

            {/* Player rows */}
            <div className="divide-y divide-border/30">
              {ranked.map((player, index) => (
                <LeaderboardRow
                  key={player.playerId}
                  player={player}
                  rank={index + 1}
                  index={index}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t-2 border-border">
              <p className="text-[9px] text-text-muted tracking-[0.12em] uppercase font-bold">
                RPR = Russley Performance Rating™ | Odds via 10,000 Monte Carlo Simulations
              </p>
            </div>
          </div>
        </motion.section>

        {/* === LATEST INTEL === */}
        {recap && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card-broadcast glow-gold p-6 rounded-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="section-label">Latest Intel</span>
              <div className="flex-1 gold-divider" />
            </div>
            <h2 className="text-xl md:text-2xl font-black leading-tight tracking-tight mb-3">
              {recap.headline}
            </h2>
            {recap.narratives.length > 0 && (
              <p className="text-text-secondary text-sm leading-relaxed mb-3">
                {recap.narratives[0]}
              </p>
            )}
            <p className="text-[11px] text-text-muted italic tracking-wide">
              {recap.momentumCommentary}
            </p>
          </motion.section>
        )}

        {/* === TITLE RACE & RIVALRY — SIDE BY SIDE === */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Title Probability Donut */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
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

          {/* Featured Rivalry */}
          {rivalA && rivalB && (
            <RivalryCard playerA={rivalA} playerB={rivalB} />
          )}
        </div>
      </div>
    </div>
  );
}
