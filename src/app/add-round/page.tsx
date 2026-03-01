"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Player, Course } from "@/lib/types";

export default function AddRoundPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [playerId, setPlayerId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [score, setScore] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/players").then((r) => r.json()),
      fetch("/api/courses").then((r) => r.json()),
    ]).then(([p, c]) => {
      setPlayers(p);
      setCourses(c);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess(false);

    const res = await fetch("/api/rounds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        player_id: playerId,
        course_id: courseId,
        score: parseInt(score),
        date,
      }),
    });

    if (res.ok) {
      setSuccess(true);
      setScore("");
      setTimeout(() => router.push("/"), 1500);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to submit intelligence");
    }
    setSubmitting(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-lg mx-auto"
    >
      <div className="card-broadcast glow-gold rounded-sm overflow-hidden">
        <div className="bg-gold h-[2px]" />
        <div className="p-6">
          <span className="section-label">Submit Field Intelligence</span>
          <h1 className="text-2xl font-black mt-3 tracking-tight">Record Tactical Output</h1>
          <p className="text-text-muted text-[10px] tracking-[0.12em] uppercase mt-2">
            All analytics engines will recalibrate upon submission. Monte Carlo simulations will re-execute.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5 mt-6">
            <div>
              <label className="block text-[9px] font-bold tracking-[0.15em] uppercase text-text-muted mb-2">
                Competitor Designation
              </label>
              <select
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                required
                className="w-full bg-bg-surface border border-border rounded-sm px-4 py-3 text-text-primary focus:outline-none focus:border-gold transition-colors appearance-none text-sm font-medium"
              >
                <option value="">Select competitor...</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-bold tracking-[0.15em] uppercase text-text-muted mb-2">
                Theatre of Operations
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                required
                className="w-full bg-bg-surface border border-border rounded-sm px-4 py-3 text-text-primary focus:outline-none focus:border-gold transition-colors appearance-none text-sm font-medium"
              >
                <option value="">Select terrain...</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} (Par {c.par})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-bold tracking-[0.15em] uppercase text-text-muted mb-2">
                Raw Tactical Output (Strokes)
              </label>
              <input
                type="number"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                required
                min={50}
                max={150}
                placeholder="e.g. 86"
                className="w-full bg-bg-surface border border-border rounded-sm px-4 py-3 text-text-primary focus:outline-none focus:border-gold transition-colors tabular-nums text-2xl font-black tracking-tight"
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold tracking-[0.15em] uppercase text-text-muted mb-2">
                Date of Engagement
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-bg-surface border border-border rounded-sm px-4 py-3 text-text-primary focus:outline-none focus:border-gold transition-colors text-sm font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gold text-bg-primary font-black py-3 px-6 rounded-sm hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm tracking-[0.1em] uppercase"
            >
              {submitting ? "Transmitting Intelligence..." : "Submit to the Index"}
            </button>

            {success && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-perf-green/5 border border-perf-green/30 text-perf-green rounded-sm p-4 text-[10px] text-center font-bold tracking-[0.15em] uppercase"
              >
                Intel received. All systems recalibrating. Redirecting to Command Centre...
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-alert-red/5 border border-alert-red/30 text-alert-red rounded-sm p-4 text-[10px] text-center font-bold tracking-[0.15em] uppercase"
              >
                {error}
              </motion.div>
            )}
          </form>
        </div>
      </div>
    </motion.div>
  );
}
