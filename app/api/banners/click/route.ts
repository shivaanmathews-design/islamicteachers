import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const db = createServiceClient()
    await db.rpc('increment_banner_clicks', { banner_id: id }).maybeSingle()
    // Fallback if RPC doesn't exist: do a manual increment
    const { data } = await db.from('banner_ads').select('click_count').eq('id', id).single()
    if (data) {
      await db.from('banner_ads').update({ click_count: (data.click_count||0) + 1 }).eq('id', id)
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: true }) // fail silently for click tracking
  }
}
