"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PlayerAnalytics, SimulationResult, WeeklyRecap } from "@/lib/types";

function MomentumArrow({ value }: { value: number }) {
  if (value < -0.5)
    return <span className="text-accent-green momentum-up text-lg" title={`Momentum: ${value.toFixed(2)}`}>▲</span>;
  if (value > 0.5)
    return <span className="text-accent-red momentum-down text-lg" title={`Momentum: ${value.toFixed(2)}`}>▼</span>;
  return <span className="text-text-secondary text-lg" title={`Momentum: ${value.toFixed(2)}`}>━</span>;
}

function StateEmoji({ state }: { state: string }) {
  const map: Record<string, string> = {
    Heater: "🔥",
    "Stable Veteran": "⚖️",
    "Ice Veins": "🧊",
    "Regression Watch": "📉",
    "Chaos Merchant": "🌪️",
  };
  return <span title={state}>{map[state] ?? "⛳"}</span>;
}

function ShockBadge({ label }: { label: string | null }) {
  if (!label) return null;
  const colors: Record<string, string> = {
    Expected: "bg-green-900/50 text-green-300 border-green-700/50",
    "Mild Disturbance": "bg-yellow-900/50 text-yellow-300 border-yellow-700/50",
    "Statistical Event": "bg-orange-900/50 text-orange-300 border-orange-700/50",
    "Historic Collapse": "bg-red-900/50 text-red-300 border-red-700/50",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${colors[label] ?? ""}`}>
      {label}
    </span>
  );
}

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<PlayerAnalytics[]>([]);
  const [simulation, setSimulation] = useState<SimulationResult[]>([]);
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
      setSimulation(simData);
      setRecap(recapData);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🏆</div>
          <p className="text-gold font-medium">Loading Performance Index...</p>
          <p className="text-text-secondary text-sm mt-1">Crunching 10,000 simulations</p>
        </div>
      </div>
    );
  }

  const ranked = [...analytics].sort((a, b) => b.rpr - a.rpr);
  const volatilityRanked = [...analytics].sort((a, b) => b.volatility - a.volatility);

  return (
    <div className="space-y-8">
      {/* Weekly Recap */}
      {recap && (
        <section className="bg-bg-card border border-border rounded-xl p-6 card-glow">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🎙️</span>
            <h2 className="text-gold font-bold text-lg">Weekly Broadcast</h2>
          </div>
          <h3 className="text-xl font-bold mb-4">{recap.headline}</h3>
          <div className="space-y-3">
            {recap.narratives.map((n, i) => (
              <p key={i} className="text-text-secondary text-sm leading-relaxed">
                {n}
              </p>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-text-secondary italic">
              {recap.momentumCommentary}
            </p>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Power Rankings */}
        <section className="lg:col-span-2 bg-bg-card border border-border rounded-xl p-6 card-glow">
          <h2 className="text-gold font-bold text-lg mb-6 flex items-center gap-2">
            <span>👑</span> Power Rankings
          </h2>
          <div className="space-y-3">
            {ranked.map((player, index) => (
              <Link
                key={player.playerId}
                href={`/player/${player.playerId}`}
                className="flex items-center gap-4 p-4 rounded-lg bg-bg-primary/50 hover:bg-bg-card-hover border border-transparent hover:border-border transition-all group"
              >
                <div className="rank-number w-12 text-center">{index + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg group-hover:text-gold transition-colors">
                      {player.playerName}
                    </span>
                    <StateEmoji state={player.performanceState} />
                    <MomentumArrow value={player.momentum} />
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-text-secondary text-sm">
                      RPR: <span className="text-gold font-mono">{player.rpr.toFixed(0)}</span>
                    </span>
                    <span className="text-text-secondary text-sm">
                      Avg: <span className="font-mono">{player.rollingAverage.toFixed(1)}</span>
                    </span>
                    <span className="text-text-secondary text-sm">
                      Rounds: <span className="font-mono">{player.roundCount}</span>
                    </span>
                    <ShockBadge label={player.recentShock} />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-text-secondary text-xs">Title Odds</div>
                  <div className="text-gold font-bold text-lg font-mono">
                    {player.titleOdds.toFixed(1)}%
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Title Odds */}
          <section className="bg-bg-card border border-border rounded-xl p-6 card-glow">
            <h2 className="text-gold font-bold text-lg mb-4 flex items-center gap-2">
              <span>🎲</span> Title Odds
            </h2>
            <div className="space-y-3">
              {[...analytics]
                .sort((a, b) => b.titleOdds - a.titleOdds)
                .map((player) => (
                  <div key={player.playerId} className="flex items-center justify-between">
                    <span className="text-sm">{player.playerName}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-bg-primary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gold rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min(player.titleOdds, 100)}%` }}
                        />
                      </div>
                      <span className="text-gold font-mono text-sm w-14 text-right">
                        {player.titleOdds.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </section>

          {/* Volatility Rankings */}
          <section className="bg-bg-card border border-border rounded-xl p-6 card-glow">
            <h2 className="text-gold font-bold text-lg mb-4 flex items-center gap-2">
              <span>📊</span> Volatility Index™
            </h2>
            <div className="space-y-3">
              {volatilityRanked.map((player, index) => (
                <div key={player.playerId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-text-secondary text-xs font-mono w-4">
                      {index + 1}
                    </span>
                    <span className="text-sm">{player.playerName}</span>
                  </div>
                  <span className="font-mono text-sm text-text-secondary">
                    {player.volatility.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Performance States */}
          <section className="bg-bg-card border border-border rounded-xl p-6 card-glow">
            <h2 className="text-gold font-bold text-lg mb-4 flex items-center gap-2">
              <span>🎭</span> Performance States
            </h2>
            <div className="space-y-3">
              {analytics.map((player) => (
                <div key={player.playerId} className="flex items-center justify-between">
                  <span className="text-sm">{player.playerName}</span>
                  <span className="text-sm">
                    <StateEmoji state={player.performanceState} />{" "}
                    <span className="text-text-secondary">{player.performanceState}</span>
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
