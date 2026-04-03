import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, keys, sessions_today, streak_days')

  if (!profiles?.length) return NextResponse.json({ processed: 0 })

  await Promise.all(
    profiles.map(async (profile) => {
      const sessionsToday = profile.sessions_today ?? 0
      const shouldDeduct = sessionsToday < 14 && profile.keys > 0

      await supabase
        .from('profiles')
        .update({
          keys: shouldDeduct ? profile.keys - 1 : profile.keys,
          sessions_today: 0,
          streak_days: shouldDeduct ? 0 : profile.streak_days,
        })
        .eq('id', profile.id)
    })
  )

  return NextResponse.json({ processed: profiles.length })
}
