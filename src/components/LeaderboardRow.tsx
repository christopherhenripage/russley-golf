"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { PlayerAnalytics } from "@/lib/types";
import Sparkline from "./Sparkline";

const ARCHETYPE_ICONS: Record<string, string> = {
  Heater: "🔥",
  "Stable Veteran": "⚖️",
  "Ice Veins": "🧊",
  "Regression Watch": "📉",
  "Chaos Merchant": "🌪️",
};

function MomentumBadge({ value }: { value: number }) {
  if (value < -0.5) {
    return <span className="text-perf-green text-sm font-black">▲</span>;
  }
  if (value > 0.5) {
    return <span className="text-accent-red text-sm font-black">▼</span>;
  }
  return <span className="text-text-muted text-xs">━</span>;
}

export default function LeaderboardRow({
  player,
  rank,
  index,
}: {
  player: PlayerAnalytics & { titleOdds: number };
  rank: number;
  index: number;
}) {
  const isLeader = rank === 1;

  return (
    <motion.div
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.05 + index * 0.06 }}
    >
      <Link href={`/player/${player.playerId}`} className="block group">
        <div
          className={`
            flex items-center gap-3 px-4 py-3.5 transition-all duration-200
            ${isLeader ? "leaderboard-row-leader" : "leaderboard-row"}
            group-hover:bg-bg-card-hover
          `}
        >
          {/* Rank */}
          <span
            className={`font-black tabular-nums text-xl w-8 text-center ${
              isLeader ? "text-gold" : "text-text-muted"
            }`}
          >
            {rank}
          </span>

          {/* Archetype icon */}
          <span className="text-lg w-7 text-center">
            {ARCHETYPE_ICONS[player.performanceState] || "⚖️"}
          </span>

          {/* Name */}
          <span className="font-black text-base flex-1 group-hover:text-gold transition-colors truncate">
            {player.playerName}
          </span>

          {/* Sparkline */}
          {player.recentRprHistory.length >= 2 && (
            <div className="hidden sm:block">
              <Sparkline data={player.recentRprHistory} width={70} height={22} />
            </div>
          )}

          {/* RPR */}
          <span className="text-gold font-black text-xl tabular-nums tracking-tight w-16 text-right">
            {player.rpr.toFixed(0)}
          </span>

          {/* Title Odds */}
          <span className="text-text-secondary font-bold text-sm tabular-nums w-14 text-right hidden sm:block">
            {player.titleOdds.toFixed(1)}%
          </span>

          {/* Momentum */}
          <div className="w-6 text-center">
            <MomentumBadge value={player.momentum} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
