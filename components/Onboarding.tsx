'use client'
import { useState, useEffect } from 'react'

const STEPS = [
  {
    emoji: '🔥',
    title: 'tři klíče',
    text: 'Začínáš se 3 klíči. Každý den musíš odehrát 14 sezení — jinak o jeden přijdeš. Bez klíčů se hra zamkne.',
  },
  {
    emoji: '🧠',
    title: 'dual n-back',
    text: 'Sleduješ pozici v mřížce a zároveň posloucháš písmeno. Stiskni A když se pozice opakuje, L když se opakuje písmeno — vždy N kroků zpět.',
  },
  {
    emoji: '📈',
    title: 'adaptivní obtížnost',
    text: 'Začínáš na N=1. Při přesnosti ≥90 % jdeš na N+1, pod 70 % na N−1. Hra se přizpůsobuje tvému výkonu.',
  },
]

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const done = localStorage.getItem('onboarding_done')
    if (!done) setVisible(true)
  }, [])

  function next() {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      localStorage.setItem('onboarding_done', '1')
      setVisible(false)
    }
  }

  function skip() {
    localStorage.setItem('onboarding_done', '1')
    setVisible(false)
  }

  if (!visible) return null

  const current = STEPS[step]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(8,8,15,0.97)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px',
      fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
    }}>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '48px' }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{
            width: i === step ? '20px' : '6px',
            height: '6px',
            borderRadius: '3px',
            background: i === step ? '#6c5ce7' : 'rgba(130,110,255,0.2)',
            transition: 'all .3s ease',
          }} />
        ))}
      </div>

      {/* Content */}
      <div style={{ textAlign: 'center', maxWidth: '320px' }}>
        <div style={{ fontSize: '56px', marginBottom: '24px', lineHeight: 1 }}>
          {current.emoji}
        </div>
        <h2 style={{
          fontSize: '22px', fontWeight: 500,
          color: '#e8e6ff', margin: '0 0 16px',
          letterSpacing: '-.01em',
        }}>
          {current.title}
        </h2>
        <p style={{
          fontSize: '15px', color: '#8a82c0',
          lineHeight: 1.7, margin: 0,
        }}>
          {current.text}
        </p>
      </div>

      {/* Buttons */}
      <div style={{ marginTop: '48px', width: '100%', maxWidth: '280px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button type="button" onClick={next} style={{
          width: '100%', padding: '14px',
          background: '#6c5ce7', color: '#fff',
          border: 'none', borderRadius: '10px',
          fontSize: '15px', fontWeight: 500,
          cursor: 'pointer',
        }}>
          {step < STEPS.length - 1 ? 'další →' : 'začít trénovat'}
        </button>
        {step < STEPS.length - 1 && (
          <button type="button" onClick={skip} style={{
            width: '100%', padding: '12px',
            background: 'transparent', color: '#3d3860',
            border: 'none', fontSize: '13px',
            cursor: 'pointer',
          }}>
            přeskočit
          </button>
        )}
      </div>

    </div>
  )
}
