'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { needsProfileNames } from '@/lib/profileNames'

function RegisterForm() {
  const router = useRouter()
  const params = useSearchParams()
  const ref = params.get('ref') ?? ''

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [referralValid, setReferralValid] = useState<boolean | null>(null)

  const supabase = createClient()

  useEffect(() => {
    if (!ref) return
    fetch(`/api/referral/validate?code=${ref}`)
      .then(r => r.json())
      .then(d => setReferralValid(d.valid))
  }, [ref])

  async function handleSubmit() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (ref && referralValid && data.user) {
      const res = await fetch(`/api/referral/validate?code=${ref}`)
      const json = await res.json()
      if (json.valid) {
        await supabase.from('profiles').update({ referred_by: json.referrerId }).eq('id', data.user.id)
      }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .maybeSingle()
    router.push(needsProfileNames(profile) ? '/settings?complete=1' : '/dashboard')
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 'max(16px, env(safe-area-inset-top))',
        paddingRight: 'max(16px, env(safe-area-inset-right))',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
        paddingLeft: 'max(16px, env(safe-area-inset-left))',
        background: '#08080f',
      }}
    >
      <div style={{ width: '100%', maxWidth: '360px' }}>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <a href="/" style={{ fontSize: '14px', fontWeight: 500, color: '#a89aff', letterSpacing: '.06em', textDecoration: 'none' }}>lock-iN</a>
          <p style={{ fontSize: '13px', color: '#8a82c0', marginTop: '8px' }}>vytvoř si účet — 3 klíče zdarma</p>
        </div>

        {ref && referralValid === true && (
          <div style={{ textAlign: 'center', fontSize: '13px', padding: '10px 16px', borderRadius: '10px', background: 'rgba(108,92,231,.12)', color: '#a89aff', marginBottom: '16px', border: '0.5px solid rgba(108,92,231,.25)' }}>
            🗝️ referral kód platný — oba dostanete bonus klíč
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: '14px 14px', borderRadius: '10px', background: '#0e0e1a', border: '0.5px solid rgba(130,110,255,0.2)', color: '#e8e6ff', fontSize: '16px', outline: 'none' }}
          />
          <input
            type="password"
            placeholder="heslo"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={{ width: '100%', padding: '14px 14px', borderRadius: '10px', background: '#0e0e1a', border: '0.5px solid rgba(130,110,255,0.2)', color: '#e8e6ff', fontSize: '16px', outline: 'none' }}
          />
          {error && <p style={{ fontSize: '13px', color: '#f87171', margin: 0 }}>{error}</p>}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: '100%', minHeight: '48px', padding: '12px', borderRadius: '10px', background: '#6c5ce7', color: '#fff', border: 'none', fontSize: '16px', fontWeight: 500, cursor: 'pointer', opacity: loading ? 0.6 : 1, touchAction: 'manipulation' }}
          >
            {loading ? 'registruji...' : 'vytvořit účet'}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '20px 0', color: '#3d3860', fontSize: '12px' }}>
          <div style={{ flex: 1, height: '0.5px', background: 'rgba(130,110,255,0.15)' }} />
          3 klíče · denní trénink · bez kreditky
          <div style={{ flex: 1, height: '0.5px', background: 'rgba(130,110,255,0.15)' }} />
        </div>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#3d3860' }}>
          už máš účet?{' '}
          <a href="/login" style={{ color: '#a89aff', textDecoration: 'none' }}>přihlásit se</a>
        </p>

      </div>
    </main>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#08080f' }} />}>
      <RegisterForm />
    </Suspense>
  )
}
