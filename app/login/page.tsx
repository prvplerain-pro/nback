'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { needsProfileNames } from '@/lib/profileNames'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') ?? '/dashboard'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  async function handleSubmit() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .maybeSingle()
    router.push(needsProfileNames(profile) ? '/settings?complete=1' : next)
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
          <p style={{ fontSize: '13px', color: '#8a82c0', marginTop: '8px' }}>přihlášení</p>
        </div>

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
            {loading ? 'přihlašuji...' : 'přihlásit se'}
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#3d3860', marginTop: '24px' }}>
          nemáš účet?{' '}
          <a href="/register" style={{ color: '#a89aff', textDecoration: 'none' }}>registrace</a>
        </p>

      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#08080f' }} />}>
      <LoginForm />
    </Suspense>
  )
}
