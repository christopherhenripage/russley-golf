-- Russley Senior Performance Index™ - Database Schema
-- Run this in your Supabase SQL Editor

-- Players table
create table players (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamp with time zone default now()
);

-- Courses table
create table courses (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  par integer not null,
  course_rating float not null,
  slope_rating integer not null,
  created_at timestamp with time zone default now()
);

-- Rounds table
create table rounds (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  date date not null,
  score integer not null,
  created_at timestamp with time zone default now()
);

-- Ratings history table
create table ratings_history (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  date date not null,
  rpr float not null default 1500,
  volatility float not null default 0,
  momentum float not null default 0,
  created_at timestamp with time zone default now()
);

-- Indexes for performance
create index idx_rounds_player_id on rounds(player_id);
create index idx_rounds_course_id on rounds(course_id);
create index idx_rounds_date on rounds(date);
create index idx_ratings_history_player_id on ratings_history(player_id);
create index idx_ratings_history_date on ratings_history(date);

-- Enable Row Level Security (open for now — restrict later as needed)
alter table players enable row level security;
alter table courses enable row level security;
alter table rounds enable row level security;
alter table ratings_history enable row level security;

create policy "Allow all on players" on players for all using (true) with check (true);
create policy "Allow all on courses" on courses for all using (true) with check (true);
create policy "Allow all on rounds" on rounds for all using (true) with check (true);
create policy "Allow all on ratings_history" on ratings_history for all using (true) with check (true);
