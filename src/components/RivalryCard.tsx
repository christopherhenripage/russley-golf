"use client";

import { motion } from "framer-motion";
import type { PlayerAnalytics } from "@/lib/types";

export default function RivalryCard({
  playerA,
  playerB,
}: {
  playerA: PlayerAnalytics & { titleOdds: number };
  playerB: PlayerAnalytics & { titleOdds: number };
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="card-broadcast glow-gold rounded-sm overflow-hidden"
    >
      <div className="bg-gradient-to-r from-transparent via-gold to-transparent h-[2px]" />
      <div className="p-6">
        <span className="section-label">Featured Rivalry — Tale of the Tape</span>

        <div className="mt-6 grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
          {/* Player A */}
          <div className="text-center">
            <div className="text-3xl mb-2">
              {playerA.performanceState === "Heater" ? "🔥" : playerA.performanceState === "Ice Veins" ? "🧊" : "⚖️"}
            </div>
            <div className="font-black text-xl tracking-tight">{playerA.playerName}</div>
            <div className="text-gold font-black text-3xl tabular-nums tracking-tighter mt-2">
              {playerA.rpr.toFixed(0)}
            </div>
            <div className="text-[9px] text-text-muted tracking-[0.15em] uppercase mt-1">RPR</div>

            <div className="mt-4 space-y-2">
              <StatLine label="MTO" value={playerA.rollingAverage.toFixed(1)} />
              <StatLine label="Vol σ" value={playerA.volatility.toFixed(2)} />
              <StatLine label="Momentum" value={playerA.momentum.toFixed(2)} highlight={playerA.momentum < 0} />
              <StatLine label="Title Odds" value={`${playerA.titleOdds.toFixed(1)}%`} highlight={playerA.titleOdds > playerB.titleOdds} />
            </div>
          </div>

          {/* VS Divider */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-px h-16 bg-gradient-to-b from-transparent via-border to-transparent" />
            <div className="text-text-muted font-black text-2xl tracking-tighter">VS</div>
            <div className="w-px h-16 bg-gradient-to-b from-transparent via-border to-transparent" />
          </div>

          {/* Player B */}
          <div className="text-center">
            <div className="text-3xl mb-2">
              {playerB.performanceState === "Heater" ? "🔥" : playerB.performanceState === "Ice Veins" ? "🧊" : "⚖️"}
            </div>
            <div className="font-black text-xl tracking-tight">{playerB.playerName}</div>
            <div className="text-gold font-black text-3xl tabular-nums tracking-tighter mt-2">
              {playerB.rpr.toFixed(0)}
            </div>
            <div className="text-[9px] text-text-muted tracking-[0.15em] uppercase mt-1">RPR</div>

            <div className="mt-4 space-y-2">
              <StatLine label="MTO" value={playerB.rollingAverage.toFixed(1)} />
              <StatLine label="Vol σ" value={playerB.volatility.toFixed(2)} />
              <StatLine label="Momentum" value={playerB.momentum.toFixed(2)} highlight={playerB.momentum < 0} />
              <StatLine label="Title Odds" value={`${playerB.titleOdds.toFixed(1)}%`} highlight={playerB.titleOdds > playerA.titleOdds} />
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-border text-center">
          <p className="text-[10px] text-text-muted tracking-[0.12em] uppercase leading-relaxed">
            The Psychological Edge Index™ has flagged this pairing for priority surveillance.
            Both trajectories are converging on a collision the models have been predicting for weeks.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function StatLine({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[9px] text-text-muted tracking-[0.12em] uppercase font-bold">{label}</span>
      <span className={`text-sm font-black tabular-nums ${highlight ? "text-perf-green" : ""}`}>{value}</span>
    </div>
  );
}
