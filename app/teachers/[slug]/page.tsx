import { createServiceClient } from '@/lib/supabase'
import { SUBJECTS, HOURLY_RATES } from '@/lib/types'
import type { Teacher } from '@/lib/types'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ContactModal from '@/components/ContactModal'
import ReviewSection from '@/components/ReviewSection'

// A URL param is either a UUID (the teacher id) or a text slug. We must query
// the matching column — comparing the uuid `id` column to a non-uuid slug
// throws a DB error and makes the page 404.
const isUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const db = createServiceClient()
  const col = isUuid(slug) ? 'id' : 'slug'
  const { data: t } = await db.from('teachers').select('full_name,city,province,subjects,session_type').eq(col, slug).single()
  if (!t) return { title: 'Teacher Not Found' }
  const subjectLabels = (t.subjects as string[]).map((s:string) => SUBJECTS.find(x=>x.value===s)?.label).filter(Boolean).join(', ')
  return {
    title: `${t.full_name} — Islamic Teacher in ${t.city} | IslamicTeachers.co.za`,
    description: `${t.full_name} offers ${subjectLabels} lessons in ${t.city}, ${t.province}. ${t.session_type === 'both' ? 'In-person and online' : t.session_type} sessions available.`,
  }
}

export default async function TeacherProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const db = createServiceClient()
  const col = isUuid(slug) ? 'id' : 'slug'
  const { data: teacher } = await db.from('teachers').select('*').eq(col, slug).eq('listing_status','active').single()
  if (!teacher) notFound()

  const t = teacher as Teacher
  const subjectLabels = t.subjects.map(s => SUBJECTS.find(x=>x.value===s)?.label).filter(Boolean)
  const rateLabel = HOURLY_RATES.find(r=>r.value===t.hourly_rate)?.label

  // Increment profile views (fire and forget)
  db.from('teachers').update({ profile_views: (t.profile_views||0)+1 }).eq('id',t.id)

  // Fetch approved reviews
  const { data: reviewsData } = await db.from('reviews').select('id,reviewer_name,rating,comment,created_at').eq('teacher_id',t.id).eq('approved',true).order('created_at',{ ascending:false })

  return (
    <div style={{ background:'#f9f9f9', minHeight:'100vh' }}>
      {/* Breadcrumb */}
      <div style={{ background:'#0F6E56', padding:'12px 0' }}>
        <div className="container" style={{ fontSize:13, color:'#E1F5EE' }}>
          <Link href="/" style={{ color:'#5DCAA5', textDecoration:'none' }}>Home</Link>
          {' › '}
          <Link href="/find-a-teacher" style={{ color:'#5DCAA5', textDecoration:'none' }}>Find a Teacher</Link>
          {' › '}
          <Link href={`/find-a-teacher?province=${t.province}`} style={{ color:'#5DCAA5', textDecoration:'none' }}>{t.province}</Link>
          {' › '}
          <span>{t.full_name}</span>
        </div>
      </div>

      <div className="container" style={{ padding:'32px 20px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:28, alignItems:'start' }}>

          {/* Main profile */}
          <div>
            {/* Header card */}
            <div style={{ background:'#fff', borderRadius:12, padding:32, marginBottom:20, border:'1.5px solid #e8e8e8' }}>
              <div style={{ display:'flex', gap:24, flexWrap:'wrap' }}>
                {/* Photo */}
                <div style={{ width:120, height:120, borderRadius:12, overflow:'hidden', background:'#E1F5EE', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {t.profile_photo_url
                    ? <img src={t.profile_photo_url} alt={t.full_name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <span style={{ fontSize:48, color:'#0F6E56', fontWeight:700 }}>{t.full_name.charAt(0)}</span>
                  }
                </div>
                {/* Info */}
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:8 }}>
                    {t.listing_tier==='premium' && <span className="badge badge-premium">⭐ Featured Teacher</span>}
                    {t.listing_tier==='standard' && <span className="badge badge-standard">Standard</span>}
                    {t.availability && <span className="badge badge-active">✓ Taking New Students</span>}
                  </div>
                  <h1 style={{ margin:'0 0 6px', fontSize:26, fontWeight:700, color:'#2C2C2A' }}>{t.full_name}</h1>
                  <p style={{ margin:'0 0 12px', color:'#666', fontSize:15 }}>
                    📍 {t.city}, {t.province} &nbsp;·&nbsp;
                    {t.session_type==='both' ? '🌐 Online & In-Person' : t.session_type==='online' ? '🌐 Online Only' : '📍 In-Person Only'}
                    &nbsp;·&nbsp; {t.years_experience} years exp.
                  </p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:16 }}>
                    {subjectLabels.map(s=><span key={s} className="tag">{s}</span>)}
                  </div>
                  <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
                    <span style={{ fontSize:15, color:'#0F6E56', fontWeight:600 }}>{rateLabel}</span>
                    {t.qualification==='yes' && <span style={{ fontSize:14, color:'#666' }}>✓ Qualified</span>}
                    {t.qualification==='studying' && <span style={{ fontSize:14, color:'#666' }}>📚 Currently studying</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {t.bio && (
              <div style={{ background:'#fff', borderRadius:12, padding:28, marginBottom:20, border:'1.5px solid #e8e8e8' }}>
                <h2 style={{ color:'#0F6E56', fontSize:18, fontWeight:700, marginBottom:16 }}>About {t.full_name}</h2>
                <p style={{ fontSize:15, lineHeight:1.8, color:'#2C2C2A', margin:0, whiteSpace:'pre-wrap' }}>{t.bio}</p>
              </div>
            )}

            {/* Video */}
            {t.video_intro_url && t.listing_tier==='premium' && (
              <div style={{ background:'#fff', borderRadius:12, padding:28, marginBottom:20, border:'1.5px solid #e8e8e8' }}>
                <h2 style={{ color:'#0F6E56', fontSize:18, fontWeight:700, marginBottom:16 }}>Video Introduction</h2>
                <video controls style={{ width:'100%', borderRadius:8, background:'#000' }}>
                  <source src={t.video_intro_url} type="video/mp4" />
                </video>
              </div>
            )}

            {/* Reviews */}
            <ReviewSection teacherId={t.id} reviews={reviewsData ?? []} />

            {/* Details */}
            <div style={{ background:'#fff', borderRadius:12, padding:28, marginTop:20, border:'1.5px solid #e8e8e8' }}>
              <h2 style={{ color:'#0F6E56', fontSize:18, fontWeight:700, marginBottom:20 }}>Teaching Details</h2>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16 }}>
                {[
                  ['Subjects', subjectLabels.join(', ')],
                  ['Session type', t.session_type==='both'?'Online & In-Person':t.session_type==='online'?'Online only':'In-Person only'],
                  ['Age groups', (t.age_groups||[]).join(', ')],
                  ['Experience', `${t.years_experience} years`],
                  ['Rate', rateLabel||''],
                  ['Qualification', t.qualification==='yes'?'Qualified':t.qualification==='studying'?'Currently studying':'No formal qualification'],
                  ['Available online', t.online_availability?'Yes':'No'],
                  ['Available in-person', t.inperson_availability?'Yes':'No'],
                ].map(([k,v])=>(
                  <div key={k} style={{ padding:'12px 16px', background:'#f9f9f9', borderRadius:8 }}>
                    <p style={{ margin:'0 0 4px', fontSize:12, fontWeight:600, color:'#0F6E56', textTransform:'uppercase', letterSpacing:0.5 }}>{k}</p>
                    <p style={{ margin:0, fontSize:14, color:'#2C2C2A' }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ position:'sticky', top:80 }}>
            <ContactModal teacher={t} />
            <div style={{ background:'#E1F5EE', borderRadius:12, padding:20, marginTop:16, border:'1px solid #5DCAA5' }}>
              <p style={{ margin:'0 0 8px', fontSize:13, fontWeight:600, color:'#0F6E56' }}>👀 {t.profile_views} profile views</p>
              <p style={{ margin:'0 0 8px', fontSize:13, color:'#555' }}>📩 {t.enquiry_count} enquiries received</p>
              <p style={{ margin:0, fontSize:12, color:'#888' }}>Listed on IslamicTeachers.co.za</p>
            </div>
            <div style={{ background:'#fff', borderRadius:12, padding:20, marginTop:16, border:'1.5px solid #e8e8e8', fontSize:13, color:'#888' }}>
              <p style={{ margin:'0 0 8px' }}>⚠️ Always verify a teacher's identity before your first lesson.</p>
              <Link href="/child-safety" style={{ color:'#0F6E56', fontWeight:600, textDecoration:'none' }}>Read our Child Safety Policy →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
