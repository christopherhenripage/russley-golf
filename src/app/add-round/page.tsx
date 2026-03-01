"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
      setError(data.error || "Failed to add round");
    }
    setSubmitting(false);
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-2">Add Round</h1>
      <p className="text-text-secondary text-sm mb-8">
        Record a round. Analytics will recalculate automatically.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Player Select */}
        <div>
          <label className="block text-sm font-medium mb-2 text-text-secondary">
            Player
          </label>
          <select
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            required
            className="w-full bg-bg-card border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-gold transition-colors appearance-none"
          >
            <option value="">Select player...</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Course Select */}
        <div>
          <label className="block text-sm font-medium mb-2 text-text-secondary">
            Course
          </label>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            required
            className="w-full bg-bg-card border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-gold transition-colors appearance-none"
          >
            <option value="">Select course...</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} (Par {c.par})
              </option>
            ))}
          </select>
        </div>

        {/* Score Input */}
        <div>
          <label className="block text-sm font-medium mb-2 text-text-secondary">
            Final Score
          </label>
          <input
            type="number"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            required
            min={50}
            max={150}
            placeholder="e.g. 86"
            className="w-full bg-bg-card border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-gold transition-colors font-mono text-lg"
          />
        </div>

        {/* Date Picker */}
        <div>
          <label className="block text-sm font-medium mb-2 text-text-secondary">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full bg-bg-card border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-gold transition-colors"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-gold text-bg-primary font-bold py-3 px-6 rounded-lg hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Recording..." : "Record Round"}
        </button>

        {success && (
          <div className="bg-green-900/30 border border-green-700/50 text-green-300 rounded-lg p-4 text-sm text-center">
            Round recorded successfully! Recalculating analytics... Redirecting to dashboard.
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-700/50 text-red-300 rounded-lg p-4 text-sm text-center">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
