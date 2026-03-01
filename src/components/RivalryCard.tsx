"use client";

import { motion } from "framer-motion";
import type { PlayerAnalytics } from "@/lib/types";

const ARCHETYPE_ICONS: Record<string, string> = {
  Heater: "🔥", "Stable Veteran": "⚖️", "Ice Veins": "🧊",
  "Regression Watch": "📉", "Chaos Merchant": "🌪️",
};

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
      className="card-broadcast glow-gold-intense rounded-sm overflow-hidden"
    >
      <div className="bg-gold h-[4px]" />
      <div className="p-6">
        <span className="section-label">Featured Rivalry — Tale of the Tape</span>

        <div className="mt-6 grid grid-cols-[1fr_auto_1fr] gap-6 items-center">
          {/* Player A */}
          <div className="text-center">
            <div className="text-5xl mb-3">
              {ARCHETYPE_ICONS[playerA.performanceState] || "⚖️"}
            </div>
            <div className="font-black text-2xl tracking-tight">{playerA.playerName}</div>
            <div className="text-gold font-black text-5xl tabular-nums tracking-tighter mt-3 leading-none">
              {playerA.rpr.toFixed(0)}
            </div>
            <div className="text-[10px] text-text-muted tracking-[0.15em] uppercase mt-1 font-bold">RPR</div>

            <div className="mt-5 space-y-3">
              <TapeStat label="MTO" value={playerA.rollingAverage.toFixed(1)} better={playerA.rollingAverage < playerB.rollingAverage} />
              <TapeStat label="Vol σ" value={playerA.volatility.toFixed(2)} better={playerA.volatility < playerB.volatility} />
              <TapeStat label="Momentum" value={playerA.momentum.toFixed(2)} better={playerA.momentum < playerB.momentum} />
              <TapeStat label="Title Odds" value={`${playerA.titleOdds.toFixed(1)}%`} better={playerA.titleOdds > playerB.titleOdds} />
            </div>
          </div>

          {/* VS Divider — Bold */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-[3px] h-20 bg-gradient-to-b from-transparent via-gold/50 to-transparent" />
            <div className="text-gold font-black text-3xl tracking-tighter">VS</div>
            <div className="w-[3px] h-20 bg-gradient-to-b from-transparent via-gold/50 to-transparent" />
          </div>

          {/* Player B */}
          <div className="text-center">
            <div className="text-5xl mb-3">
              {ARCHETYPE_ICONS[playerB.performanceState] || "⚖️"}
            </div>
            <div className="font-black text-2xl tracking-tight">{playerB.playerName}</div>
            <div className="text-gold font-black text-5xl tabular-nums tracking-tighter mt-3 leading-none">
              {playerB.rpr.toFixed(0)}
            </div>
            <div className="text-[10px] text-text-muted tracking-[0.15em] uppercase mt-1 font-bold">RPR</div>

            <div className="mt-5 space-y-3">
              <TapeStat label="MTO" value={playerB.rollingAverage.toFixed(1)} better={playerB.rollingAverage < playerA.rollingAverage} />
              <TapeStat label="Vol σ" value={playerB.volatility.toFixed(2)} better={playerB.volatility < playerA.volatility} />
              <TapeStat label="Momentum" value={playerB.momentum.toFixed(2)} better={playerB.momentum < playerA.momentum} />
              <TapeStat label="Title Odds" value={`${playerB.titleOdds.toFixed(1)}%`} better={playerB.titleOdds > playerA.titleOdds} />
            </div>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t-2 border-border text-center">
          <p className="text-[11px] text-text-secondary tracking-[0.1em] uppercase leading-relaxed font-bold">
            The Psychological Edge Index™ has flagged this pairing for priority surveillance.
            Both trajectories are converging on a collision the models have been predicting for weeks.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function TapeStat({ label, value, better }: { label: string; value: string; better?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-sm border-2 ${better ? "border-perf-green/30 bg-perf-green/5" : "border-border bg-bg-surface"}`}>
      <span className="text-[10px] text-text-muted tracking-[0.12em] uppercase font-black">{label}</span>
      <span className={`text-base font-black tabular-nums ${better ? "text-perf-green" : ""}`}>{value}</span>
    </div>
  );
}
