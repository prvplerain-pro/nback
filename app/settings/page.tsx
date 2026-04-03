import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SettingsClient from './SettingsClient'

type PageProps = {
  searchParams: Promise<{ complete?: string }>
}

export default async function SettingsPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const sp = await searchParams

  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'first_name, last_name, subscription_status, stripe_customer_id, email'
    )
    .eq('id', user.id)
    .single()

  const subscriptionStatus =
    (profile?.subscription_status as 'active' | 'inactive' | 'canceled') ??
    'inactive'

  return (
    <SettingsClient
      email={profile?.email ?? user.email ?? ''}
      initialFirstName={profile?.first_name?.trim() ?? ''}
      initialLastName={profile?.last_name?.trim() ?? ''}
      subscriptionStatus={subscriptionStatus}
      hasStripeCustomer={Boolean(profile?.stripe_customer_id)}
      showOnboardingBanner={sp.complete === '1'}
    />
  )
}
