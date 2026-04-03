'use client'
import { useState } from 'react'

export default function SubscribeClient({ email }: { email: string }) {
  const [loading, setLoading] = useState<'monthly' | 'annual' | null>(null)

  async function subscribe(plan: 'monthly' | 'annual') {
    setLoading(plan)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const { url } = await res.json()
    window.location.href = url
  }

  return (
    <>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }
      `}</style>
      <div style={{ fontFamily: 'var(--font-geist-sans), system-ui, sans-serif', background: '#08080f', color: '#e8e6ff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <a href="/dashboard" style={{ fontSize: '13px', color: '#6b64a0', textDecoration: 'none', display: 'inline-block', marginBottom: '32px' }}>← zpět</a>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#a89aff', letterSpacing: '.06em', marginBottom: '8px' }}>lock-iN premium</div>
            <h1 style={{ fontSize: '24px', fontWeight: 400, color: '#e8e6ff', margin: '0 0 8px' }}>přejít na Premium</h1>
            <p style={{ fontSize: '13px', color: '#6b64a0', margin: 0 }}>{email}</p>
          </div>

          {/* What you get */}
          <div style={{ background: '#0e0e1a', border: '0.5px solid rgba(130,110,255,0.15)', borderRadius: '14px', padding: '20px', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: '#6b64a0', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '14px' }}>co získáš</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                ['✦', 'Neomezené AI analýzy po každém sezení'],
                ['✦', 'Týdenní insight report — vzory a slabiny'],
                ['✦', 'Konkrétní tréninková doporučení'],
                ['✓', 'Vše ze zdarma (hra, klíče, grafy)'],
              ].map(([icon, text]) => (
                <div key={text} style={{ display: 'flex', gap: '10px', fontSize: '13px', color: '#8a82c0', alignItems: 'flex-start' }}>
                  <span style={{ color: icon === '✦' ? '#a89aff' : '#6c5ce7', flexShrink: 0 }}>{icon}</span>
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Plans */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>

            {/* Annual */}
            <button
              type="button"
              onClick={() => subscribe('annual')}
              disabled={loading !== null}
              style={{
                width: '100%',
                padding: '18px 20px',
                background: loading === 'annual' ? 'rgba(108,92,231,0.3)' : '#0e0e1a',
                border: '1.5px solid rgba(108,92,231,0.5)',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all .2s',
                opacity: loading !== null ? 0.7 : 1,
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#e8e6ff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  roční
                  <span style={{ fontSize: '11px', background: '#6c5ce7', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontWeight: 400 }}>
                    ušetříš 33 %
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#6b64a0', marginTop: '3px' }}>919 Kč / $39.99 ročně</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '18px', fontWeight: 500, color: '#a89aff' }}>77 Kč</div>
                <div style={{ fontSize: '11px', color: '#3d3860' }}>/měsíc</div>
              </div>
            </button>

            {/* Monthly */}
            <button
              type="button"
              onClick={() => subscribe('monthly')}
              disabled={loading !== null}
              style={{
                width: '100%',
                padding: '18px 20px',
                background: loading === 'monthly' ? 'rgba(108,92,231,0.2)' : 'transparent',
                border: '0.5px solid rgba(130,110,255,0.2)',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all .2s',
                opacity: loading !== null ? 0.7 : 1,
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#e8e6ff' }}>měsíční</div>
                <div style={{ fontSize: '12px', color: '#6b64a0', marginTop: '3px' }}>115 Kč / $4.99 měsíčně</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '18px', fontWeight: 500, color: '#8a82c0' }}>115 Kč</div>
                <div style={{ fontSize: '11px', color: '#3d3860' }}>/měsíc</div>
              </div>
            </button>

          </div>

          {loading && (
            <p style={{ textAlign: 'center', fontSize: '13px', color: '#6b64a0', marginBottom: '16px', animation: 'pulse 1.5s infinite' }}>
              přesměrovávám na platební bránu...
            </p>
          )}

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#3d3860', lineHeight: 1.6 }}>
            Zabezpečená platba přes Stripe. Zrušení kdykoliv v nastavení.
          </p>

        </div>
      </div>
    </>
  )
}
