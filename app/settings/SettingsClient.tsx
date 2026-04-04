'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type SubStatus = 'active' | 'inactive' | 'canceled'

const SUB_LABEL: Record<SubStatus, string> = {
  active: 'Aktivní',
  inactive: 'Neaktivní',
  canceled: 'Zrušené',
}

type Props = {
  email: string
  initialFirstName: string
  initialLastName: string
  subscriptionStatus: SubStatus
  hasStripeCustomer: boolean
  showOnboardingBanner: boolean
}

export default function SettingsClient({
  email,
  initialFirstName,
  initialLastName,
  subscriptionStatus,
  hasStripeCustomer,
  showOnboardingBanner,
}: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [firstName, setFirstName] = useState(initialFirstName)
  const [lastName, setLastName] = useState(initialLastName)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPw, setSavingPw] = useState(false)
  const [pwMsg, setPwMsg] = useState('')

  const [portalLoading, setPortalLoading] = useState(false)
  const [subMsg, setSubMsg] = useState('')

  async function saveNames(e: React.FormEvent) {
    e.preventDefault()
    setSavingProfile(true)
    setProfileMsg('')
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setSavingProfile(false)
      setProfileMsg('Nejste přihlášeni.')
      return
    }
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
      })
      .eq('id', user.id)

    setSavingProfile(false)
    if (error) {
      setProfileMsg(error.message)
      return
    }
    setProfileMsg('Uloženo.')
    router.refresh()
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwMsg('')
    if (newPassword.length < 6) {
      setPwMsg('Heslo musí mít alespoň 6 znaků.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPwMsg('Hesla se neshodují.')
      return
    }
    setSavingPw(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSavingPw(false)
    if (error) {
      setPwMsg(error.message)
      return
    }
    setNewPassword('')
    setConfirmPassword('')
    setPwMsg('Heslo bylo změněno.')
  }

  async function openBillingPortal() {
    setSubMsg('')
    setPortalLoading(true)
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const data = await res.json()
    setPortalLoading(false)
    if (!res.ok) {
      setSubMsg(data.error ?? 'Nepodařilo se otevřít portál.')
      return
    }
    if (data.url) window.location.href = data.url
  }

  const fieldClass =
    'w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[#e8e6ff] placeholder:text-white/25 outline-none focus:border-white/25 transition-colors'

  return (
    <main className="min-h-screen px-4 py-10 pb-16" style={{ background: '#08080f', color: '#e8e6ff' }}>
      <div className="max-w-md mx-auto space-y-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">Nastavení</h1>
          <Link
            href="/dashboard"
            className="text-sm text-white/45 hover:text-white/70 transition-colors shrink-0"
          >
            ← dashboard
          </Link>
        </div>

        {showOnboardingBanner && (
          <div
            className="rounded-xl px-4 py-3 text-sm border"
            style={{ background: 'rgba(108,99,255,0.12)', borderColor: 'rgba(108,99,255,0.35)', color: '#a89aff' }}
          >
            Doplňte prosím jméno a příjmení — údaje z e-mailové registrace nestačí.
          </div>
        )}

        <p className="text-sm text-white/35">
          Přihlášený účet: <span className="text-white/55">{email}</span>
        </p>

        {/* Jméno */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-white/35">Osobní údaje</h2>
          <form onSubmit={saveNames} className="space-y-3">
            <div>
              <label className="block text-sm text-white/45 mb-1.5">Jméno</label>
              <input
                className={fieldClass}
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="Jan"
                autoComplete="given-name"
              />
            </div>
            <div>
              <label className="block text-sm text-white/45 mb-1.5">Příjmení</label>
              <input
                className={fieldClass}
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Novák"
                autoComplete="family-name"
              />
            </div>
            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-3 rounded-xl font-medium text-sm disabled:opacity-50 transition-opacity"
              style={{ background: 'var(--accent)' }}
            >
              {savingProfile ? 'Ukládám…' : 'Uložit údaje'}
            </button>
            {profileMsg ? <p className="text-sm text-white/50">{profileMsg}</p> : null}
          </form>
        </section>

        {/* Heslo */}
        <section className="space-y-3 pt-2 border-t border-white/10">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-white/35">Změna hesla</h2>
          <form onSubmit={savePassword} className="space-y-3">
            <input
              type="password"
              className={fieldClass}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Nové heslo"
              autoComplete="new-password"
            />
            <input
              type="password"
              className={fieldClass}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Potvrzení hesla"
              autoComplete="new-password"
            />
            <button
              type="submit"
              disabled={savingPw}
              className="w-full py-3 rounded-xl font-medium text-sm border border-white/15 text-white/85 hover:bg-white/5 disabled:opacity-50 transition-colors"
            >
              {savingPw ? 'Ukládám…' : 'Změnit heslo'}
            </button>
            {pwMsg ? (
              <p className={`text-sm ${pwMsg.includes('změněno') ? 'text-green-400/90' : 'text-red-400/90'}`}>{pwMsg}</p>
            ) : null}
          </form>
        </section>

        {/* Export dat */}
        <section className="space-y-3 pt-2 border-t border-white/10">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-white/35">Data</h2>
          <p className="text-sm text-white/35">
            Stáhnout historii sezení jako CSV (vhodné pro Excel).
          </p>
          <a
            href="/api/user/export"
            download
            className="inline-flex items-center gap-1 text-sm text-[#6b64a0] hover:text-[#a89aff] transition-colors"
          >
            ↓ exportovat data (CSV)
          </a>
        </section>

        {/* Předplatné */}
        <section className="space-y-3 pt-2 border-t border-white/10">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-white/35">Předplatné</h2>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 flex items-center justify-between gap-3">
            <span className="text-sm text-white/45">Stav</span>
            <span
              className="text-sm font-medium"
              style={{
                color:
                  subscriptionStatus === 'active'
                    ? 'var(--success)'
                    : subscriptionStatus === 'canceled'
                      ? 'var(--danger)'
                      : 'rgba(255,255,255,0.45)',
              }}
            >
              {SUB_LABEL[subscriptionStatus]}
            </span>
          </div>
          {hasStripeCustomer ? (
            <button
              type="button"
              onClick={openBillingPortal}
              disabled={portalLoading}
              className="w-full py-3 rounded-xl font-medium text-sm border border-white/15 text-white/85 hover:bg-white/5 disabled:opacity-50"
            >
              {portalLoading ? 'Otevírám…' : 'Spravovat předplatné'}
            </button>
          ) : (
            <Link
              href="/subscribe"
              className="block w-full py-3 rounded-xl font-medium text-sm text-center"
              style={{ background: 'var(--accent)' }}
            >
              Předplatit
            </Link>
          )}
          {subMsg ? <p className="text-sm text-red-400/90">{subMsg}</p> : null}
        </section>
      </div>
    </main>
  )
}
