"use client";

import { motion } from "framer-motion";
import type { RivalryRecord } from "@/lib/types";

export default function RivalryMatrix({
  rivalries,
  playerId,
}: {
  rivalries: RivalryRecord[];
  playerId: string;
}) {
  if (rivalries.length === 0) {
    return (
      <div className="text-text-muted text-xs tracking-wider uppercase py-4">
        Insufficient head-to-head intelligence gathered.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rivalries.map((r, i) => {
        const isPlayerA = r.playerAId === playerId;
        const opponentName = isPlayerA ? r.playerBName : r.playerAName;
        const winPct = isPlayerA ? r.playerAWinPct : 100 - r.playerAWinPct;
        const diff = isPlayerA ? r.avgStrokeDifferential : -r.avgStrokeDifferential;
        const psychEdge = isPlayerA ? (r.psychEdgeA ?? 0) : -(r.psychEdgeA ?? 0);
        const dominant = winPct >= 50;

        return (
          <motion.div
            key={`${r.playerAId}-${r.playerBId}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className={`
              bg-bg-surface border rounded-sm p-4
              ${dominant ? "border-perf-green/20" : "border-accent-red/20"}
            `}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm">{opponentName}</span>
                <span className={`text-[9px] font-black tracking-[0.1em] uppercase px-2 py-0.5 rounded-sm ${
                  dominant ? "bg-perf-green/10 text-perf-green" : "bg-accent-red/10 text-accent-red"
                }`}>
                  {dominant ? "DOMINANT" : "VULNERABLE"}
                </span>
              </div>
              <span className="text-text-muted text-[10px] tabular-nums">{r.totalRounds} meetings</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Win % */}
              <div>
                <div className="text-[8px] text-text-muted tracking-[0.15em] uppercase font-bold mb-1">Dominance</div>
                <div className={`text-xl font-black tabular-nums ${winPct >= 50 ? "text-perf-green" : "text-accent-red"}`}>
                  {winPct.toFixed(0)}%
                </div>
              </div>

              {/* Stroke Edge */}
              <div>
                <div className="text-[8px] text-text-muted tracking-[0.15em] uppercase font-bold mb-1">Stroke Edge</div>
                <div className={`text-xl font-black tabular-nums ${diff < 0 ? "text-perf-green" : diff > 0 ? "text-accent-red" : "text-text-muted"}`}>
                  {diff > 0 ? "+" : ""}{diff.toFixed(1)}
                </div>
              </div>

              {/* Psych Edge */}
              <div>
                <div className="text-[8px] text-text-muted tracking-[0.15em] uppercase font-bold mb-1">Psych Edge™</div>
                <div className={`text-xl font-black tabular-nums ${psychEdge > 0 ? "text-perf-green" : psychEdge < 0 ? "text-accent-red" : "text-text-muted"}`}>
                  {psychEdge > 0 ? "+" : ""}{psychEdge}
                </div>
              </div>
            </div>

            {/* Dominance bar */}
            <div className="mt-3 w-full h-1.5 bg-border rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${dominant ? "bg-perf-green/60" : "bg-accent-red/60"}`}
                initial={{ width: 0 }}
                animate={{ width: `${winPct}%` }}
                transition={{ duration: 0.8, delay: 0.2 + i * 0.05 }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
