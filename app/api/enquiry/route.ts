import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { sendEnquiryToTeacher, sendEnquiryConfirmationToEnquirer } from '@/lib/email'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const db = createServiceClient()

  const { data: teacher, error: te } = await db
    .from('teachers')
    .select('full_name, email, whatsapp, enquiry_count')
    .eq('id', body.teacher_id)
    .single()

  if (te || !teacher) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })

  const { error } = await db.from('enquiries').insert({
    teacher_id: body.teacher_id,
    enquirer_name: body.enquirer_name,
    enquirer_email: body.enquirer_email,
    message: body.message || null,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Increment enquiry count
  await db.from('teachers').update({ enquiry_count: (teacher.enquiry_count || 0) + 1 }).eq('id', body.teacher_id)

  // Send email to teacher
  await sendEnquiryToTeacher(teacher.email, teacher.full_name, body.enquirer_name, body.message || '')

  // Send a copy/confirmation to the enquirer
  if (body.enquirer_email) {
    await sendEnquiryConfirmationToEnquirer(body.enquirer_email, body.enquirer_name, teacher.full_name, body.message || '')
  }

  return NextResponse.json({ success: true, teacher_email: teacher.email, teacher_whatsapp: teacher.whatsapp })
}
