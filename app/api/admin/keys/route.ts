import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as serviceClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { userId, delta, reset } = await req.json() as {
    userId: string
    delta?: number | null
    reset?: boolean
  }

  const db = serviceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get current keys
  const { data: targetProfile } = await db
    .from('profiles')
    .select('keys')
    .eq('id', userId)
    .single()

  if (!targetProfile) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  let newKeys: number
  if (reset) {
    newKeys = 3
  } else {
    newKeys = Math.min(3, Math.max(0, targetProfile.keys + (delta ?? 0)))
  }

  await db.from('profiles').update({ keys: newKeys }).eq('id', userId)

  return NextResponse.json({ newKeys })
}
