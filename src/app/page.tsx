"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { PlayerAnalytics } from "@/lib/types";

const ARCHETYPE_ICONS: Record<string, string> = {
  Heater: "🔥",
  "Stable Veteran": "⚖️",
  "Ice Veins": "🧊",
  "Regression Watch": "📉",
  "Chaos Merchant": "🌪️",
};

interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  windSpeed: number;
  windDir: string;
  humidity: number;
  scoringDifficulty: string;
  scoringColor: string;
}

function getScoringDifficulty(wind: number, temp: number): { label: string; color: string } {
  const score = wind * 0.6 + Math.abs(temp - 18) * 0.4;
  if (score > 20) return { label: "EXTREME", color: "text-alert-red" };
  if (score > 12) return { label: "HIGH", color: "text-hot-orange" };
  if (score > 6) return { label: "MODERATE", color: "text-gold" };
  return { label: "LOW", color: "text-perf-green" };
}

export default function LandingPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<PlayerAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  // Registration form
  const [regName, setRegName] = useState("");
  const [regStyle, setRegStyle] = useState("");
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState("");

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((data) => {
        setAnalytics(data);
        setLoading(false);
      });

    fetch("https://wttr.in/Christchurch+NZ?format=j1")
      .then((r) => r.json())
      .then((data) => {
        const current = data.current_condition?.[0];
        if (current) {
          const windSpeed = parseInt(current.windspeedKmph) || 0;
          const temp = parseInt(current.temp_C) || 15;
          const difficulty = getScoringDifficulty(windSpeed, temp);
          setWeather({
            temp,
            description: current.weatherDesc?.[0]?.value || "Unknown",
            icon: parseInt(current.cloudcover) > 60 ? "☁️" : temp > 20 ? "☀️" : "🌤️",
            windSpeed,
            windDir: current.winddir16Point || "N",
            humidity: parseInt(current.humidity) || 0,
            scoringDifficulty: difficulty.label,
            scoringColor: difficulty.color,
          });
        }
      })
      .catch(() => {});
  }, []);

  async function handleRegistration(e: React.FormEvent) {
    e.preventDefault();
    setRegSubmitting(true);
    setRegError("");
    setRegSuccess(false);

    const res = await fetch("/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: regName.trim() }),
    });

    if (res.ok) {
      setRegSuccess(true);
      setRegName("");
      setTimeout(() => setRegSuccess(false), 4000);
    } else {
      const data = await res.json().catch(() => ({}));
      setRegError(data.error || "Registration failed. The system has logged this incident.");
    }
    setRegSubmitting(false);
  }

  const ranked = [...analytics].sort((a, b) => b.rpr - a.rpr);
  const leader = ranked[0];

  return (
    <div className="min-h-[80vh] flex flex-col">
      {/* HERO SECTION */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative flex-1 flex items-center justify-center py-16 md:py-24"
      >
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(var(--color-gold) 1px, transparent 1px), linear-gradient(90deg, var(--color-gold) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />

        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/[0.02] rounded-full blur-3xl" />

        <div className="relative text-center max-w-4xl mx-auto px-4">
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
            className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] mb-4"
          >
            <span className="text-gold">QUANTIFYING</span>
            <br />
            <span className="text-gold">GREATNESS.</span>
            <br />
            <span className="text-text-primary">WEEKLY.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-text-secondary text-sm md:text-base max-w-2xl mx-auto mb-4 leading-relaxed"
          >
            The Russley Senior Performance Index™ — Where Social Golf Meets Cold, Hard Analytics.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-text-muted text-xs max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Proprietary Elo-derived ratings. 10,000 Monte Carlo simulations. Psychological warfare metrics.
            A level of statistical rigour that is, by any reasonable measure, entirely unnecessary
            for a weekly social golf group in Christchurch, New Zealand.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Link
              href="/dashboard"
              className="inline-block bg-gold text-bg-primary font-black py-4 px-12 text-base tracking-[0.15em] uppercase hover:bg-gold-light transition-colors shadow-[0_0_40px_rgba(212,175,55,0.2)] hover:shadow-[0_0_60px_rgba(212,175,55,0.3)]"
            >
              Enter the Arena
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* LOWER SECTION: Weather + Registration + Leader */}
      {!loading && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="pb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {/* COURSE CONDITIONS WIDGET */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
              className="card-broadcast rounded-sm overflow-hidden"
            >
              <div className="bg-gradient-to-r from-transparent via-gold/30 to-transparent h-[1px]" />
              <div className="p-5">
                <span className="section-label">Course Conditions</span>
                {weather ? (
                  <div className="mt-4">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-4xl">{weather.icon}</span>
                      <div>
                        <div className="font-black text-3xl tabular-nums leading-none">{weather.temp}°C</div>
                        <div className="text-[10px] text-text-secondary mt-0.5">{weather.description}</div>
                      </div>
                    </div>

                    <div className="space-y-2.5 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-text-muted tracking-[0.12em] uppercase font-bold">Wind</span>
                        <span className="text-sm font-black tabular-nums">
                          {weather.windSpeed}km/h {weather.windDir}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-text-muted tracking-[0.12em] uppercase font-bold">Humidity</span>
                        <span className="text-sm font-bold tabular-nums">{weather.humidity}%</span>
                      </div>
                    </div>

                    <div className="bg-bg-surface border border-border rounded-sm p-3">
                      <div className="text-[8px] text-text-muted tracking-[0.2em] uppercase font-bold mb-1">
                        Projected Scoring Difficulty
                      </div>
                      <div className={`text-lg font-black tracking-tight ${weather.scoringColor}`}>
                        {weather.scoringDifficulty}
                      </div>
                      <div className="text-[9px] text-text-muted mt-1">
                        Based on wind, temp deviation from optimal 18°C
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 text-center py-6">
                    <span className="text-3xl">🌤️</span>
                    <div className="text-[10px] text-text-muted tracking-wider uppercase mt-2">
                      Acquiring weather intelligence...
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* PLAYER ONBOARDING / REGISTRATION */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.1 }}
              className="card-broadcast glow-gold rounded-sm overflow-hidden"
            >
              <div className="bg-gold h-[2px]" />
              <div className="p-5">
                <span className="section-label">Player Onboarding</span>
                <p className="text-text-muted text-[10px] tracking-[0.1em] uppercase mt-3 mb-5 leading-relaxed">
                  Submit your designation to be entered into the Performance Index database.
                  All new entrants begin at RPR 1500. The algorithms will take it from there.
                </p>

                <form onSubmit={handleRegistration} className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-bold tracking-[0.15em] uppercase text-text-muted mb-2">
                      Competitor Designation
                    </label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required
                      placeholder="e.g. Macca"
                      className="w-full bg-bg-surface border border-border rounded-sm px-4 py-3 text-text-primary focus:outline-none focus:border-gold transition-colors text-sm font-bold placeholder:text-text-muted/40"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold tracking-[0.15em] uppercase text-text-muted mb-2">
                      Playing Style
                    </label>
                    <select
                      value={regStyle}
                      onChange={(e) => setRegStyle(e.target.value)}
                      className="w-full bg-bg-surface border border-border rounded-sm px-4 py-3 text-text-primary focus:outline-none focus:border-gold transition-colors appearance-none text-sm font-bold"
                    >
                      <option value="">Select archetype...</option>
                      <option value="aggressive">Aggressive — Grip It & Rip It</option>
                      <option value="conservative">Conservative — Fairways & Greens</option>
                      <option value="wild">Wild Card — Chaos Theory</option>
                      <option value="grinder">The Grinder — Scramble & Save</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={regSubmitting || !regName.trim()}
                    className="w-full bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 hover:border-gold/50 font-black py-3 px-6 text-[11px] tracking-[0.15em] uppercase transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {regSubmitting ? "Processing Intake..." : "Register for the Index"}
                  </button>

                  {regSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-perf-green/5 border border-perf-green/30 text-perf-green rounded-sm p-3 text-[10px] text-center font-bold tracking-[0.12em] uppercase"
                    >
                      Competitor registered. RPR initialised at 1500. Welcome to the Index.
                    </motion.div>
                  )}
                  {regError && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-alert-red/5 border border-alert-red/30 text-alert-red rounded-sm p-3 text-[10px] text-center font-bold tracking-[0.12em] uppercase"
                    >
                      {regError}
                    </motion.div>
                  )}
                </form>
              </div>
            </motion.div>

            {/* CURRENT LEADER + QUICK STATS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="card-broadcast glow-gold-intense rounded-sm overflow-hidden"
            >
              <div className="bg-gradient-to-r from-transparent via-gold to-transparent h-[2px]" />
              <div className="p-5 text-center">
                <span className="section-label">Current #1</span>
                <div className="mt-4">
                  <div className="text-3xl mb-2">🏆</div>
                  <div className="font-black text-2xl tracking-tight">{leader?.playerName || "—"}</div>
                  <div className="text-gold font-black text-5xl tabular-nums tracking-tighter mt-2 leading-none">
                    {leader?.rpr.toFixed(0) || "—"}
                  </div>
                  <div className="text-[9px] text-text-muted tracking-[0.15em] uppercase mt-1 mb-4">
                    Russley Performance Rating™
                  </div>

                  {leader && (
                    <div className="space-y-2 text-left">
                      <div className="flex justify-between items-center bg-bg-surface rounded-sm px-3 py-2 border border-border">
                        <span className="text-[9px] text-text-muted tracking-[0.12em] uppercase font-bold">Archetype</span>
                        <span className="text-[10px] font-black text-gold">
                          {ARCHETYPE_ICONS[leader.performanceState]} {leader.performanceState === "Heater" ? "THE FURNACE" : leader.performanceState === "Ice Veins" ? "THE MACHINE" : "THE TACTICIAN"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-bg-surface rounded-sm px-3 py-2 border border-border">
                        <span className="text-[9px] text-text-muted tracking-[0.12em] uppercase font-bold">Volatility</span>
                        <span className="text-sm font-black tabular-nums">{leader.volatility.toFixed(2)}σ</span>
                      </div>
                      <div className="flex justify-between items-center bg-bg-surface rounded-sm px-3 py-2 border border-border">
                        <span className="text-[9px] text-text-muted tracking-[0.12em] uppercase font-bold">Competitors</span>
                        <span className="text-sm font-black tabular-nums">{analytics.length}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Mini leaderboard teaser */}
          <div className="max-w-5xl mx-auto mt-6">
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
                    transition={{ duration: 0.4, delay: 1.3 + i * 0.06 }}
                  >
                    <Link
                      href={`/player/${p.playerId}`}
                      className="flex items-center justify-between px-5 py-3 hover:bg-bg-card-hover transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`font-black tabular-nums text-lg w-6 ${i === 0 ? "text-gold" : "text-text-muted"}`}>
                          {i + 1}
                        </span>
                        <span className="font-bold text-sm group-hover:text-gold transition-colors">{p.playerName}</span>
                        <span className="text-sm">{ARCHETYPE_ICONS[p.performanceState] || "⚖️"}</span>
                      </div>
                      <span className="text-gold font-black tabular-nums text-lg tracking-tight">
                        {p.rpr.toFixed(0)}
                      </span>
                    </Link>
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
