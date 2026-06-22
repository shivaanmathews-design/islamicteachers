import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient, slugify } from '@/lib/supabase'
import {
  sendTeacherRegistrationConfirmation,
  sendInstitutionRegistrationConfirmation,
  sendAdminNewListingNotification,
} from '@/lib/email'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const db = createServiceClient()

  try {
    if (body.type === 'teacher') {
      const slug = slugify(body.full_name)

      const { error } = await db.from('teachers').insert({
        user_id: body.user_id,
        full_name: body.full_name,
        gender: body.gender,
        province: body.province,
        city: body.city,
        email: body.email,
        whatsapp: body.whatsapp,
        subjects: body.subjects,
        years_experience: body.years_experience,
        session_type: body.session_type,
        age_groups: body.age_groups,
        qualification: body.qualification,
        qualification_description: body.qualification_description || null,
        hourly_rate: body.hourly_rate,
        availability: body.availability ?? true,
        online_availability: body.online_availability ?? false,
        inperson_availability: body.inperson_availability ?? false,
        bio: body.bio || null,
        listing_tier: body.listing_tier || 'free',
        listing_status: 'pending',
        references_data: body.references_data || [],
        slug,
      })
      if (error) throw error

      await sendTeacherRegistrationConfirmation(body.email, body.full_name, body.listing_tier || 'free')
      await sendAdminNewListingNotification(
        'teacher',
        body.full_name,
        { Location: `${body.city}, ${body.province}`, Tier: body.listing_tier, Subjects: body.subjects.join(', ') },
        `${process.env.NEXT_PUBLIC_SITE_URL}/admin`
      )
    } else if (body.type === 'institution') {
      const slug = slugify(body.institution_name)
      const { error } = await db.from('institutions').insert({
        user_id: body.user_id,
        institution_name: body.institution_name,
        institution_type: body.institution_type,
        province: body.province,
        city: body.city,
        address: body.address || null,
        email: body.email,
        phone: body.phone,
        whatsapp: body.whatsapp || null,
        website: body.website || null,
        description: body.description || null,
        subjects_offered: body.subjects_offered || [],
        listing_tier: body.listing_tier || 'institution',
        listing_status: 'pending',
        slug,
      })
      if (error) throw error
      await sendInstitutionRegistrationConfirmation(body.email, body.institution_name)
      await sendAdminNewListingNotification(
        'institution',
        body.institution_name,
        { Location: `${body.city}, ${body.province}`, Type: body.institution_type },
        `${process.env.NEXT_PUBLIC_SITE_URL}/admin`
      )
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('Registration error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
