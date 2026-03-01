"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PlayerAnalytics, WeeklyRecap } from "@/lib/types";

function generateHeadlines(analytics: PlayerAnalytics[], recap: WeeklyRecap): string[] {
  const headlines: string[] = [];
  const ranked = [...analytics].sort((a, b) => b.rpr - a.rpr);

  for (const p of analytics) {
    if (p.performanceState === "Heater") {
      headlines.push(`🔥 ${p.playerName.toUpperCase()}'s RPR trajectory classified as "UNSUSTAINABLE" — unprecedented thermal output detected`);
    }
    if (p.performanceState === "Chaos Merchant") {
      headlines.push(`🌪️ ${p.playerName.toUpperCase()}'s Volatility Index (${p.volatility.toFixed(2)}σ) has triggered circuit breakers`);
    }
    if (p.recentShock === "Historic Collapse") {
      headlines.push(`🚨 HISTORIC COLLAPSE: ${p.playerName.toUpperCase()} triggered a >2σ deviation alert — Performance Forensics deployed`);
    }
    if (p.recentShock === "Statistical Event") {
      headlines.push(`⚠️ STATISTICAL ANOMALY: ${p.playerName.toUpperCase()} generates data point that broke the prediction model`);
    }
  }

  if (ranked[0]) {
    headlines.push(`🏆 ${ranked[0].playerName.toUpperCase()} maintains stranglehold on #1 with RPR ${ranked[0].rpr.toFixed(0)}`);
  }

  if (ranked.length >= 2) {
    const gap = ranked[0].rpr - ranked[1].rpr;
    if (gap < 30) {
      headlines.push(`⚔️ Only ${gap.toFixed(0)} RPR points separate ${ranked[0].playerName} and ${ranked[1].playerName}`);
    }
  }

  if (recap.momentumCommentary) {
    headlines.push(recap.momentumCommentary);
  }

  return headlines.length > 0 ? headlines : ["📊 RSPI systems online — monitoring all performance vectors"];
}

export default function RotatingHeadline({
  analytics,
  recap,
}: {
  analytics: PlayerAnalytics[];
  recap: WeeklyRecap;
}) {
  const headlines = generateHeadlines(analytics, recap);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % headlines.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [headlines.length]);

  return (
    <div className="relative overflow-hidden bg-bg-surface border-y-2 border-gold/30 py-3">
      <div className="flex items-center px-4">
        <div className="shrink-0 flex items-center gap-2 pr-4 border-r-2 border-gold/30 mr-4">
          <div className="w-2.5 h-2.5 rounded-full bg-alert-red live-dot" />
          <span className="text-[11px] font-black tracking-[0.15em] text-alert-red uppercase">
            Live
          </span>
        </div>
        <div className="flex-1 overflow-hidden h-5 relative">
          <AnimatePresence mode="wait">
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 text-[13px] text-text-secondary font-bold tracking-wide whitespace-nowrap overflow-hidden text-ellipsis"
            >
              {headlines[index]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
