"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
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

const stateEmojis: Record<string, string> = {
  Heater: "🔥",
  "Stable Veteran": "⚖️",
  "Ice Veins": "🧊",
  "Regression Watch": "📉",
  "Chaos Merchant": "🌪️",
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
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-4xl animate-pulse">⛳</div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center text-text-secondary py-20">Player not found</div>;
  }

  const { player, analytics, courseStats, courseIntelligence, rivalries, ratingHistory, roundHistory } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/" className="text-text-secondary text-sm hover:text-gold transition-colors">
            ← Back to Rankings
          </Link>
          <h1 className="text-3xl font-bold mt-2 flex items-center gap-3">
            {player.name}
            <span className="text-2xl">{stateEmojis[analytics.performanceState] ?? "⛳"}</span>
          </h1>
          <p className="text-text-secondary mt-1">{analytics.performanceState}</p>
        </div>
        <div className="text-right">
          <div className="text-text-secondary text-sm">Russley Performance Rating™</div>
          <div className="text-gold font-bold text-4xl font-mono">{analytics.rpr.toFixed(0)}</div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Career Average", value: analytics.careerAverage.toFixed(1), sub: "Adjusted" },
          { label: "Volatility Index™", value: analytics.volatility.toFixed(2), sub: "σ" },
          { label: "Momentum", value: analytics.momentum.toFixed(2), sub: analytics.momentum < 0 ? "Improving" : "Declining" },
          { label: "Rounds Played", value: analytics.roundCount.toString(), sub: "Total" },
          { label: "Rolling Average", value: analytics.rollingAverage.toFixed(1), sub: "Weighted" },
          { label: "Best Score", value: analytics.bestAdjustedScore.toFixed(0), sub: "Adjusted" },
          { label: "Home Course %", value: `${courseIntelligence.homeCourseIndex}%`, sub: "Russley" },
          { label: "Adaptability", value: courseIntelligence.courseAdaptability.toString(), sub: "/ 100" },
        ].map((stat) => (
          <div key={stat.label} className="bg-bg-card border border-border rounded-xl p-4 card-glow">
            <div className="text-text-secondary text-xs mb-1">{stat.label}</div>
            <div className="text-2xl font-bold font-mono">{stat.value}</div>
            <div className="text-text-secondary text-xs">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Title Odds */}
        {simData && (
          <section className="bg-bg-card border border-border rounded-xl p-6 card-glow">
            <h2 className="text-gold font-bold text-lg mb-4">🎲 Title Odds</h2>
            <div className="text-3xl font-bold font-mono text-gold mb-4">
              {simData.winProbability.toFixed(1)}%
            </div>
            <div className="text-text-secondary text-sm mb-2">Win probability (10,000 sims)</div>
            <div className="space-y-2 mt-4">
              <div className="text-text-secondary text-xs font-medium uppercase tracking-wide">
                Head-to-Head Win Probability
              </div>
              {Object.entries(simData.beatProbabilities).map(([oppId, prob]) => (
                <div key={oppId} className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">vs opponent</span>
                  <span className="font-mono">{prob.toFixed(1)}%</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-text-secondary text-xs">Personal Best Probability</div>
              <div className="text-lg font-bold font-mono">{simData.personalBestProbability.toFixed(1)}%</div>
            </div>
          </section>
        )}

        {/* Course Breakdown */}
        <section className="bg-bg-card border border-border rounded-xl p-6 card-glow">
          <h2 className="text-gold font-bold text-lg mb-4">🏟️ Course Intelligence</h2>
          <div className="space-y-4">
            {courseStats.map((cs) => (
              <div key={cs.courseId} className="flex items-center justify-between p-3 bg-bg-primary/50 rounded-lg">
                <div>
                  <div className="font-medium">{cs.courseName}</div>
                  <div className="text-text-secondary text-xs">{cs.roundsPlayed} rounds</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-lg">{cs.averageScore.toFixed(1)}</div>
                  <div className="text-text-secondary text-xs">avg score</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Rivalry Table */}
        <section className="bg-bg-card border border-border rounded-xl p-6 card-glow lg:col-span-2">
          <h2 className="text-gold font-bold text-lg mb-4">🥊 Rivalry Matrix</h2>
          {rivalries.length === 0 ? (
            <p className="text-text-secondary text-sm">No head-to-head data yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-text-secondary font-medium">Opponent</th>
                    <th className="text-right py-2 text-text-secondary font-medium">Win %</th>
                    <th className="text-right py-2 text-text-secondary font-medium">Avg Differential</th>
                    <th className="text-right py-2 text-text-secondary font-medium">Meetings</th>
                  </tr>
                </thead>
                <tbody>
                  {rivalries.map((r) => {
                    const isPlayerA = r.playerAId === playerId;
                    const opponentName = isPlayerA ? r.playerBName : r.playerAName;
                    const winPct = isPlayerA ? r.playerAWinPct : 100 - r.playerAWinPct;
                    const diff = isPlayerA ? r.avgStrokeDifferential : -r.avgStrokeDifferential;

                    return (
                      <tr key={`${r.playerAId}-${r.playerBId}`} className="border-b border-border/50">
                        <td className="py-3 font-medium">{opponentName}</td>
                        <td className="py-3 text-right font-mono">
                          <span className={winPct >= 50 ? "text-accent-green" : "text-accent-red"}>
                            {winPct.toFixed(0)}%
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono">
                          <span className={diff < 0 ? "text-accent-green" : "text-accent-red"}>
                            {diff > 0 ? "+" : ""}{diff.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono text-text-secondary">{r.totalRounds}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Round History */}
        <section className="bg-bg-card border border-border rounded-xl p-6 card-glow lg:col-span-2">
          <h2 className="text-gold font-bold text-lg mb-4">📋 Round History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-text-secondary font-medium">Date</th>
                  <th className="text-left py-2 text-text-secondary font-medium">Course</th>
                  <th className="text-right py-2 text-text-secondary font-medium">Score</th>
                  <th className="text-right py-2 text-text-secondary font-medium">Adjusted</th>
                </tr>
              </thead>
              <tbody>
                {roundHistory.map((r) => (
                  <tr key={r.id} className="border-b border-border/50">
                    <td className="py-3 text-text-secondary">{r.date}</td>
                    <td className="py-3">{r.courseName}</td>
                    <td className="py-3 text-right font-mono">{r.score}</td>
                    <td className="py-3 text-right font-mono text-gold">{r.adjustedScore.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
