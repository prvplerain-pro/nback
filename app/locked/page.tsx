import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Profile } from '@/types'
import LockedClient from './LockedClient'

export default async function LockedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>()

  if (!profile)           redirect('/login')
  if (profile.keys > 0)  redirect('/game')

  return <LockedClient profile={profile} recoveryForfeited={profile.recovery_forfeited ?? false} />
}
