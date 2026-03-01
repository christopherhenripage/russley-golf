/**
 * Recalculate all RPR ratings from round history.
 * Run with: node scripts/recalc-ratings.mjs
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uxnczbfkfeohyztyzxyj.supabase.co";
const serviceKey = process.env.SUPABASE_SERVICE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4bmN6YmZrZmVvaHl6dHl6eHlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjM5MjkyNSwiZXhwIjoyMDg3OTY4OTI1fQ.mK1qG4iJXooR676YEFgT-OnoTo8y1jB5exxIppziyfc";
const supabase = createClient(supabaseUrl, serviceKey);

function adjustedScore(rawScore, courseRating) {
  return rawScore - (courseRating - 72);
}

function volatilityIndex(scores) {
  if (scores.length < 2) return 0;
  const recent = scores.slice(0, 8);
  const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
  const variance = recent.reduce((sum, s) => sum + (s - mean) ** 2, 0) / (recent.length - 1);
  return Math.sqrt(variance);
}

function momentum(scores) {
  const recent = scores.slice(0, 5);
  if (recent.length < 2) return 0;
  const n = recent.length;
  const reversed = [...recent].reverse();
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i; sumY += reversed[i]; sumXY += i * reversed[i]; sumXX += i * i;
  }
  return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
}

function expectedScore(rA, rB) {
  return 1 / (1 + Math.pow(10, (rB - rA) / 400));
}

const K = 12;

async function main() {
  const [{ data: players }, { data: courses }, { data: rounds }] = await Promise.all([
    supabase.from("players").select("*"),
    supabase.from("courses").select("*"),
    supabase.from("rounds").select("*").order("date", { ascending: true }),
  ]);

  const courseMap = new Map(courses.map(c => [c.id, c]));
  const ratings = new Map(players.map(p => [p.id, 1500]));
  const allAdj = new Map(players.map(p => [p.id, []])); // newest first

  // Group rounds by date
  const byDate = new Map();
  for (const r of rounds) {
    if (!byDate.has(r.date)) byDate.set(r.date, []);
    byDate.get(r.date).push(r);
  }

  // Clear existing ratings
  await supabase.from("ratings_history").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  console.log("Cleared old ratings history");

  const sortedDates = [...byDate.keys()].sort();
  for (const date of sortedDates) {
    const dateRounds = byDate.get(date);

    // Compute adjusted scores for this date
    const playerScores = [];
    for (const r of dateRounds) {
      const course = courseMap.get(r.course_id);
      if (!course) continue;
      const adj = adjustedScore(r.score, course.course_rating);
      playerScores.push({ playerId: r.player_id, adjScore: adj });
      allAdj.get(r.player_id)?.unshift(adj);
    }

    // Elo pairwise update
    if (playerScores.length >= 2) {
      for (let i = 0; i < playerScores.length; i++) {
        for (let j = i + 1; j < playerScores.length; j++) {
          const a = playerScores[i], b = playerScores[j];
          const rA = ratings.get(a.playerId), rB = ratings.get(b.playerId);
          const eA = expectedScore(rA, rB);
          let aA, aB;
          if (a.adjScore < b.adjScore) { aA = 1; aB = 0; }
          else if (a.adjScore > b.adjScore) { aA = 0; aB = 1; }
          else { aA = 0.5; aB = 0.5; }
          ratings.set(a.playerId, rA + K * (aA - eA));
          ratings.set(b.playerId, rB + K * (aB - (1 - eA)));
        }
      }
    }

    // Save snapshots for players who played
    const playersOnDate = new Set(dateRounds.map(r => r.player_id));
    for (const pid of playersOnDate) {
      const scores = allAdj.get(pid) || [];
      const { error } = await supabase.from("ratings_history").insert({
        player_id: pid,
        date,
        rpr: Math.round(ratings.get(pid) * 100) / 100,
        volatility: Math.round(volatilityIndex(scores) * 100) / 100,
        momentum: Math.round(momentum(scores) * 100) / 100,
      });
      if (error) console.error(`Error inserting rating for ${pid} on ${date}:`, error.message);
    }

    console.log(`Processed ${date}: ${playerScores.length} players`);
  }

  // Print final standings
  console.log("\nFinal RPR Standings:");
  const playerMap = new Map(players.map(p => [p.id, p.name]));
  const standings = [...ratings.entries()]
    .map(([id, rpr]) => ({ name: playerMap.get(id), rpr: Math.round(rpr * 100) / 100 }))
    .sort((a, b) => b.rpr - a.rpr);
  for (const s of standings) {
    console.log(`  ${s.name}: ${s.rpr}`);
  }
}

main().catch(console.error);
