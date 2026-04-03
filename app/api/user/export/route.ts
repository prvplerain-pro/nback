import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: sessions, error } = await supabase
    .from('game_sessions')
    .select('created_at, n_level, score, position_score, audio_score, duration_seconds, played_at_hour, trials')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!sessions?.length) return NextResponse.json({ error: 'No data' }, { status: 404 })

  const header = 'Datum,Čas (hod),N-level,Skóre %,Pozice %,Písmeno %,Délka (s),Počet pokusů'
  const rows = sessions.map(s => [
    new Date(s.created_at).toLocaleDateString('cs-CZ'),
    s.played_at_hour ?? '',
    s.n_level,
    s.score,
    s.position_score ?? '',
    s.audio_score ?? '',
    s.duration_seconds ?? '',
    s.trials,
  ].join(','))

  const csv = [header, ...rows].join('\n')
  const bom = '\uFEFF'

  return new NextResponse(bom + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="lockin-data-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
