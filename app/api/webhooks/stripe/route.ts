import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { applyReferralBonus } from '@/lib/keys'
import Stripe from 'stripe'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = serviceClient()

  switch (event.type) {

    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId  = session.metadata?.user_id
      if (!userId) break

      await supabase
        .from('profiles')
        .update({
          subscription_status:    'active',
          stripe_customer_id:     session.customer as string,
          stripe_subscription_id: session.subscription as string,
          keys: 3,
          recovery_forfeited: false,
        })
        .eq('id', userId)

      // Apply referral bonus if this user was referred
      const { data: profile } = await supabase
        .from('profiles')
        .select('referred_by')
        .eq('id', userId)
        .single()

      if (profile?.referred_by) {
        await applyReferralBonus(userId, profile.referred_by)
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      await supabase
        .from('profiles')
        .update({
          subscription_status: sub.status === 'active' ? 'active' : 'inactive',
        })
        .eq('stripe_subscription_id', sub.id)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await supabase
        .from('profiles')
        .update({ subscription_status: 'canceled' })
        .eq('stripe_subscription_id', sub.id)
      break
    }
  }

  return NextResponse.json({ received: true })
}
