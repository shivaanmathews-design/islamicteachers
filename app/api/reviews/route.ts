import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { teacher_id, name, email, rating, comment } = await req.json()

    if (!teacher_id || !name || !comment || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    const db = createServiceClient()
    const { error } = await db.from('reviews').insert({
      teacher_id,
      reviewer_name: name,
      reviewer_email: email || '',
      rating,
      comment,
      approved: false,
    })

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to submit review' }, { status: 500 })
  }
}
