import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SubscribeClient from './SubscribeClient'

export default async function SubscribePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Not logged in → redirect to login, then back here
  if (!user) redirect('/login?next=/subscribe')

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, email')
    .eq('id', user.id)
    .single()

  // Already premium → redirect to dashboard
  if (profile?.subscription_status === 'active') redirect('/dashboard')

  return <SubscribeClient email={profile?.email ?? ''} />
}
