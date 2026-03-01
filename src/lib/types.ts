// Database types matching Supabase schema

export interface Database {
  public: {
    Tables: {
      players: {
        Row: Player;
        Insert: Omit<Player, "id" | "created_at">;
        Update: Partial<Omit<Player, "id">>;
      };
      courses: {
        Row: Course;
        Insert: Omit<Course, "id" | "created_at">;
        Update: Partial<Omit<Course, "id">>;
      };
      rounds: {
        Row: Round;
        Insert: Omit<Round, "id" | "created_at">;
        Update: Partial<Omit<Round, "id">>;
      };
      ratings_history: {
        Row: RatingSnapshot;
        Insert: Omit<RatingSnapshot, "id" | "created_at">;
        Update: Partial<Omit<RatingSnapshot, "id">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export interface Player {
  id: string;
  name: string;
  created_at: string;
}

export interface Course {
  id: string;
  name: string;
  par: number;
  course_rating: number;
  slope_rating: number;
  created_at: string;
}

export interface Round {
  id: string;
  player_id: string;
  course_id: string;
  date: string;
  score: number;
  created_at: string;
}

export interface RatingSnapshot {
  id: string;
  player_id: string;
  date: string;
  rpr: number;
  volatility: number;
  momentum: number;
  created_at?: string;
}

// Computed analytics types

export interface AdjustedRound {
  round: Round;
  course: Course;
  adjustedScore: number;
}

export interface PlayerAnalytics {
  playerId: string;
  playerName: string;
  rpr: number;
  rollingAverage: number;
  volatility: number;
  momentum: number;
  performanceState: PerformanceState;
  recentShock: ShockLabel | null;
  titleOdds: number;
  roundCount: number;
  careerAverage: number;
  bestAdjustedScore: number;
}

export type PerformanceState =
  | "Heater"
  | "Stable Veteran"
  | "Ice Veins"
  | "Regression Watch"
  | "Chaos Merchant";

export type ShockLabel =
  | "Expected"
  | "Mild Disturbance"
  | "Statistical Event"
  | "Historic Collapse";

export interface RivalryRecord {
  playerAId: string;
  playerBId: string;
  playerAName: string;
  playerBName: string;
  playerAWinPct: number;
  avgStrokeDifferential: number;
  totalRounds: number;
  psychEdgeA: number;
}

export interface CourseStats {
  courseId: string;
  courseName: string;
  averageScore: number;
  roundsPlayed: number;
}

export interface SimulationResult {
  playerId: string;
  playerName: string;
  winProbability: number;
  beatProbabilities: Record<string, number>;
  personalBestProbability: number;
}

export interface WeeklyRecap {
  headline: string;
  narratives: string[];
  momentumCommentary: string;
}
