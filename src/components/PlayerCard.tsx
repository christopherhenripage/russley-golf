"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { PlayerAnalytics } from "@/lib/types";

const ARCHETYPE_CONFIG: Record<string, { icon: string; label: string; color: string; borderColor: string; bg: string }> = {
  Heater:            { icon: "🔥", label: "THE FURNACE",              color: "text-hot-orange",   borderColor: "border-hot-orange/50",   bg: "bg-hot-orange/12" },
  "Stable Veteran":  { icon: "⚖️",  label: "THE TACTICIAN",           color: "text-gold",         borderColor: "border-gold/40",         bg: "bg-gold/10" },
  "Ice Veins":       { icon: "🧊", label: "THE MACHINE",             color: "text-ice-blue",     borderColor: "border-ice-blue/50",     bg: "bg-ice-blue/12" },
  "Regression Watch":{ icon: "📉", label: "THE REGRESSION CANDIDATE", color: "text-accent-red",   borderColor: "border-accent-red/50",   bg: "bg-accent-red/12" },
  "Chaos Merchant":  { icon: "🌪️", label: "THE CHAOS MERCHANT",       color: "text-chaos-purple", borderColor: "border-chaos-purple/50", bg: "bg-chaos-purple/12" },
};

function VolatilityGauge({ value }: { value: number }) {
  const pct = Math.min((value / 6) * 100, 100);
  const color = value > 4 ? "bg-chaos-purple" : value > 2.5 ? "bg-hot-orange" : "bg-perf-green/70";
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[9px] text-text-muted tracking-[0.15em] uppercase font-black">Volatility Index™</span>
        <span className={`text-sm font-black tabular-nums ${value > 4 ? "text-chaos-purple" : value > 2.5 ? "text-hot-orange" : "text-perf-green"}`}>
          {value.toFixed(2)}σ
        </span>
      </div>
      <div className="w-full h-2.5 bg-border rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[8px] text-perf-green/60 font-black">STABLE</span>
        <span className="text-[8px] text-chaos-purple/60 font-black">CHAOS</span>
      </div>
    </div>
  );
}

function MomentumArrow({ value }: { value: number }) {
  if (value < -0.5) {
    return (
      <div className="flex items-center gap-1.5 momentum-up">
        <span className="text-perf-green text-xl font-black">▲</span>
        <span className="text-[11px] font-black tracking-wider text-perf-green">HOT</span>
      </div>
    );
  }
  if (value > 0.5) {
    return (
      <div className="flex items-center gap-1.5 momentum-down">
        <span className="text-accent-red text-xl font-black">▼</span>
        <span className="text-[11px] font-black tracking-wider text-accent-red">COLD</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-text-muted text-lg">━</span>
      <span className="text-[11px] font-black tracking-wider text-text-muted">HOLD</span>
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
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.08 }}
    >
      <Link href={`/player/${player.playerId}`} className="block group">
        <div
          className={`
            relative overflow-hidden rounded-sm
            border-2 transition-all duration-300
            ${isLeader
              ? "border-gold/60 glow-gold-intense hover:border-gold"
              : "border-border hover:border-gold/40 hover:glow-gold"
            }
            bg-bg-card hover:bg-bg-card-hover
          `}
        >
          {/* Gold top edge */}
          <div className={`h-[4px] ${isLeader ? "bg-gold" : "bg-gradient-to-r from-transparent via-gold/30 to-transparent"}`} />

          <div className="p-5">
            {/* Top row: Rank + Name + Momentum */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={isLeader ? "rank-number-leader" : "rank-number"}>
                  {rank}
                </div>
                <div>
                  <div className="font-black text-xl tracking-tight group-hover:text-gold transition-colors">
                    {player.playerName}
                  </div>
                </div>
              </div>
              <MomentumArrow value={player.momentum} />
            </div>

            {/* ARCHETYPE BADGE — PROMINENT */}
            <div className={`archetype-badge ${archetype.borderColor} ${archetype.bg} ${archetype.color} mb-4`}>
              <span className="text-lg">{archetype.icon}</span>
              <span>{archetype.label}</span>
            </div>

            {/* RPR - Big number */}
            <div className="flex items-end justify-between mb-5">
              <div>
                <div className="text-[9px] text-text-muted tracking-[0.2em] uppercase font-black mb-1">RPR</div>
                <div className="text-gold font-black text-5xl tabular-nums tracking-tighter leading-none">
                  {player.rpr.toFixed(0)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] text-text-muted tracking-[0.2em] uppercase font-black mb-1">Title Odds</div>
                <div className={`font-black text-3xl tabular-nums tracking-tight leading-none ${player.titleOdds > 25 ? "text-perf-green" : player.titleOdds > 15 ? "text-gold" : "text-text-secondary"}`}>
                  {player.titleOdds.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Stat row */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-bg-surface rounded-sm p-3 border-2 border-border">
                <div className="text-[9px] text-text-muted tracking-[0.15em] uppercase font-black">MTO</div>
                <div className="font-black tabular-nums text-xl mt-0.5">{player.rollingAverage.toFixed(1)}</div>
                <div className="text-[8px] text-text-muted mt-0.5">Course-Normalised</div>
              </div>
              <div className="bg-bg-surface rounded-sm p-3 border-2 border-border">
                <div className="text-[9px] text-text-muted tracking-[0.15em] uppercase font-black">Intel</div>
                <div className="font-black tabular-nums text-xl mt-0.5">{player.roundCount}</div>
                <div className="text-[8px] text-text-muted mt-0.5">Data Points</div>
              </div>
            </div>

            {/* Volatility Gauge */}
            <VolatilityGauge value={player.volatility} />

            {/* Shock Alert — DRAMATIC */}
            {player.recentShock && player.recentShock !== "Expected" && (
              <div className={`
                mt-4 flex items-center gap-2 px-3 py-2.5
                border-2 font-black tracking-[0.1em] uppercase
                ${player.recentShock === "Historic Collapse"
                  ? "bg-alert-red/15 border-alert-red/50 text-alert-red shock-border-pulse"
                  : player.recentShock === "Statistical Event"
                    ? "bg-hot-orange/15 border-hot-orange/50 text-hot-orange"
                    : "bg-gold/15 border-gold/50 text-gold"
                }
              `}>
                {player.recentShock === "Historic Collapse" && (
                  <span className="w-2.5 h-2.5 rounded-full bg-alert-red live-dot" />
                )}
                <span className="text-[11px]">{player.recentShock}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
