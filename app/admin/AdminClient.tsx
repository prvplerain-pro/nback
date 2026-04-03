'use client'
import { useState } from 'react'

interface UserRow {
  id: string
  email: string
  keys: number
  high_score: number
  consecutive_high_scores: number
  streak_days: number
  last_played_at: string | null
  created_at: string
}

export default function AdminClient({ profiles }: { profiles: UserRow[] }) {
  const [users, setUsers]   = useState<UserRow[]>(profiles)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const [msg, setMsg] = useState('')

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  async function adjustKeys(userId: string, delta: number) {
    setLoading(userId + delta)
    const res = await fetch('/api/admin/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, delta }),
    })
    const data = await res.json()
    if (data.newKeys !== undefined) {
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, keys: data.newKeys } : u
      ))
      setMsg(`Updated`)
      setTimeout(() => setMsg(''), 2000)
    }
    setLoading(null)
  }

  async function resetKeys(userId: string) {
    setLoading(userId + 'reset')
    const res = await fetch('/api/admin/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, delta: null, reset: true }),
    })
    const data = await res.json()
    if (data.newKeys !== undefined) {
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, keys: data.newKeys } : u
      ))
    }
    setLoading(null)
  }

  function daysAgo(dateStr: string | null) {
    if (!dateStr) return 'never'
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
    if (days === 0) return 'today'
    if (days === 1) return 'yesterday'
    return `${days}d ago`
  }

  return (
    <main className="min-h-screen px-6 py-10" style={{ background: 'var(--bg)' }}>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              N<span style={{ color: 'var(--accent)' }}>—</span>Back Admin
            </h1>
            <p className="text-white/40 text-sm mt-1">{users.length} users</p>
          </div>
          {msg && (
            <span className="text-sm px-3 py-1 rounded-full"
              style={{ background: 'rgba(74,222,128,0.15)', color: 'var(--success)' }}>
              ✓ {msg}
            </span>
          )}
        </div>

        <p className="text-white/35 text-xs max-w-2xl leading-relaxed">
          Úvodní onboarding na dashboardu je jen v prohlížeči (<code className="text-white/50">localStorage</code>, klíč <code className="text-white/50">onboarding_done</code>).
          Server ho neovládá — znovu se zobrazí až po vymazání lokálních dat / úložiště daného uživatele.
        </p>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm px-4 py-2 rounded-xl bg-white/10 border border-white/10 focus:border-white/30 outline-none text-sm"
        />

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total Users',    value: users.length },
            { label: 'Active Today',   value: users.filter(u => daysAgo(u.last_played_at) === 'today').length },
            { label: 'Locked (0 keys)', value: users.filter(u => u.keys === 0).length },
            { label: 'Avg High Score', value: `N-${users.length ? Math.round(users.reduce((a,u) => a + u.high_score, 0) / users.length) : 0}` },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-xl border border-white/10 bg-white/5 text-center">
              <div className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{s.value}</div>
              <div className="text-xs text-white/40 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                {['Email', 'Keys', 'High Score', 'Streak', 'Recovery', 'Last Played', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => (
                <tr key={user.id}
                  style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}
                  className="border-t border-white/5">

                  {/* Email */}
                  <td className="px-4 py-3 text-white/80 font-mono text-xs">{user.email}</td>

                  {/* Keys */}
                  <td className="px-4 py-3">
                    <div className="flex gap-0.5">
                      {[0,1,2].map(i => (
                        <span key={i} className={`text-base ${i < user.keys ? 'flame-icon' : 'flame-icon empty'}`}>
                          🔥
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* High score */}
                  <td className="px-4 py-3">
                    <span className="font-semibold" style={{ color: 'var(--accent)' }}>N-{user.high_score}</span>
                  </td>

                  {/* Streak */}
                  <td className="px-4 py-3 text-white/60">{user.streak_days}d</td>

                  {/* Recovery progress */}
                  <td className="px-4 py-3 text-white/60">{user.consecutive_high_scores}/3</td>

                  {/* Last played */}
                  <td className="px-4 py-3 text-white/40 text-xs">{daysAgo(user.last_played_at)}</td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => adjustKeys(user.id, -1)}
                        disabled={user.keys === 0 || loading !== null}
                        className="px-2 py-1 rounded-lg text-xs border border-white/10 hover:border-white/30 disabled:opacity-30 transition-all"
                        title="Remove 1 key">
                        −
                      </button>
                      <button
                        onClick={() => adjustKeys(user.id, 1)}
                        disabled={user.keys === 3 || loading !== null}
                        className="px-2 py-1 rounded-lg text-xs border border-white/10 hover:border-white/30 disabled:opacity-30 transition-all"
                        title="Add 1 key">
                        +
                      </button>
                      <button
                        onClick={() => resetKeys(user.id)}
                        disabled={loading !== null}
                        className="px-2 py-1 rounded-lg text-xs border border-white/10 hover:border-white/30 disabled:opacity-30 transition-all"
                        title="Reset to 3 keys"
                        style={{ color: 'var(--key-gold)' }}>
                        Reset
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-white/30">No users found</div>
          )}
        </div>

      </div>
    </main>
  )
}
