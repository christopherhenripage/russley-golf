"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { PlayerAnalytics } from "@/lib/types";

const ARCHETYPE_ICONS: Record<string, string> = {
  Heater: "🔥",
  "Stable Veteran": "⚖️",
  "Ice Veins": "🧊",
  "Regression Watch": "📉",
  "Chaos Merchant": "🌪️",
};

export default function LandingPage() {
  const [analytics, setAnalytics] = useState<PlayerAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<{ temp: number; description: string; icon: string } | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((data) => {
        setAnalytics(data);
        setLoading(false);
      });

    // Christchurch weather (free wttr.in API)
    fetch("https://wttr.in/Christchurch+NZ?format=j1")
      .then((r) => r.json())
      .then((data) => {
        const current = data.current_condition?.[0];
        if (current) {
          setWeather({
            temp: parseInt(current.temp_C),
            description: current.weatherDesc?.[0]?.value || "Unknown",
            icon: parseInt(current.cloudcover) > 60 ? "☁️" : parseInt(current.temp_C) > 20 ? "☀️" : "🌤️",
          });
        }
      })
      .catch(() => {});
  }, []);

  const ranked = [...analytics].sort((a, b) => b.rpr - a.rpr);
  const leader = ranked[0];

  return (
    <div className="min-h-[80vh] flex flex-col">
      {/* HERO SECTION */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative flex-1 flex items-center justify-center py-20"
      >
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(var(--color-gold) 1px, transparent 1px), linear-gradient(90deg, var(--color-gold) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />

        <div className="relative text-center max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold/5 border border-gold/20 mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green live-dot" />
            <span className="text-[10px] font-black tracking-[0.2em] text-gold uppercase">
              Season Active — Live Analytics
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-6"
          >
            <span className="text-gold">The Russley</span>
            <br />
            Senior Performance
            <br />
            Index™
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-text-secondary text-sm md:text-base max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Quantifying greatness through proprietary Elo-derived ratings, Monte Carlo simulations,
            and a level of statistical analysis that is, by any reasonable measure, entirely unnecessary
            for a weekly social golf group in Christchurch, New Zealand.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex items-center justify-center gap-4"
          >
            <Link
              href="/dashboard"
              className="bg-gold text-bg-primary font-black py-3.5 px-8 text-sm tracking-[0.12em] uppercase hover:bg-gold-light transition-colors"
            >
              Enter the Arena
            </Link>
            <Link
              href="/add-round"
              className="border border-border text-text-secondary hover:text-text-primary hover:border-border-bright font-bold py-3.5 px-8 text-sm tracking-[0.12em] uppercase transition-all"
            >
              Submit Intel
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* QUICK GLANCE SECTION */}
      {!loading && analytics.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="pb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {/* Current Leader */}
            <div className="card-broadcast glow-gold-intense rounded-sm p-5 text-center">
              <div className="text-[9px] text-text-muted tracking-[0.2em] uppercase font-bold mb-3">
                Current #1
              </div>
              <div className="text-2xl mb-1">🏆</div>
              <div className="font-black text-xl tracking-tight">{leader?.playerName || "—"}</div>
              <div className="text-gold font-black text-4xl tabular-nums tracking-tighter mt-2">
                {leader?.rpr.toFixed(0) || "—"}
              </div>
              <div className="text-[9px] text-text-muted tracking-[0.15em] uppercase mt-1">RPR</div>
            </div>

            {/* Competitor Count */}
            <div className="card-broadcast rounded-sm p-5 text-center">
              <div className="text-[9px] text-text-muted tracking-[0.2em] uppercase font-bold mb-3">
                Active Competitors
              </div>
              <div className="flex justify-center gap-2 mb-3">
                {ranked.slice(0, 5).map((p) => (
                  <span key={p.playerId} className="text-xl">
                    {ARCHETYPE_ICONS[p.performanceState] || "⚖️"}
                  </span>
                ))}
              </div>
              <div className="font-black text-3xl tabular-nums">{analytics.length}</div>
              <div className="text-[9px] text-text-muted tracking-[0.15em] uppercase mt-1">
                In The Database
              </div>
            </div>

            {/* Weather Widget */}
            <div className="card-broadcast rounded-sm p-5 text-center">
              <div className="text-[9px] text-text-muted tracking-[0.2em] uppercase font-bold mb-3">
                Christchurch Conditions
              </div>
              {weather ? (
                <>
                  <div className="text-3xl mb-1">{weather.icon}</div>
                  <div className="font-black text-2xl tabular-nums">{weather.temp}°C</div>
                  <div className="text-[10px] text-text-secondary mt-1">{weather.description}</div>
                  <div className="text-[9px] text-text-muted tracking-[0.12em] uppercase mt-2">
                    Theatre of Operations Status
                  </div>
                </>
              ) : (
                <>
                  <div className="text-3xl mb-1">🌤️</div>
                  <div className="text-[10px] text-text-muted tracking-wider uppercase">
                    Acquiring weather intelligence...
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mini leaderboard teaser */}
          <div className="max-w-4xl mx-auto mt-6">
            <div className="card-broadcast rounded-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                <span className="text-[9px] font-black tracking-[0.15em] text-text-muted uppercase">
                  Quick Standings
                </span>
                <Link
                  href="/dashboard"
                  className="text-[10px] font-bold tracking-wider text-gold hover:text-gold-light transition-colors uppercase"
                >
                  Full Rankings →
                </Link>
              </div>
              <div className="divide-y divide-border/30">
                {ranked.map((p, i) => (
                  <motion.div
                    key={p.playerId}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 1.0 + i * 0.06 }}
                    className="flex items-center justify-between px-5 py-3 hover:bg-bg-card-hover transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`font-black tabular-nums text-lg w-6 ${i === 0 ? "text-gold" : "text-text-muted"}`}>
                        {i + 1}
                      </span>
                      <span className="font-bold text-sm">{p.playerName}</span>
                      <span className="text-sm">{ARCHETYPE_ICONS[p.performanceState] || "⚖️"}</span>
                    </div>
                    <span className="text-gold font-black tabular-nums text-lg tracking-tight">
                      {p.rpr.toFixed(0)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>
      )}
    </div>
  );
}
