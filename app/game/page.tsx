import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { nextNLevel } from '@/lib/game'
import { Profile } from '@/types'
import GameClient from './GameClient'

export default async function GamePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: lastSession }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single<Profile>(),
    supabase
      .from('game_sessions')
      .select('n_level, score')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  if (!profile) redirect('/login')
  if (profile.keys === 0) {
    redirect(profile.recovery_forfeited ? '/locked' : '/recovery')
  }

  // Stejná adaptivní logika jako po sezení: ≥90 % → +1 N, <80 % → −1 N, jinak stejné N
  const initialNLevel = lastSession
    ? nextNLevel(lastSession.n_level, lastSession.score)
    : profile.high_score

  return <GameClient initialNLevel={initialNLevel} />
}
