export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

// ── Shared constants (safe to import in client components) ─
export const MAX_KEYS          = 3
export const HIGH_SCORE_STREAK = 3
export const LEVEL_UP_THRESHOLD   = 90
export const LEVEL_DOWN_THRESHOLD = 80

export interface Profile {
  id: string
  email: string
  first_name?: string | null
  last_name?: string | null
  keys: number                      // 0–3
  high_score: number                // highest N at which a session was completed (always max historical N)
  consecutive_high_scores: number   // streak toward key recovery
  last_played_at: string | null
  streak_days: number
  sessions_today: number
  last_session_date: string | null
  subscription_status: 'active' | 'inactive' | 'canceled'
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  referral_code: string | null
  referred_by: string | null
  referral_bonus_given: boolean
  is_admin: boolean
  created_at: string
}

export interface GameSession {
  id: string
  user_id: string
  n_level: number
  score: number
  position_score: number | null
  audio_score: number | null
  duration_seconds: number | null
  played_at_hour: number | null
  trials: number
  created_at: string
}

export interface GameTrial {
  position: number   // 0–8 excluding 4 (center)
  letter: string     // C H K L Q R S T
}

// position in the 3×3 grid → [row, col]
export const GRID_LAYOUT: Record<number, [number, number]> = {
  0: [0, 0], 1: [0, 1], 2: [0, 2],
  3: [1, 0],            5: [1, 2],  // 4 = center, never used
  6: [2, 0], 7: [2, 1], 8: [2, 2],
}

export type GamePhase = 'idle' | 'stimulus' | 'response' | 'feedback' | 'finished'

export interface GameState {
  nLevel: number
  trials: GameTrial[]
  currentIndex: number
  responses: Array<{ position: boolean; audio: boolean }>
  phase: GamePhase
  score: number | null              // filled on 'finished'
  positionScore: number | null
  audioScore: number | null
  nextNLevel: number | null
}
