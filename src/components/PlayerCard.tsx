"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { PlayerAnalytics } from "@/lib/types";

const ARCHETYPE_CONFIG: Record<string, { icon: string; label: string; color: string; bg: string }> = {
  Heater:            { icon: "🔥", label: "THE FURNACE",              color: "text-hot-orange",   bg: "bg-hot-orange/8" },
  "Stable Veteran":  { icon: "⚖️",  label: "THE TACTICIAN",           color: "text-gold",         bg: "bg-gold/8" },
  "Ice Veins":       { icon: "🧊", label: "THE MACHINE",             color: "text-ice-blue",     bg: "bg-ice-blue/8" },
  "Regression Watch":{ icon: "📉", label: "THE REGRESSION CANDIDATE", color: "text-accent-red",   bg: "bg-accent-red/8" },
  "Chaos Merchant":  { icon: "🌪️", label: "THE CHAOS MERCHANT",       color: "text-chaos-purple", bg: "bg-chaos-purple/8" },
};

function VolatilityGauge({ value }: { value: number }) {
  const pct = Math.min((value / 6) * 100, 100);
  const color = value > 4 ? "bg-chaos-purple" : value > 2.5 ? "bg-hot-orange" : "bg-perf-green/60";
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[8px] text-text-muted tracking-[0.15em] uppercase font-bold">Volatility</span>
        <span className="text-[10px] font-black tabular-nums">{value.toFixed(2)}σ</span>
      </div>
      <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

function MomentumArrow({ value }: { value: number }) {
  if (value < -0.5) {
    return (
      <div className="flex items-center gap-1 text-perf-green">
        <span className="text-sm">▲</span>
        <span className="text-[9px] font-black tracking-wider">HOT</span>
      </div>
    );
  }
  if (value > 0.5) {
    return (
      <div className="flex items-center gap-1 text-accent-red">
        <span className="text-sm">▼</span>
        <span className="text-[9px] font-black tracking-wider">COLD</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 text-text-muted">
      <span className="text-xs">━</span>
      <span className="text-[9px] font-black tracking-wider">HOLD</span>
    </div>
  );
}

export default function PlayerCard({
  player,
  rank,
  index,
}: {
  player: PlayerAnalytics & { titleOdds: number };
  rank: number;
  index: number;
}) {
  const archetype = ARCHETYPE_CONFIG[player.performanceState] || ARCHETYPE_CONFIG["Stable Veteran"];
  const isLeader = rank === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.08 }}
    >
      <Link href={`/player/${player.playerId}`} className="block group">
        <div
          className={`
            relative overflow-hidden rounded-sm
            border transition-all duration-300
            ${isLeader
              ? "border-gold/40 shadow-[0_0_30px_rgba(212,175,55,0.12)] hover:shadow-[0_0_40px_rgba(212,175,55,0.2)]"
              : "border-border hover:border-border-bright hover:shadow-[0_0_20px_rgba(212,175,55,0.06)]"
            }
            bg-bg-card hover:bg-bg-card-hover
          `}
        >
          {/* Gold top edge for leader */}
          <div className={`h-[2px] ${isLeader ? "bg-gradient-to-r from-transparent via-gold to-transparent" : "bg-transparent"}`} />

          <div className="p-5">
            {/* Top row: Rank + Name + Momentum */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={isLeader ? "rank-number-leader" : "rank-number"}>
                  {rank}
                </div>
                <div>
                  <div className="font-black text-lg tracking-tight group-hover:text-gold transition-colors">
                    {player.playerName}
                  </div>
                  <div className={`flex items-center gap-1.5 mt-0.5 text-[10px] font-black tracking-[0.1em] uppercase ${archetype.color}`}>
                    <span>{archetype.icon}</span>
                    {archetype.label}
                  </div>
                </div>
              </div>
              <MomentumArrow value={player.momentum} />
            </div>

            {/* RPR - Big number */}
            <div className="flex items-end justify-between mb-4">
              <div>
                <div className="text-[8px] text-text-muted tracking-[0.2em] uppercase font-bold mb-1">RPR</div>
                <div className="text-gold font-black text-4xl tabular-nums tracking-tighter leading-none">
                  {player.rpr.toFixed(0)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[8px] text-text-muted tracking-[0.2em] uppercase font-bold mb-1">Title Odds</div>
                <div className={`font-black text-2xl tabular-nums tracking-tight leading-none ${player.titleOdds > 25 ? "text-perf-green" : player.titleOdds > 15 ? "text-gold" : "text-text-secondary"}`}>
                  {player.titleOdds.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Stat row */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-bg-surface rounded-sm p-2.5 border border-border">
                <div className="text-[8px] text-text-muted tracking-[0.15em] uppercase font-bold">MTO</div>
                <div className="font-black tabular-nums text-base mt-0.5">{player.rollingAverage.toFixed(1)}</div>
              </div>
              <div className="bg-bg-surface rounded-sm p-2.5 border border-border">
                <div className="text-[8px] text-text-muted tracking-[0.15em] uppercase font-bold">Rounds</div>
                <div className="font-black tabular-nums text-base mt-0.5">{player.roundCount}</div>
              </div>
            </div>

            {/* Volatility Gauge */}
            <VolatilityGauge value={player.volatility} />

            {/* Shock Alert */}
            {player.recentShock && player.recentShock !== "Expected" && (
              <div className={`
                mt-3 flex items-center gap-1.5 px-2.5 py-1.5 text-[9px] font-black tracking-[0.1em] uppercase
                ${player.recentShock === "Historic Collapse"
                  ? "bg-alert-red/8 border border-alert-red/30 text-alert-red"
                  : player.recentShock === "Statistical Event"
                    ? "bg-hot-orange/8 border border-hot-orange/30 text-hot-orange"
                    : "bg-gold/8 border border-gold/30 text-gold"
                }
              `}>
                {player.recentShock === "Historic Collapse" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-alert-red live-dot" />
                )}
                {player.recentShock}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
