import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')

  if (!code) return NextResponse.redirect(`${origin}/login?error=oauth`)

  // Exchange the code for a session using the anon client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  if (error || !data.user) return NextResponse.redirect(`${origin}/login?error=oauth`)

  const uid = data.user.id
  const db = createServiceClient()

  // Route to correct dashboard
  if (data.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return NextResponse.redirect(`${origin}/admin`)
  }
  const { data: t } = await db.from('teachers').select('id').eq('user_id', uid).single()
  if (t) return NextResponse.redirect(`${origin}/dashboard/teacher`)
  const { data: i } = await db.from('institutions').select('id').eq('user_id', uid).single()
  if (i) return NextResponse.redirect(`${origin}/dashboard/institution`)

  // New Google user — no profile yet
  return NextResponse.redirect(`${origin}/register/teacher`)
}
