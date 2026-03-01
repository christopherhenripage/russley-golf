"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

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
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [regName, setRegName] = useState("");
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState("");

  useEffect(() => {
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

  return (
    <div className="min-h-[80vh] flex flex-col">
      {/* HERO SECTION */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative flex-1 flex items-center justify-center py-12 md:py-24"
      >
        {/* Grid background */}
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: "linear-gradient(var(--color-gold) 1px, transparent 1px), linear-gradient(90deg, var(--color-gold) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold/[0.06] rounded-full blur-3xl" />

        <div className="relative text-center max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2.5 px-5 py-2 bg-gold/15 border-2 border-gold/35 mb-8"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-accent-green live-dot" />
            <span className="text-[11px] font-black tracking-[0.2em] text-gold uppercase">
              Season Active — Live Analytics
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.85] mb-4"
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
            className="text-text-secondary text-sm md:text-base max-w-2xl mx-auto mb-3 leading-relaxed"
          >
            The Russley Senior Performance Index™ — Where Social Golf Meets Cold, Hard Analytics.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-text-secondary text-xs max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Proprietary Elo-derived ratings. 10,000 Monte Carlo simulations.
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
              className="inline-block bg-gold text-bg-primary font-black py-4 px-12 text-base md:text-lg tracking-[0.15em] uppercase hover:bg-gold-light transition-all shadow-[0_0_50px_rgba(212,175,55,0.3)] hover:shadow-[0_0_70px_rgba(212,175,55,0.5)] hover:scale-[1.02]"
            >
              Enter the Arena
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* BOTTOM ROW: Weather + Registration */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.9 }}
        className="pb-12"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {/* COURSE CONDITIONS */}
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
                      <span className="text-sm font-black tabular-nums">{weather.windSpeed}km/h {weather.windDir}</span>
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

          {/* REGISTRATION */}
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
                All new entrants begin at RPR 1500.
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
        </div>
      </motion.section>
    </div>
  );
}
