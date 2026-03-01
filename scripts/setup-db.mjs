import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const supabaseUrl = "https://uxnczbfkfeohyztyzxyj.supabase.co";
const serviceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4bmN6YmZrZmVvaHl6dHl6eHlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjM5MjkyNSwiZXhwIjoyMDg3OTY4OTI1fQ.mK1qG4iJXooR676YEFgT-OnoTo8y1jB5exxIppziyfc";

const supabase = createClient(supabaseUrl, serviceKey);

// Split SQL into individual statements and execute them
async function runSQL(filePath, label) {
  console.log(`\n--- Running ${label} ---`);
  const sql = readFileSync(filePath, "utf-8");

  // Split on semicolons, filter empty
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  for (const stmt of statements) {
    // Skip pure comment blocks
    const cleaned = stmt.replace(/--.*$/gm, "").trim();
    if (!cleaned) continue;

    console.log(`  Executing: ${cleaned.substring(0, 80)}...`);
    const { error } = await supabase.rpc("", {}).then(() => ({ error: null })).catch(() => ({ error: "rpc not available" }));

    // Use the SQL endpoint via fetch
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
  }
}

// Actually, let's use the pg_meta SQL endpoint which is what the dashboard uses
async function executeSql(sql) {
  const res = await fetch(
    `${supabaseUrl}/pg/query`,
    {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        "x-connection-encrypted": "true",
      },
      body: JSON.stringify({ query: sql }),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SQL execution failed (${res.status}): ${text}`);
  }
  return res.json();
}

async function main() {
  try {
    console.log("Running schema...");
    const schema = readFileSync(join(__dirname, "../supabase/schema.sql"), "utf-8");
    const result1 = await executeSql(schema);
    console.log("Schema result:", JSON.stringify(result1).substring(0, 200));

    console.log("\nRunning seed data...");
    const seed = readFileSync(join(__dirname, "../supabase/seed.sql"), "utf-8");
    const result2 = await executeSql(seed);
    console.log("Seed result:", JSON.stringify(result2).substring(0, 200));

    console.log("\nDone! Verifying...");
    // Quick verification via REST API
    const { data: players, error } = await supabase.from("players").select("*");
    if (error) {
      console.log("Verification error:", error.message);
    } else {
      console.log(`Found ${players.length} players:`, players.map((p) => p.name));
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();
