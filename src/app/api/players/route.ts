import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const name = (body.name || "").trim();

  if (!name || name.length < 2) {
    return NextResponse.json(
      { error: "Competitor designation must be at least 2 characters." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("players")
    .insert({ name })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Initialize rating at 1500
  await supabase.from("ratings_history").insert({
    player_id: data.id,
    date: new Date().toISOString().split("T")[0],
    rpr: 1500,
    volatility: 0,
    momentum: 0,
  });

  return NextResponse.json(data, { status: 201 });
}
