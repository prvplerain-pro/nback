import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Profile } from '@/types'
import GameClient from '../game/GameClient'

export default async function RecoveryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>()

  if (!profile) redirect('/login')
  if (profile.keys > 0) redirect('/game')

  return (
    <GameClient
      initialNLevel={profile.high_score}
      isRecovery
      consecutiveHighScores={profile.consecutive_high_scores}
    />
  )
}
