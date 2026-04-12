'use client'
import { useReducer, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { GameTrial, GamePhase } from '@/types'
import { generateTrials, getMatches, calculateScoreBreakdown, calculateSplitScore, speakLetter, preloadAudio, unlockAudio } from '@/lib/game'

function vibrate() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(40)
  }
}

function responseBarBg(
  phase: GamePhase,
  pressed: boolean,
  targetCorrect: boolean | undefined
): string {
  if (phase === 'feedback') {
    if (pressed) {
      return targetCorrect ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'
    }
    if (targetCorrect) return 'rgba(74,222,128,0.2)'
    return 'rgba(255,255,255,0.03)'
  }
  return pressed ? 'rgba(108,92,231,0.4)' : 'rgba(255,255,255,0.03)'
}

// ── Timing constants (ms) ──────────────────────────────────
const STIMULUS_MS  = 2500
const RESPONSE_MS  = 500   // window after stimulus ends
const FEEDBACK_MS  = 300
const BETWEEN_MS   = 200

// ── State ──────────────────────────────────────────────────
interface State {
  phase:        GamePhase
  nLevel:       number
  trials:       GameTrial[]
  currentIndex: number
  responses:    Array<{ position: boolean; audio: boolean }>
  pressedPos:   boolean   // whether position key pressed this trial
  pressedAudio: boolean   // whether audio key pressed this trial
  score:          number | null
  positionScore:  number | null
  audioScore:     number | null
  suggestedN:   number | null
  newKeys:      number | null
  newConsecutive: number | null
  recoveryForfeited: boolean | null
  sessionsToday: number | null
  saving:       boolean
}

type Action =
  | { type: 'START';      nLevel: number }
  | { type: 'NEXT_TRIAL' }
  | { type: 'SHOW_RESPONSE' }
  | { type: 'SHOW_FEEDBACK'; position: boolean; audio: boolean }
  | { type: 'PRESS_POSITION' }
  | { type: 'PRESS_AUDIO' }
  | { type: 'FINISH' }
  | { type: 'SAVE_DONE'; suggestedN: number; newKeys: number; newConsecutive: number; recoveryForfeited: boolean; sessionsToday: number; positionScore: number | null; audioScore: number | null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START':
      return {
        ...state,
        phase:        'stimulus',
        nLevel:       action.nLevel,
        trials:       generateTrials(action.nLevel),
        currentIndex: 0,
        responses:    [],
        pressedPos:   false,
        pressedAudio: false,
        score:          null,
        positionScore:  null,
        audioScore:     null,
        suggestedN:   null,
        newKeys:      null,
        newConsecutive: null,
        recoveryForfeited: null,
        sessionsToday: null,
        saving:       false,
      }
    case 'SHOW_RESPONSE':
      return { ...state, phase: 'response' }
    case 'SHOW_FEEDBACK':
      return {
        ...state,
        phase: 'feedback',
        responses: [
          ...state.responses,
          { position: action.position, audio: action.audio },
        ],
      }
    case 'NEXT_TRIAL':
      return {
        ...state,
        phase:        'stimulus',
        currentIndex: state.currentIndex + 1,
        pressedPos:   false,
        pressedAudio: false,
      }
    case 'PRESS_POSITION':
      return state.phase === 'response' || state.phase === 'stimulus'
        ? { ...state, pressedPos: !state.pressedPos }
        : state
    case 'PRESS_AUDIO':
      return state.phase === 'response' || state.phase === 'stimulus'
        ? { ...state, pressedAudio: !state.pressedAudio }
        : state
    case 'FINISH': {
      const { overall, position, audio } = calculateScoreBreakdown(
        state.trials,
        state.nLevel,
        state.responses
      )
      return {
        ...state,
        phase: 'finished',
        score: overall,
        positionScore: position,
        audioScore: audio,
        saving: true,
      }
    }
    case 'SAVE_DONE':
      return {
        ...state,
        saving: false,
        suggestedN: action.suggestedN,
        newKeys: action.newKeys,
        newConsecutive: action.newConsecutive,
        recoveryForfeited: action.recoveryForfeited,
        sessionsToday: action.sessionsToday,
        positionScore: action.positionScore,
        audioScore: action.audioScore,
      }
    default:
      return state
  }
}

