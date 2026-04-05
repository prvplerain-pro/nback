'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Chart, registerables } from 'chart.js'
import { createClient } from '@/lib/supabase/client'
import Onboarding from '@/components/Onboarding'

Chart.register(...registerables)

type Session = {
  nLevel: number
  accuracy: number
  createdAt: string
}

type Props = {
  subscriptionStatus: string | null
  isAdmin: boolean
  highScore: number
  streakDays: number
  totalSessions: number
  overallAccuracy: number
  sessionsToday: number
  recentSessions: Session[]
  chartLabels: string[]
  chartData: (number | null)[]
  heatmapData: number[]
}

export default function DashboardClient({
  subscriptionStatus,
  isAdmin,
  highScore,
  streakDays,
  totalSessions,
  overallAccuracy,
  sessionsToday,
  recentSessions,
  chartLabels,
  chartData,
  heatmapData,
}: Props) {
  const router = useRouter()
  const [showStats, setShowStats] = useState(false)
  const [chartReady, setChartReady] = useState(false)
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<InstanceType<typeof Chart> | null>(null)
  const touchStartY = useRef(0)
  const touchStartX = useRef(0)

  function goToStats() { setShowStats(true); setChartReady(true) }
  function goToStart() { setShowStats(false) }

  const handleSignOut = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }, [router])

  useEffect(() => {
    if (!chartReady || !chartRef.current) return
    chartInstance.current?.destroy()
    chartInstance.current = null

    const canvas = chartRef.current
    chartInstance.current = new Chart(canvas, {
      type: 'line',
      data: {
        labels: chartLabels,
        datasets: [{
          data: chartData,
          borderColor: '#6c5ce7',
          backgroundColor: 'rgba(108,92,231,0.08)',
          borderWidth: 2,
          pointRadius: chartData.map(v => v === null ? 0 : 3),
          pointBackgroundColor: '#6c5ce7',
          tension: 0.4,
          fill: true,
          spanGaps: true,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#13131f',
            borderColor: 'rgba(130,110,255,0.25)',
            borderWidth: 1,
            titleColor: '#a89aff',
            bodyColor: '#8a82c0',
            callbacks: { label: ctx => ctx.raw === null ? 'vynecháno' : `${ctx.raw}%` },
          },
        },
        scales: {
          x: {
            ticks: { color: '#3d3860', font: { size: 9 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 7 },
            grid: { color: 'rgba(130,110,255,0.06)' },
            border: { display: false },
          },
          y: {
            min: 50, max: 100,
            ticks: { color: '#3d3860', font: { size: 9 }, callback: v => `${v}%`, stepSize: 25 },
            grid: { color: 'rgba(130,110,255,0.06)' },
            border: { display: false },
          },
        },
      },
    })

    return () => {
      chartInstance.current?.destroy()
      chartInstance.current = null
    }
  }, [chartReady, chartLabels, chartData])

  function formatDate(iso: string) {
    const d = new Date(iso)
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    if (d.toDateString() === now.toDateString()) return `dnes, ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
    if (d.toDateString() === yesterday.toDateString()) return `včera, ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
    return `${d.getDate()}. ${d.getMonth() + 1}.`
  }

  return (
    <>
      <Onboarding />
      <style>{`
        .li-app { position:relative; height:100dvh; overflow:hidden; background:#08080f; color:#e8e6ff; font-family:var(--font-geist-sans),system-ui,sans-serif; font-size:14px; }
        .li-page { position:absolute; inset:0; will-change:transform,opacity; transition:transform .5s cubic-bezier(.4,0,.2,1),opacity .5s cubic-bezier(.4,0,.2,1); }
        .li-start { transform:translateY(0) scale(1); opacity:1; display:flex; flex-direction:column; height:100%; min-height:0; }
        .li-start.out { transform:translateY(-60px) scale(0.93); opacity:0; pointer-events:none; }
        .li-start-main { flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center; width:100%; min-height:0; padding:12px 0 28px; box-sizing:border-box; }
        .li-stats { transform:translateY(100%); opacity:0; pointer-events:none; display:flex; flex-direction:column; }
        .li-stats.in { transform:translateY(0); opacity:1; pointer-events:auto; }
        .li-nav { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:14px 20px; border-bottom:0.5px solid rgba(130,110,255,0.12); flex-shrink:0; flex-wrap:wrap; row-gap:10px; }
        @media (max-width:520px){
          .li-nav { padding:12px 16px; padding-left:max(16px,env(safe-area-inset-left)); padding-right:max(16px,env(safe-area-inset-right)); }
          .li-nav-actions { flex-wrap:wrap; justify-content:flex-end; gap:8px; max-width:100%; }
          .li-nav-premium { font-size:11px; padding:4px 10px; }
          .li-nav-link, .li-nav-out { font-size:11px; }
        }
        .li-nav-mid { display:flex; align-items:center; gap:12px; min-width:0; flex:1; }
        .li-nav-actions { display:flex; align-items:center; gap:12px; flex-shrink:0; }
        .li-nav-link { font-size:12px; color:#8a82c0; text-decoration:none; cursor:pointer; background:none; border:none; padding:0; font-family:inherit; }
        .li-nav-link:hover { color:#a89aff; }
        .li-nav-premium { font-size:12px; color:#a89aff; background:rgba(108,92,231,0.12); border:0.5px solid rgba(108,92,231,0.3); border-radius:20px; padding:4px 12px; text-decoration:none; transition:all .2s; white-space:nowrap; }
        .li-nav-premium:hover { color:#e8e6ff; border-color:rgba(108,92,231,0.5); background:rgba(108,92,231,0.18); }
        .li-nav-out { font-size:12px; color:#8a82c0; background:none; border:none; cursor:pointer; padding:0; font-family:inherit; }
        .li-nav-out:hover { color:#f87171; }
        .li-logo { font-size:14px; font-weight:500; color:#a89aff; letter-spacing:.06em; }
        .streak-badge { display:inline-flex; align-items:center; gap:8px; background:rgba(249,115,22,.1); border:0.5px solid rgba(249,115,22,.3); border-radius:20px; padding:5px 14px; margin-bottom:32px; }
        .flame { font-size:16px; animation:flicker 1.8s infinite alternate; }
        @keyframes flicker { 0%{opacity:1;transform:scale(1)} 100%{opacity:.8;transform:scale(1.12)} }
        .play-card { width:100%; align-self:stretch; background:#0e0e1a; border:0.5px solid rgba(130,110,255,0.2); border-left:none; border-right:none; border-radius:0; padding:22px 0; text-align:center; margin-bottom:16px; box-sizing:border-box; }
        .play-card-inner { max-width:300px; margin:0 auto; padding:0 20px; width:100%; box-sizing:border-box; }
        .play-btn { width:100%; max-width:280px; min-height:48px; padding:12px 14px; background:#6c5ce7; color:#fff; border:none; border-radius:10px; font-size:15px; font-weight:500; cursor:pointer; transition:background .18s,transform .18s; touch-action:manipulation; }
        .play-btn:hover { background:#7d6ef0; }
        .play-btn:active { transform:scale(.98); }
        .swipe-hint { display:flex; flex-direction:column; align-items:center; gap:6px; margin-top:16px; max-width:280px; margin-left:auto; margin-right:auto; padding:0 20px; cursor:pointer; user-select:none; }
        .swipe-arrow { width:28px; height:28px; border-radius:50%; border:0.5px solid rgba(130,110,255,0.25); display:flex; align-items:center; justify-content:center; animation:bounce 2s infinite; }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(5px)} }
        .stats-scroll { flex:1; overflow-y:auto; padding:16px 20px max(24px, calc(12px + env(safe-area-inset-bottom, 0px))); }
        .stats-scroll::-webkit-scrollbar { display:none; }
        .kpi-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:8px; margin-bottom:16px; }
        @media (max-width:520px){ .kpi-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
        .kpi { background:#0e0e1a; border:0.5px solid rgba(130,110,255,0.12); border-radius:10px; padding:11px 10px; text-align:center; }
        .chart-card { background:#0e0e1a; border:0.5px solid rgba(130,110,255,0.12); border-radius:12px; padding:14px; margin-bottom:12px; }
        .two-col { display:grid; grid-template-columns:3fr 2fr; gap:10px; }
        @media (max-width:560px){ .two-col { grid-template-columns:1fr; } }
        .inner-card { background:#0e0e1a; border:0.5px solid rgba(130,110,255,0.12); border-radius:12px; padding:12px; }
        .sl-item { display:flex; justify-content:space-between; align-items:center; padding:7px 0; border-bottom:0.5px solid rgba(130,110,255,0.12); }
        .sl-item:last-child { border-bottom:none; }
        .hm-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:3px; }
        .hm-days { display:grid; grid-template-columns:repeat(7,1fr); gap:3px; margin-top:4px; }
        .sec-title { font-size:11px; color:#3d3860; letter-spacing:.07em; text-transform:uppercase; margin-bottom:10px; }
      `}</style>

      <div
        className="li-app"
        onTouchStart={e => { touchStartY.current = e.touches[0].clientY; touchStartX.current = e.touches[0].clientX }}
        onTouchEnd={e => {
          const dy = e.changedTouches[0].clientY - touchStartY.current
          const dx = Math.abs(e.changedTouches[0].clientX - touchStartX.current)
          if (dx > 40) return
          if (!showStats && dy > 60) goToStats()
          if (showStats && dy < -60) goToStart()
        }}
        onWheel={e => {
          if (e.deltaY > 40 && !showStats) { e.preventDefault(); goToStats() }
          if (e.deltaY < -40 && showStats) { e.preventDefault(); goToStart() }
        }}
      >

        {/* START PAGE */}
        <div className={`li-page li-start${showStats ? ' out' : ''}`}>
          <nav className="li-nav">
            <div className="li-logo">lock-i<span style={{ textTransform: 'uppercase' }}>n</span></div>
            <div className="li-nav-actions">
              {subscriptionStatus !== 'active' && (
                <Link href="/subscribe" className="li-nav-premium">✦ získat premium</Link>
              )}
              <Link href="/settings" className="li-nav-link">nastavení</Link>
              <button type="button" className="li-nav-out" onClick={handleSignOut}>odhlásit se</button>
            </div>
          </nav>
          <div className="li-start-main">
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <div className="streak-badge" style={{ marginBottom: 0 }}>
                <span className="flame">🔥</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#fb923c' }}>{streakDays} dní streak</span>
              </div>
            </div>
            <div className="play-card">
              <div className="play-card-inner">
                <div style={{ fontSize: 10, color: '#3d3860', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>aktuální high score</div>
                <div style={{ fontSize: 40, fontWeight: 500, color: '#a89aff', lineHeight: 1, marginBottom: 18 }}>{highScore}-back</div>

                <div style={{ width: '100%', marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                    <span style={{ color: 'var(--text3)' }}>dnešní trénink</span>
                    <span style={{ color: sessionsToday >= 14 ? 'var(--success)' : 'var(--purple2)' }}>
                      {Math.min(sessionsToday, 14)} / 14
                    </span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        borderRadius: 2,
                        background: sessionsToday >= 14 ? 'var(--success)' : 'var(--purple)',
                        width: `${Math.min((sessionsToday / 14) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <MidnightCountdown />
                </div>

                <button type="button" className="play-btn" onClick={() => router.push('/game')}>▶ hrát dnes</button>
                {isAdmin && (
                  <a
                    href="/admin"
                    style={{
                      fontSize: '12px',
                      color: '#6b64a0',
                      textDecoration: 'none',
                      display: 'inline-block',
                      marginTop: '8px',
                    }}
                  >
                    admin →
                  </a>
                )}
              </div>
            </div>
            <div className="swipe-hint" onClick={goToStats}>
              <div style={{ fontSize: 11, color: '#3d3860', letterSpacing: '0.05em' }}>statistiky</div>
              <div className="swipe-arrow">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#3d3860" strokeWidth="2">
                  <polyline points="3,5 7,9 11,5" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* STATS PAGE */}
        <div className={`li-page li-stats${showStats ? ' in' : ''}`}>
          <nav className="li-nav">
            <div className="li-nav-mid">
              <div className="li-logo">lock-i<span style={{ textTransform: 'uppercase' }}>n</span></div>
              <button type="button" className="li-nav-link" onClick={goToStart}>← zpět</button>
            </div>
            <div className="li-nav-actions">
              {subscriptionStatus !== 'active' && (
                <Link href="/subscribe" className="li-nav-premium">✦ získat premium</Link>
              )}
              <Link href="/settings" className="li-nav-link">nastavení</Link>
              <button type="button" className="li-nav-out" onClick={handleSignOut}>odhlásit se</button>
            </div>
          </nav>
          <div className="stats-scroll">

            <div className="kpi-grid">
              {([
                { val: `${highScore}-back`, lbl: 'high score', accent: true },
                { val: `${overallAccuracy}%`, lbl: 'přesnost', accent: false },
                { val: String(totalSessions), lbl: 'sezení', accent: false },
                { val: String(streakDays), lbl: 'streak', accent: false },
              ] as const).map(k => (
                <div className="kpi" key={k.lbl}>
                  <div style={{ fontSize: 18, fontWeight: 500, color: k.accent ? '#a89aff' : '#e8e6ff' }}>{k.val}</div>
                  <div style={{ fontSize: 10, color: '#3d3860', marginTop: 2 }}>{k.lbl}</div>
                </div>
              ))}
            </div>

            <div className="sec-title">výkon — 14 dní</div>
            <div className="chart-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#e8e6ff' }}>přesnost %</div>
                <div style={{ fontSize: 11, color: '#3d3860' }}>posledních 14 dní</div>
              </div>
              <div style={{ position: 'relative', height: 120 }}>
                <canvas ref={chartRef} />
              </div>
            </div>

            <div className="two-col">
              <div className="inner-card">
                <div style={{ fontSize: 11, fontWeight: 500, color: '#e8e6ff', marginBottom: 8 }}>poslední sezení</div>
                {recentSessions.map((s, i) => (
                  <div className="sl-item" key={i}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.accuracy >= 70 ? '#6c5ce7' : '#3d3860', marginRight: 8, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 11, color: '#e8e6ff' }}>{Math.max(1, s.nLevel)}-back</div>
                        <div style={{ fontSize: 10, color: '#3d3860' }}>{formatDate(s.createdAt)}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: '#a89aff' }}>{s.accuracy}%</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="inner-card">
                <div style={{ fontSize: 11, fontWeight: 500, color: '#e8e6ff', marginBottom: 8 }}>aktivita</div>
                <div className="hm-grid">
                  {heatmapData.map((l, i) => (
                    <div key={i} style={{
                      aspectRatio: '1', borderRadius: 2,
                      background: l === 0 ? 'rgba(255,255,255,0.04)' : l === 1 ? 'rgba(108,92,231,0.2)' : l === 2 ? 'rgba(108,92,231,0.4)' : l === 3 ? 'rgba(108,92,231,0.65)' : '#6c5ce7',
                    }} />
                  ))}
                </div>
                <div className="hm-days">
                  {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map(d => (
                    <div key={d} style={{ fontSize: 8, color: '#3d3860', textAlign: 'center' }}>{d}</div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </>
  )
}

function MidnightCountdown() {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    function update() {
      const now = new Date()
      const midnight = new Date()
      midnight.setHours(24, 0, 0, 0)
      const diff = midnight.getTime() - now.getTime()
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      setTimeLeft(`${h}h ${m}m`)
    }
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8, textAlign: 'right' }}>
      do půlnoci zbývá {timeLeft}
    </div>
  )
}
