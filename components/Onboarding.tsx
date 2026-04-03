'use client'
import { useState, useEffect } from 'react'

const STEPS = [
  {
    emoji: '🗝️',
    title: 'tři klíče',
    text: 'Začínáš se 3 klíči. Každý den musíš odehrát 14 sezení — jinak o jeden přijdeš. Bez klíčů se hra zamkne.',
    demo: null,
  },
  {
    emoji: '🧠',
    title: 'dual n-back',
    text: 'Sleduješ pozici v mřížce a zároveň posloucháš písmeno. Úkolem je rozpoznat shodu s podnětem před N kroky.',
    demo: null,
  },
  {
    emoji: '📈',
    title: 'adaptivní obtížnost',
    text: 'Začínáš na N=1. Při přesnosti ≥90 % jdeš na N+1, pod 70 % na N−1. Hra se přizpůsobuje tvému výkonu.',
    demo: null,
  },
  {
    emoji: null,
    title: 'jak to funguje',
    text: 'Sleduj mřížku a písmeno. Shoduje se aktuální pozice s tou před 1 krokem?',
    demo: true,
  },
]

const DEMO_SEQUENCE = [
  { pos: 6, letter: 'C' },
  { pos: 2, letter: 'H' },
  { pos: 6, letter: 'S' }, // position match with step 0
  { pos: 2, letter: 'H' }, // audio match with step 1
  { pos: 1, letter: 'K' },
]

function Demo() {
  const [step, setStep] = useState(0)
  const [phase, setPhase] = useState<'show' | 'answer'>('show')

  useEffect(() => {
    setPhase('show')
    const t1 = setTimeout(() => setPhase('answer'), 1800)
    const t2 = setTimeout(() => {
      setStep(s => (s + 1) % DEMO_SEQUENCE.length)
    }, 3200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [step])

  const current = DEMO_SEQUENCE[step]
  const prev = step > 0 ? DEMO_SEQUENCE[step - 1] : null
  const posMatch = prev && current.pos === prev.pos
  const audioMatch = prev && current.letter === prev.letter

  return (
    <div style={{ width: '100%', maxWidth: '280px', margin: '0 auto' }}>

      {/* Step indicator */}
      <div style={{
        fontSize: '11px', color: '#6b64a0',
        textAlign: 'center', marginBottom: '12px',
        letterSpacing: '.06em',
      }}>
        krok {step + 1} z {DEMO_SEQUENCE.length}
      </div>

      {/* Previous stimulus hint */}
      <div style={{
        fontSize: '12px', color: '#3d3860',
        textAlign: 'center', marginBottom: '8px',
        minHeight: '18px',
      }}>
        {prev ? `předchozí: pozice ${prev.pos} · písmeno ${prev.letter}` : 'první krok — zapamatuj si'}
      </div>

      {/* 3x3 Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3,1fr)',
        gap: '6px',
        width: '150px',
        margin: '0 auto 16px',
      }}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => {
          const isCenter = i === 4
          const isActive = !isCenter && i === current.pos && phase === 'show'
          const isPrevPos = !isCenter && prev && i === prev.pos && phase === 'answer'
          return (
            <div key={i} style={{
              aspectRatio: '1',
              borderRadius: '8px',
              background: isCenter ? 'transparent'
                : isActive ? '#6c5ce7'
                  : isPrevPos && posMatch ? 'rgba(74,222,128,0.2)'
                    : 'rgba(255,255,255,0.04)',
              border: isCenter ? 'none'
                : isActive ? '0.5px solid #8b7fff'
                  : isPrevPos && posMatch ? '0.5px solid #4ade80'
                    : '0.5px solid rgba(130,110,255,0.12)',
              boxShadow: isActive ? '0 0 16px rgba(108,92,231,0.4)' : 'none',
              transition: 'all .3s ease',
            }} />
          )
        })}
      </div>

      {/* Current letter */}
      <div style={{
        fontSize: '48px',
        fontWeight: 700,
        textAlign: 'center',
        color: phase === 'show' ? '#6c5ce7' : 'rgba(108,92,231,0.3)',
        transition: 'color .3s',
        marginBottom: '16px',
        letterSpacing: '4px',
        fontFamily: 'monospace',
      }}>
        {current.letter}
      </div>

      {/* Answer phase */}
      <div style={{ minHeight: '60px', textAlign: 'center' }}>
        {phase === 'answer' && step > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {posMatch && (
              <div style={{
                fontSize: '13px', color: '#4ade80',
                background: 'rgba(74,222,128,0.1)',
                border: '0.5px solid rgba(74,222,128,0.3)',
                borderRadius: '8px', padding: '8px 12px',
              }}>
                ✓ pozice se shoduje → stiskni <span style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: '4px' }}>A</span>
              </div>
            )}
            {audioMatch && (
              <div style={{
                fontSize: '13px', color: '#4ade80',
                background: 'rgba(74,222,128,0.1)',
                border: '0.5px solid rgba(74,222,128,0.3)',
                borderRadius: '8px', padding: '8px 12px',
              }}>
                ✓ písmeno se shoduje → stiskni <span style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: '4px' }}>L</span>
              </div>
            )}
            {!posMatch && !audioMatch && step > 0 && (
              <div style={{
                fontSize: '13px', color: '#8a82c0',
                background: 'rgba(255,255,255,0.04)',
                border: '0.5px solid rgba(130,110,255,0.15)',
                borderRadius: '8px', padding: '8px 12px',
              }}>
                žádná shoda → nic nestiskáš
              </div>
            )}
          </div>
        )}
        {phase === 'show' && step === 0 && (
          <div style={{ fontSize: '12px', color: '#3d3860' }}>
            zapamatuj si tuto pozici a písmeno
          </div>
        )}
        {phase === 'show' && step > 0 && (
          <div style={{ fontSize: '12px', color: '#3d3860' }}>
            shoduje se s předchozím krokem?
          </div>
        )}
      </div>
    </div>
  )
}

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
        {current.emoji && (
          <div style={{ fontSize: '56px', marginBottom: '24px', lineHeight: 1 }}>
            {current.emoji}
          </div>
        )}
        <h2 style={{
          fontSize: '22px', fontWeight: 500,
          color: '#e8e6ff', margin: '0 0 16px',
        }}>
          {current.title}
        </h2>
        <p style={{
          fontSize: '15px', color: '#8a82c0',
          lineHeight: 1.7, margin: '0 0 20px',
        }}>
          {current.text}
        </p>
        {current.demo && (
          <div style={{ width: '100%', marginTop: '8px' }}>
            <Demo />
          </div>
        )}
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
