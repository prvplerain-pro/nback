import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { needsProfileNames } from '@/lib/profileNames'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: sessions }] = await Promise.all([
    supabase
      .from('profiles')
      .select('high_score, streak_days, last_played_at, keys, first_name, last_name, sessions_today, subscription_status, is_admin')
      .eq('id', user.id)
      .single(),
    supabase
      .from('game_sessions')
      .select('n_level, score, trials, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(60),
  ])

  if (!profile) redirect('/login')
  if (needsProfileNames(profile)) {
    redirect('/settings?complete=1')
  }

  /** game_sessions.score je už uložené jako přesnost v % (0–100), ne počet správných */
  function clampPct(n: number) {
    return Math.min(100, Math.max(0, Math.round(n)))
  }

  // vážený průměr přesnosti podle počtu pokusů (více sezení / den)
  type DayAgg = { weightedSum: number; trialWeight: number }
  const sessionsByDay: Record<string, DayAgg> = {}
  let overallWeighted = 0
  let overallTrials = 0

  for (const s of sessions ?? []) {
    const day = s.created_at.split('T')[0]
    const pct = clampPct(s.score)
    const w = s.trials > 0 ? s.trials : 1
    if (!sessionsByDay[day]) sessionsByDay[day] = { weightedSum: 0, trialWeight: 0 }
    sessionsByDay[day].weightedSum += pct * w
    sessionsByDay[day].trialWeight += w
    overallWeighted += pct * w
    overallTrials += w
  }

  const dayPct = (day: string): number | null => {
    const d = sessionsByDay[day]
    if (!d || d.trialWeight === 0) return null
    return clampPct(d.weightedSum / d.trialWeight)
  }

  // poslední sezení — přesnost = uložené %
  const recentSessions = (sessions ?? []).slice(0, 4).map(s => ({
    nLevel: s.n_level,
    accuracy: clampPct(s.score),
    createdAt: s.created_at,
  }))

  // graf — posledních 14 dní
  const today = new Date()
  const chartDays = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (13 - i))
    return d.toISOString().split('T')[0]
  })

  const chartData = chartDays.map(day => dayPct(day))

  const chartLabels = chartDays.map(d => {
    const [, m, day] = d.split('-')
    return `${parseInt(day)}/${parseInt(m)}`
  })

  // heatmap — posledních 28 dní
  const heatmapDays = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (27 - i))
    return d.toISOString().split('T')[0]
  })

  const heatmapData = heatmapDays.map(day => {
    const acc = dayPct(day)
    if (acc === null) return 0
    if (acc >= 80) return 4
    if (acc >= 70) return 3
    if (acc >= 55) return 2
    return 1
  })

  const overallAccuracy = overallTrials > 0 ? clampPct(overallWeighted / overallTrials) : 0

  // Nejvyšší dosažené N: profil + max z uložených sezení (stará data / migrace)
  const maxNFromSessions =
    (sessions ?? []).length > 0 ? Math.max(...(sessions ?? []).map(s => s.n_level)) : 0
  const highScoreN = Math.max(1, profile.high_score ?? 1, maxNFromSessions)

  return (
    <DashboardClient
      subscriptionStatus={profile.subscription_status ?? null}
      isAdmin={profile.is_admin ?? false}
      highScore={highScoreN}
      streakDays={profile?.streak_days ?? 0}
      totalSessions={(sessions ?? []).length}
      overallAccuracy={overallAccuracy}
      sessionsToday={profile?.sessions_today ?? 0}
      recentSessions={recentSessions}
      chartLabels={chartLabels}
      chartData={chartData}
      heatmapData={heatmapData}
    />
  )
}
