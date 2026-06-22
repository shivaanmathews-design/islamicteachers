import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { sendListingApproved } from '@/lib/email'

export async function POST(req: NextRequest) {
  const { id, type } = await req.json()
  const db = createServiceClient()
  const table = type === 'institution' ? 'institutions' : 'teachers'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://islamicteachers.co.za'

  const { data, error } = await db.from(table).update({ listing_status: 'active' }).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const name = type === 'institution' ? data.institution_name : data.full_name
  const slug = data.slug || data.id
  const profileUrl = type === 'institution' ? `${siteUrl}/institutions/${slug}` : `${siteUrl}/teachers/${slug}`
  const dashUrl = type === 'institution' ? `${siteUrl}/dashboard/institution` : `${siteUrl}/dashboard/teacher`

  await sendListingApproved(data.email, name, profileUrl, dashUrl)
  return NextResponse.json({ success: true })
}