const INIT: State = {
  phase: 'idle', nLevel: 1, trials: [], currentIndex: 0,
  responses: [], pressedPos: false, pressedAudio: false,
  score: null, positionScore: null, audioScore: null, suggestedN: null, newKeys: null, newConsecutive: null, recoveryForfeited: null, sessionsToday: null, saving: false,
}

// ── Component ──────────────────────────────────────────────
interface GameClientProps {
  initialNLevel: number
  isRecovery?: boolean
  consecutiveHighScores?: number
}

export default function GameClient({
  initialNLevel,
  isRecovery = false,
  consecutiveHighScores,
}: GameClientProps) {
  const router  = useRouter()
  const [state, dispatch] = useReducer(reducer, INIT)
  const sessionStartRef = useRef<number>(Date.now())

  useEffect(() => {
    preloadAudio()
  }, [])

  useEffect(() => {
    if (state.phase === 'stimulus' && state.currentIndex === 0) {
      sessionStartRef.current = Date.now()
    }
  }, [state.phase, state.currentIndex])

  const stateRef = useRef(state)
  stateRef.current = state

  const pressedRef = useRef({ position: false, audio: false })
  pressedRef.current = {
    position: state.pressedPos,
    audio:    state.pressedAudio,
  }

  const timeoutIdsRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const clearAllTimers = () => {
    timeoutIdsRef.current.forEach(id => clearTimeout(id))
    timeoutIdsRef.current = []
  }

  const pushTimer = (id: ReturnType<typeof setTimeout>) => {
    timeoutIdsRef.current.push(id)
  }

  // Watches `phase` via the guard below and `currentIndex` + `trials` in deps.
  // Do not list `phase` in the dependency array: when it flips stimulus→response,
  // cleanup would clearTimeout the pending RESPONSE_MS timer and the loop would stall.
  useEffect(() => {
    if (state.phase !== 'stimulus') return
    const trial = state.trials[state.currentIndex]
    if (!trial) return

    clearAllTimers()

    speakLetter(trial.letter)

    const t1 = setTimeout(() => {
      dispatch({ type: 'SHOW_RESPONSE' })
      const t2 = setTimeout(() => {
        const { position, audio } = pressedRef.current
        dispatch({ type: 'SHOW_FEEDBACK', position, audio })
        const t3 = setTimeout(() => {
          const { currentIndex, trials } = stateRef.current
          const isLast = currentIndex >= trials.length - 1
          if (isLast) {
            dispatch({ type: 'FINISH' })
          } else {
            const t4 = setTimeout(() => {
              dispatch({ type: 'NEXT_TRIAL' })
            }, BETWEEN_MS)
            pushTimer(t4)
          }
        }, FEEDBACK_MS)
        pushTimer(t3)
      }, RESPONSE_MS)
      pushTimer(t2)
    }, STIMULUS_MS)
    pushTimer(t1)

    return clearAllTimers
  }, [state.currentIndex, state.trials])

  // Save finished session
  useEffect(() => {
    if (state.phase !== 'finished' || !state.saving || state.score === null) return

    const { positionScore, audioScore } = calculateSplitScore(
      state.trials,
      state.nLevel,
      state.responses
    )
    const durationSeconds = Math.round((Date.now() - sessionStartRef.current) / 1000)
    const playedAtHour = new Date().getHours()

    fetch('/api/game/save', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        nLevel: state.nLevel,
        scorePercent: state.score,
        positionScore,
        audioScore,
        durationSeconds,
        playedAtHour,
      }),
    })
      .then(r => r.json())
      .then(d =>
        dispatch({
          type: 'SAVE_DONE',
          suggestedN: d.suggestedN,
          newKeys: d.newKeys,
          newConsecutive: typeof d.newConsecutive === 'number' ? d.newConsecutive : 0,
          recoveryForfeited: d.recoveryForfeited === true,
          sessionsToday: typeof d.sessionsToday === 'number' ? d.sessionsToday : 0,
          positionScore,
          audioScore,
        })
      )
  }, [state.phase, state.saving, state.score, state.nLevel, state.trials, state.responses])

  // Keyboard
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'a' || e.key === 'A') dispatch({ type: 'PRESS_POSITION' })
    if (e.key === 'l' || e.key === 'L') dispatch({ type: 'PRESS_AUDIO' })
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  const trial       = state.trials[state.currentIndex]
  const isStimulus  = state.phase === 'stimulus'
  const totalTrials = state.trials.length
  const progress    = totalTrials > 0 ? (state.currentIndex / totalTrials) * 100 : 0

  const matches = trial && state.phase === 'feedback'
    ? getMatches(state.trials, state.currentIndex, state.nLevel)
    : null

  // ── Render: idle ────────────────────────────────────────
  if (state.phase === 'idle') {
    const totalTrialsCount = initialNLevel + 20
    return (
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '32px', padding: '24px', background: 'var(--bg)', touchAction: 'manipulation' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--purple2)', letterSpacing: '.06em', marginBottom: '8px' }}>lock-iN</div>
          <div style={{ fontSize: '28px', fontWeight: 400, color: 'var(--text)', lineHeight: 1.2 }}>
            dual {initialNLevel}-back
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text3)', marginTop: '6px' }}>{totalTrialsCount} pokusů</div>
        </div>

        {isRecovery && (
          <div style={{
            fontSize: '13px',
            color: '#a89aff',
            background: 'rgba(108,92,231,0.1)',
            border: '0.5px solid rgba(108,92,231,0.3)',
            borderRadius: '10px',
            padding: '10px 16px',
            textAlign: 'center',
            maxWidth: '280px',
          }}>
            recovery mód · {consecutiveHighScores ?? 0}/3 sezení
            <br />
            <span style={{ fontSize: '11px', color: '#6b64a0' }}>
              překonej N-{initialNLevel} s ≥90 % přesností — jedno neúspěšné sezení recovery navždy uzavře
            </span>
          </div>
        )}

        {/* Mini grid preview - static 3x3 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px', width: '120px' }}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} style={{
              aspectRatio: '1', borderRadius: '8px',
              background: i === 4 ? 'transparent' : 'rgba(255,255,255,0.04)',
              border: i === 4 ? 'none' : '0.5px solid var(--border)',
            }} />
          ))}
        </div>

        {/* Controls info */}
        <div style={{ display: 'flex', gap: '24px', fontSize: '12px', color: 'var(--text3)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: 'var(--bg2)', border: '0.5px solid var(--border2)', borderRadius: '6px', padding: '4px 10px', color: 'var(--purple2)', fontFamily: 'monospace', marginBottom: '4px' }}>A</div>
            <div>pozice</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: 'var(--bg2)', border: '0.5px solid var(--border2)', borderRadius: '6px', padding: '4px 10px', color: 'var(--purple2)', fontFamily: 'monospace', marginBottom: '4px' }}>L</div>
            <div>písmeno</div>
          </div>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text3)', textAlign: 'center', maxWidth: '280px', lineHeight: 1.5, margin: '-8px 0 0' }}>
          Na telefonu klepni na velká tlačítka dole — A a L platí hlavně pro klávesnici.
        </p>

        {/* Start button */}
        <button
          type="button"
          onPointerDown={() => {
            unlockAudio()
            dispatch({ type: 'START', nLevel: initialNLevel })
          }}
          style={{ background: 'var(--purple)', color: '#fff', border: 'none', padding: '13px 40px', borderRadius: '10px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', transition: 'all .2s', touchAction: 'manipulation' }}
          onMouseOver={e => { e.currentTarget.style.background = '#7d6ef0' }}
          onMouseOut={e => { e.currentTarget.style.background = 'var(--purple)' }}>
          začít sezení
        </button>

      </main>
    )
  }

  // ── Render: finished ────────────────────────────────────
  if (state.phase === 'finished') {
    const score = state.score ?? 0
    return (
      <Screen touchAction="manipulation">
        <h2 className="text-2xl font-bold">Session Complete</h2>
        <div className="text-7xl font-black" style={{ color: score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--key-gold)' : 'var(--danger)' }}>
          {score}%
        </div>

        {state.positionScore !== null && state.audioScore !== null && (
          <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#a89aff', fontWeight: 500 }}>{state.positionScore}%</div>
              <div style={{ color: '#3d3860', fontSize: '11px', marginTop: '2px' }}>pozice</div>
            </div>
            <div style={{ width: '0.5px', background: 'rgba(130,110,255,0.2)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#a89aff', fontWeight: 500 }}>{state.audioScore}%</div>
              <div style={{ color: '#3d3860', fontSize: '11px', marginTop: '2px' }}>písmeno</div>
            </div>
          </div>
        )}

        <p className="text-white/50">N-{state.nLevel} · {totalTrials} trials</p>

        {!isRecovery && state.sessionsToday !== null && (
          <div style={{ width: '100%', maxWidth: '320px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text3)', marginBottom: '8px' }}>
              <span>dnešní sezení</span>
              <span style={{ color: state.sessionsToday >= 14 ? 'var(--success)' : 'var(--purple2)' }}>
                {Math.min(state.sessionsToday, 14)} / 14
              </span>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  borderRadius: '2px',
                  background: state.sessionsToday >= 14 ? 'var(--success)' : 'var(--purple)',
                  width: `${Math.min((state.sessionsToday / 14) * 100, 100)}%`,
                  transition: 'width .4s ease',
                }}
              />
            </div>
            {state.sessionsToday >= 14 && (
              <div style={{ fontSize: '12px', color: 'var(--success)', marginTop: '8px', textAlign: 'center' }}>
                ✓ denní cíl splněn
              </div>
            )}
          </div>
        )}

        {state.saving ? (
          <p className="text-white/30 text-sm animate-pulse">Saving...</p>
        ) : (
          <div className="space-y-3 text-center">
            {!isRecovery && state.newKeys !== null && (
              <div className="flex gap-2 justify-center">
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i} className={`text-2xl ${i < (state.newKeys ?? 0) ? 'flame-icon' : 'flame-icon empty'}`}>🔥</span>
                ))}
              </div>
            )}
            {isRecovery && state.newKeys !== null && (
              <div style={{
                fontSize: '13px',
                color: state.recoveryForfeited ? '#f87171' : state.newKeys > 0 ? '#4ade80' : '#8a82c0',
                background: state.recoveryForfeited ? 'rgba(248,113,113,0.08)' : state.newKeys > 0 ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.04)',
                border: `0.5px solid ${state.recoveryForfeited ? 'rgba(248,113,113,0.25)' : state.newKeys > 0 ? 'rgba(74,222,128,0.3)' : 'rgba(130,110,255,0.15)'}`,
                borderRadius: '10px',
                padding: '12px 16px',
                textAlign: 'center',
                maxWidth: '280px',
                margin: '0 auto',
              }}>
                {state.newKeys > 0
                  ? '🗝️ Klíč získán! Přístup obnoven.'
                  : state.recoveryForfeited
                    ? 'Recovery už není — další hra není. Pokračuj sdílením nebo předplatným.'
                    : `${state.newConsecutive ?? 0}/3 sezení splněno — pokračuj`}
              </div>
            )}
            {!isRecovery && state.suggestedN !== null && state.suggestedN !== state.nLevel && (
              <p className="text-sm" style={{ color: 'var(--accent)' }}>
                {state.suggestedN > state.nLevel ? '⬆️' : '⬇️'} Next session: N-{state.suggestedN}
              </p>
            )}
            <div className="flex w-full max-w-sm mx-auto flex-col gap-3 sm:flex-row sm:justify-center">
              {!(
                (isRecovery && state.newKeys !== null && state.newKeys > 0)
                || (isRecovery && state.recoveryForfeited)
              ) && (
                <button
                  type="button"
                  onPointerDown={() => {
                    unlockAudio()
                    dispatch({ type: 'START', nLevel: state.suggestedN ?? state.nLevel })
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 min-h-[48px]"
                  style={{ background: 'var(--accent)', touchAction: 'manipulation' }}>
                  Play Again
                </button>
              )}
              {isRecovery && state.newKeys !== null && state.newKeys > 0 ? (
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 min-h-[48px]"
                  style={{ background: 'var(--accent)', touchAction: 'manipulation' }}>
                  Dashboard
                </button>
              ) : isRecovery && state.recoveryForfeited ? (
                <>
                  <button
                    type="button"
                    onClick={() => router.push('/locked')}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 min-h-[48px]"
                    style={{ background: 'var(--accent)', touchAction: 'manipulation' }}>
                    Možnosti odemčení →
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard')}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold border border-white/20 hover:border-white/40 transition-all min-h-[48px]"
                    style={{ touchAction: 'manipulation' }}>
                    Dashboard
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold border border-white/20 hover:border-white/40 transition-all min-h-[48px]"
                  style={{ touchAction: 'manipulation' }}>
                  Dashboard
                </button>
              )}
            </div>
          </div>
        )}
      </Screen>
    )
  }

  const posTarget = matches?.positionMatch
  const audioTarget = matches?.audioMatch

  // ── Render: active game ─────────────────────────────────
  return (
    <>
      <main
        className="min-h-screen flex flex-col items-center justify-center px-4 gap-6"
        style={{
          touchAction: 'manipulation',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {/* Progress bar */}
        <div className="w-full max-w-sm h-1 rounded-full bg-white/10 shrink-0">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, background: 'var(--accent)' }}
          />
        </div>

        {/* N level + trial counter */}
        <div className="flex gap-6 text-sm text-white/40 shrink-0">
          <span>N-{state.nLevel}</span>
          <span>{state.currentIndex + 1} / {totalTrials}</span>
        </div>

        {/* 3×3 Grid — center cell (pos 4) always dark */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'calc(min(2vmin, 8px))',
          }}
        >
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(pos => {
            const isCenter = pos === 4
            const isActive = isStimulus && trial?.position === pos && !isCenter

            const borderColor = 'rgba(255,255,255,0.08)'

            return (
              <div
                key={pos}
                className="grid-cell flex items-center justify-center"
                style={{
                  width: 'calc(min(30vmin, 110px))',
                  height: 'calc(min(30vmin, 110px))',
                  background: isCenter ? 'transparent' : isActive ? 'var(--accent)' : 'rgba(255,255,255,0.03)',
                  borderWidth: isCenter ? 0 : 1,
                  borderStyle: 'solid',
                  borderColor: isCenter ? 'transparent' : borderColor,
                  boxShadow: isActive ? '0 0 32px var(--accent-glow)' : 'none',
                  opacity: isCenter ? 0 : 1,
                }}
              />
            )
          })}
        </div>

        {/* Current letter display */}
        <div
          className="text-6xl font-black tracking-widest shrink-0"
          style={{ color: isStimulus ? 'var(--accent)' : 'transparent', transition: 'color 0.15s' }}
        >
          {trial?.letter ?? 'C'}
        </div>
      </main>

      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          gap: 2,
          padding: 0,
          background: '#08080f',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          zIndex: 50,
        }}
      >
        <button
          type="button"
          onPointerDown={() => {
            if (state.phase === 'feedback') return
            vibrate()
            dispatch({ type: 'PRESS_POSITION' })
          }}
          disabled={state.phase === 'feedback'}
          style={{
            flex: 1,
            minHeight: 80,
            background: responseBarBg(state.phase, state.pressedPos, posTarget),
            border: 'none',
            borderTop: '0.5px solid rgba(130,110,255,0.15)',
            color: '#a89aff',
            fontSize: 15,
            fontWeight: 500,
            cursor: state.phase === 'feedback' ? 'default' : 'pointer',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
            transition: 'background .15s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <span>pozice</span>
          <span style={{ fontSize: 11, color: '#3d3860', fontFamily: 'monospace' }}>A</span>
        </button>

        <button
          type="button"
          onPointerDown={() => {
            if (state.phase === 'feedback') return
            vibrate()
            dispatch({ type: 'PRESS_AUDIO' })
          }}
          disabled={state.phase === 'feedback'}
          style={{
            flex: 1,
            minHeight: 80,
            background: responseBarBg(state.phase, state.pressedAudio, audioTarget),
            border: 'none',
            borderTop: '0.5px solid rgba(130,110,255,0.15)',
            color: '#a89aff',
            fontSize: 15,
            fontWeight: 500,
            cursor: state.phase === 'feedback' ? 'default' : 'pointer',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
            transition: 'background .15s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <span>písmeno</span>
          <span style={{ fontSize: 11, color: '#3d3860', fontFamily: 'monospace' }}>L</span>
        </button>
      </div>
    </>
  )
}

// ── Sub-components ─────────────────────────────────────────
function Screen({ children, touchAction }: { children: React.ReactNode; touchAction?: React.CSSProperties['touchAction'] }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 px-4" style={{ touchAction }}>
      {children}
    </main>
  )
}
