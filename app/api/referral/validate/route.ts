import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Public route — no auth needed (used before signup)
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ valid: false })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('referral_code', code.toUpperCase())
    .single()

  if (!data) return NextResponse.json({ valid: false })

  return NextResponse.json({
    valid: true,
    referrerId: data.id,
    // Don't expose email — just enough to show "Invited by a friend"
  })
}
