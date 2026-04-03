import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (profile?.is_admin !== true) redirect('/dashboard')

  // Fetch all profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, keys, high_score, consecutive_high_scores, streak_days, last_played_at, created_at')
    .order('created_at', { ascending: false })

  return <AdminClient profiles={profiles ?? []} />
}
