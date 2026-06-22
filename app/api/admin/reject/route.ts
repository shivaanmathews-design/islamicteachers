import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { sendListingRejected } from '@/lib/email'

export async function POST(req: NextRequest) {
  const { id, type, reason } = await req.json()
  const db = createServiceClient()
  const table = type === 'institution' ? 'institutions' : 'teachers'

  const { data, error } = await db.from(table).update({ listing_status: 'rejected' }).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const name = type === 'institution' ? data.institution_name : data.full_name
  await sendListingRejected(data.email, name, reason || 'Your listing did not meet our requirements.')
  return NextResponse.json({ success: true })
}
