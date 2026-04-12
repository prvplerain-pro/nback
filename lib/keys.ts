import { createClient } from '@/lib/supabase/server'
import { Profile, MAX_KEYS, HIGH_SCORE_STREAK, LEVEL_UP_THRESHOLD } from '@/types'

// ── After every completed session ─────────────────────────
export async function processGameResult(
  userId: string,
  nLevel: number,
  scorePercent: number,
  extra?: {
    positionScore?: number
    audioScore?: number
    durationSeconds?: number
    playedAtHour?: number
  }
) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single<Profile>()

  if (!profile) throw new Error('Profile not found')

  const today = new Date().toISOString().split('T')[0]
  const lastDate = profile.last_session_date
  const isNewDay = !lastDate || lastDate < today

  const prevSessionsToday = profile.sessions_today ?? 0
  const newSessionsToday = isNewDay ? 1 : prevSessionsToday + 1
  const dailyGoalReached = newSessionsToday >= 14

  // Nejvyšší N, na kterém uživatel kdy dokončil sezení (nezávisle na %)
  // Během locku (keys === 0) high_score nezvyšuj — recovery nesmí „levelovat“ nad N z před locku
  const newHighScore =
    profile.keys === 0 ? profile.high_score : Math.max(profile.high_score, nLevel)

  // Streak klíčů: stále jen při silné hře (≥90 %) — porovnáváme proti N před tímto sezením
  const beatsHighScore   = nLevel > profile.high_score && scorePercent >= LEVEL_UP_THRESHOLD
  const matchesHighScore = nLevel >= profile.high_score && scorePercent >= LEVEL_UP_THRESHOLD
  const recoveryPass     = beatsHighScore || matchesHighScore

  let newConsecutive = profile.consecutive_high_scores
  let newKeys        = profile.keys

  if (beatsHighScore) {
    newConsecutive = 1
  } else if (matchesHighScore) {
    newConsecutive += 1
  } else {
    newConsecutive = 0
  }

  // Award key only when locked (keys === 0) and streak reached
  if (newKeys === 0 && newConsecutive >= HIGH_SCORE_STREAK) {
    newKeys        = 1
    newConsecutive = 0
  }

  let recoveryForfeited = profile.recovery_forfeited ?? false
  if (profile.keys === 0) {
    if (!recoveryPass) recoveryForfeited = true
  } else {
    recoveryForfeited = false
  }
  if (newKeys > 0) recoveryForfeited = false

  const newStreak = wasPlayedYesterday(profile.last_played_at)
    ? profile.streak_days + 1
    : 1

  await supabase
    .from('profiles')
    .update({
      high_score:              newHighScore,
      consecutive_high_scores: newConsecutive,
      keys:                    newKeys,
      recovery_forfeited:      recoveryForfeited,
      last_played_at:          new Date().toISOString(),
      streak_days:             newStreak,
      sessions_today:          newSessionsToday,
      last_session_date:       today,
    })
    .eq('id', userId)

  await supabase.from('game_sessions').insert({
    user_id: userId,
    n_level: nLevel,
    score:   Math.round(scorePercent),
    trials:  nLevel + 20,
    position_score:   extra?.positionScore ?? null,
    audio_score:      extra?.audioScore ?? null,
    duration_seconds: extra?.durationSeconds ?? null,
    played_at_hour:   extra?.playedAtHour ?? null,
  })

  return {
    newKeys,
    newHighScore,
    newConsecutive,
    newStreak,
    newSessionsToday,
    dailyGoalReached,
    recoveryForfeited,
  }
}

// ── Referral: give +1 key to referrer ─────────────────────
export async function applyReferralBonus(
  newUserId: string,
  referrerId: string
) {
  const supabase = await createClient()

  const { data: referrer } = await supabase
    .from('profiles')
    .select('keys, referral_bonus_given')
    .eq('id', referrerId)
    .single<Profile>()

  if (referrer && !referrer.referral_bonus_given) {
    const newRefKeys = Math.min(MAX_KEYS, referrer.keys + 1)
    await supabase
      .from('profiles')
      .update({
        keys: newRefKeys,
        referral_bonus_given: true,
        ...(referrer.keys === 0 ? { recovery_forfeited: false } : {}),
      })
      .eq('id', referrerId)
  }

  // New user already has 3 keys from signup trigger — no change needed
}

// ── Helper ─────────────────────────────────────────────────
function wasPlayedYesterday(lastPlayedAt: string | null): boolean {
  if (!lastPlayedAt) return false
  const yesterday = new Date()
  yesterday.setUTCDate(yesterday.getUTCDate() - 1)
  yesterday.setUTCHours(0, 0, 0, 0)
  const yesterdayEnd = new Date(yesterday)
  yesterdayEnd.setUTCHours(23, 59, 59, 999)
  const last = new Date(lastPlayedAt)
  return last >= yesterday && last <= yesterdayEnd
}
