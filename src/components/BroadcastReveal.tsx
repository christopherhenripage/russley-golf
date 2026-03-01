"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface ImpactData {
  playerName: string;
  oldRpr: number;
  newRpr: number;
  rprDelta: number;
  oldRank: number;
  newRank: number;
  shockClassification: string;
  performanceState: string;
  score: number;
}

export default function BroadcastReveal({ impact }: { impact: ImpactData }) {
  const router = useRouter();
  const [phase, setPhase] = useState(0);
  const [displayRpr, setDisplayRpr] = useState(impact.oldRpr);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1500),   // Show player name
      setTimeout(() => setPhase(2), 2500),   // Start RPR counter
      setTimeout(() => setPhase(3), 4500),   // Show rank change / shock
      setTimeout(() => setPhase(4), 6500),   // Show CTA
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Animate RPR counter
  useEffect(() => {
    if (phase < 2) return;
    const start = impact.oldRpr;
    const end = impact.newRpr;
    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplayRpr(start + (end - start) * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [phase, impact.oldRpr, impact.newRpr]);

  // Auto-redirect after 12s
  useEffect(() => {
    const timer = setTimeout(() => router.push("/dashboard"), 12000);
    return () => clearTimeout(timer);
  }, [router]);

  const rankChanged = impact.oldRank !== impact.newRank;
  const rprUp = impact.rprDelta > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] bg-bg-primary flex items-center justify-center"
    >
      <div className="text-center px-6 max-w-lg w-full">
        {/* Phase 0: INCOMING INTELLIGENCE */}
        <AnimatePresence>
          {phase >= 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="h-[3px] bg-gold mb-6 origin-left"
              />
              <motion.p
                initial={{ opacity: 0, letterSpacing: "0.5em" }}
                animate={{ opacity: 1, letterSpacing: "0.3em" }}
                transition={{ duration: 1, delay: 0.3 }}
                className="text-gold text-[11px] font-black uppercase tracking-[0.3em]"
              >
                Incoming Intelligence
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase 1: Player Name */}
        <AnimatePresence>
          {phase >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <div className="text-text-muted text-[10px] tracking-[0.2em] uppercase font-bold mb-2">
                Round Logged — Score: {impact.score}
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">
                {impact.playerName}
              </h1>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase 2: RPR Counter */}
        <AnimatePresence>
          {phase >= 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="mb-8"
            >
              <div className="text-[9px] text-text-muted tracking-[0.2em] uppercase font-bold mb-1">
                Russley Performance Rating™
              </div>
              <div className="text-gold font-black text-7xl tabular-nums tracking-tighter leading-none">
                {Math.round(displayRpr)}
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className={`mt-2 text-lg font-black tabular-nums ${rprUp ? "text-perf-green" : impact.rprDelta < 0 ? "text-accent-red" : "text-text-muted"}`}
              >
                {impact.rprDelta > 0 ? "+" : ""}{impact.rprDelta.toFixed(1)} RPR
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase 3: Rank Change + Shock */}
        <AnimatePresence>
          {phase >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-3 mb-8"
            >
              {rankChanged && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="inline-flex items-center gap-3 px-5 py-2.5 bg-gold/15 border-2 border-gold/40"
                >
                  <span className="text-[11px] font-black tracking-[0.15em] text-gold uppercase">
                    Position Change
                  </span>
                  <span className="text-text-muted font-black text-lg">#{impact.oldRank}</span>
                  <span className="text-gold font-black">→</span>
                  <span className={`font-black text-lg ${impact.newRank < impact.oldRank ? "text-perf-green" : "text-accent-red"}`}>
                    #{impact.newRank}
                  </span>
                </motion.div>
              )}

              {impact.shockClassification !== "Expected" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className={`inline-flex items-center gap-2 px-4 py-2 border-2 text-[11px] font-black tracking-[0.12em] uppercase ${
                    impact.shockClassification === "Historic Collapse"
                      ? "border-alert-red/50 bg-alert-red/15 text-alert-red"
                      : impact.shockClassification === "Statistical Event"
                        ? "border-hot-orange/50 bg-hot-orange/15 text-hot-orange"
                        : "border-gold/40 bg-gold/10 text-gold"
                  }`}
                >
                  {impact.shockClassification === "Historic Collapse" && (
                    <span className="w-2 h-2 rounded-full bg-alert-red live-dot" />
                  )}
                  {impact.shockClassification}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase 4: CTA */}
        <AnimatePresence>
          {phase >= 4 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <button
                onClick={() => router.push("/dashboard")}
                className="bg-gold/10 border-2 border-gold/40 text-gold hover:bg-gold/20 hover:border-gold/60 font-black py-3 px-8 text-[11px] tracking-[0.15em] uppercase transition-all"
              >
                Return to Command Centre
              </button>
              <div className="mt-3 text-[9px] text-text-muted tracking-[0.15em] uppercase">
                Auto-redirecting in a few seconds...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
