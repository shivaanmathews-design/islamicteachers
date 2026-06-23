import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { teacher_id } = await req.json()
    if (!teacher_id) return NextResponse.json({ ok: false })
    const db = createServiceClient()
    await db.rpc('increment_whatsapp_clicks', { teacher_id })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
