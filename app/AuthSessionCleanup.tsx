'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

/** Clears broken local session when refresh token is missing / invalid (stops console AuthApiError spam). */
export default function AuthSessionCleanup() {
  useEffect(() => {
    const supabase = createClient()

    function isRefreshFailure(err: { message?: string } | null) {
      const m = err?.message ?? ''
      return m.includes('Refresh Token') || m.includes('refresh_token')
    }

    void supabase.auth.getSession().then(({ error }) => {
      if (error && isRefreshFailure(error)) void supabase.auth.signOut()
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED' && !session) void supabase.auth.signOut()
    })

    return () => subscription.unsubscribe()
  }, [])

  return null
}
