'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Profile } from '@/types'

const HIGH_SCORE_STREAK = 3

export default function LockedClient({ profile }: { profile: Profile }) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  const referralUrl = `${window.location.origin}/register?ref=${profile.referral_code}`

  async function copyLink() {
    await navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const streak    = profile.consecutive_high_scores
  const needed    = HIGH_SCORE_STREAK
  const highScore = profile.high_score

  return (
    <>
      <style>{`
        .li-locked {
          min-height: 100dvh;
          background: #08080f;
          color: #e8e6ff;
          font-family: var(--font-geist-sans), system-ui, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px 20px;
          gap: 0;
        }
        .li-locked-inner {
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .li-locked-hero {
          text-align: center;
          padding: 8px 0 16px;
        }
        .li-logo {
          font-size: 14px;
          font-weight: 500;
          color: #a89aff;
          letter-spacing: .06em;
          margin-bottom: 28px;
        }
        .li-lock-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: rgba(108,92,231,0.12);
          border: 0.5px solid rgba(108,92,231,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }
        .li-lock-icon svg {
          width: 24px;
          height: 24px;
          stroke: #a89aff;
          fill: none;
          stroke-width: 1.5;
        }
        .li-locked-title {
          font-size: 22px;
          font-weight: 500;
          color: #e8e6ff;
          margin-bottom: 6px;
        }
        .li-locked-sub {
          font-size: 13px;
          color: #3d3860;
          line-height: 1.5;
        }
        .li-flames {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 16px;
        }
        .li-flame {
          font-size: 28px;
          opacity: 0.2;
          filter: grayscale(1);
        }
        .li-card {
          background: #0e0e1a;
          border: 0.5px solid rgba(130,110,255,0.12);
          border-radius: 16px;
          padding: 18px 20px;
        }
        .li-card-title {
          font-size: 13px;
          font-weight: 500;
          color: #e8e6ff;
          margin-bottom: 6px;
        }
        .li-card-desc {
          font-size: 12px;
          color: #3d3860;
          line-height: 1.55;
          margin-bottom: 14px;
        }
        .li-progress {
          display: flex;
          gap: 6px;
          margin-bottom: 6px;
        }
        .li-progress-bar {
          flex: 1;
          height: 3px;
          border-radius: 2px;
        }
        .li-progress-label {
          font-size: 11px;
          color: #3d3860;
          margin-bottom: 14px;
        }
        .li-btn-primary {
          width: 100%;
          padding: 13px;
          background: #6c5ce7;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background .18s, transform .18s;
        }
        .li-btn-primary:hover { background: #7d6ef0; }
        .li-btn-primary:active { transform: scale(.98); }
        .li-referral-row {
          display: flex;
          gap: 8px;
        }
        .li-referral-input {
          flex: 1;
          padding: 9px 12px;
          background: rgba(255,255,255,0.04);
          border: 0.5px solid rgba(130,110,255,0.12);
          border-radius: 8px;
          font-size: 12px;
          font-family: monospace;
          color: #8a82c0;
          outline: none;
          min-width: 0;
        }
        .li-copy-btn {
          padding: 9px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: background .18s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .li-footer {
          text-align: center;
          padding-top: 4px;
        }
        .li-footer-text {
          font-size: 12px;
          color: #3d3860;
          margin-bottom: 6px;
        }
        .li-footer-link {
          font-size: 12px;
          color: #4a4470;
          background: none;
          border: none;
          cursor: pointer;
          text-decoration: underline;
          transition: color .2s;
        }
        .li-footer-link:hover { color: #8a82c0; }
        .li-divider {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .li-divider-line {
          flex: 1;
          height: 0.5px;
          background: rgba(130,110,255,0.1);
        }
        .li-divider-text {
          font-size: 11px;
          color: #3d3860;
        }
      `}</style>

      <main className="li-locked">
        <div className="li-locked-inner">

          <div className="li-locked-hero">
            <div className="li-logo">lock-i<span style={{ textTransform: 'uppercase' }}>n</span></div>
            <div className="li-lock-icon">
              <svg viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div className="li-locked-title">přístup zablokován</div>
            <div className="li-locked-sub">Došly ti životy. Odemkni si přístup jednou z možností níže.</div>
            <div className="li-flames">
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} className="li-flame">🔥</span>
              ))}
            </div>
          </div>

          {/* Option 1 */}
          <div className="li-card">
            <div className="li-card-title">možnost 1 — dokaž se</div>
            <div className="li-card-desc">
              Překonej svůj rekord (N-{highScore}) s přesností ≥80 % celkem {needed}× za sebou.
            </div>
            <div className="li-progress">
              {Array.from({ length: needed }).map((_, i) => (
                <div
                  key={i}
                  className="li-progress-bar"
                  style={{ background: i < streak ? '#6c5ce7' : 'rgba(255,255,255,0.08)' }}
                />
              ))}
            </div>
            <div className="li-progress-label">{streak} / {needed} dokončeno</div>
            <button className="li-btn-primary" onClick={() => router.push('/game')}>
              ▶ zkusit recovery hru
            </button>
          </div>

          <div className="li-divider">
            <div className="li-divider-line" />
            <div className="li-divider-text">nebo</div>
            <div className="li-divider-line" />
          </div>

          {/* Option 2 */}
          <div className="li-card">
            <div className="li-card-title">možnost 2 — pozvi přítele</div>
            <div className="li-card-desc">
              Sdílej odkaz. Když se kamarád přihlásí a předplatí, oba dostanete +1 život.
            </div>
            <div className="li-referral-row">
              <input
                readOnly
                value={referralUrl}
                className="li-referral-input"
              />
              <button
                className="li-copy-btn"
                onClick={copyLink}
                style={{ background: copied ? 'rgba(74,222,128,0.15)' : 'rgba(108,92,231,0.2)', color: copied ? '#4ade80' : '#a89aff', border: `0.5px solid ${copied ? 'rgba(74,222,128,0.3)' : 'rgba(108,92,231,0.3)'}` }}
              >
                {copied ? '✓ zkopírováno' : 'kopírovat'}
              </button>
            </div>
          </div>

          <div className="li-footer">
            <div className="li-footer-text">nebo obnov předplatné a získej ihned 3 životy zpět.</div>
            <button className="li-footer-link" onClick={() => router.push('/subscribe')}>
              spravovat předplatné →
            </button>
          </div>

        </div>
      </main>
    </>
  )
}
