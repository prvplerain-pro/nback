import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processGameResult } from '@/lib/keys'
import { nextNLevel } from '@/lib/game'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { nLevel, scorePercent } = await req.json() as {
    nLevel: number
    scorePercent: number
  }

  const result = await processGameResult(user.id, nLevel, scorePercent)
  const suggestedN = nextNLevel(nLevel, scorePercent)

  return NextResponse.json({
    ...result,
    suggestedN,
    sessionsToday: result.newSessionsToday,
  })
}
