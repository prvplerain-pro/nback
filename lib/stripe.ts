import Stripe from 'stripe'

export const STRIPE_PRICES = {
  monthly: process.env.STRIPE_PRICE_MONTHLY!,
  annual: process.env.STRIPE_PRICE_ANNUAL!,
}

let stripeSingleton: Stripe | null = null

function getStripe(): Stripe {
  if (!stripeSingleton) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    stripeSingleton = new Stripe(key, {
      apiVersion: '2025-02-24.acacia',
    })
  }
  return stripeSingleton
}

/** Lazy Stripe client — avoids instantiating during Next.js build when env may be missing. */
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    const client = getStripe()
    const value = Reflect.get(client as object, prop, client)
    return typeof value === 'function' ? (value as (...a: unknown[]) => unknown).bind(client) : value
  },
})
