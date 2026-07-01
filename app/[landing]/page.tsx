import { createServiceClient, slugify } from '@/lib/supabase'
import { CITIES, SUBJECTS } from '@/lib/types'
import type { Teacher } from '@/lib/types'
import TeacherCard from '@/components/TeacherCard'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://islamicteachers.co.za'
const CITY_PREFIX = 'islamic-teachers-'

type Resolved =
  | { kind: 'city'; city: string; slug: string }
  | { kind: 'subject'; value: string; label: string; slug: string }

function resolve(landing: string): Resolved | null {
  if (landing.startsWith(CITY_PREFIX)) {
    const citySlug = landing.slice(CITY_PREFIX.length)
    const city = CITIES.find(c => slugify(c) === citySlug)
    if (city) return { kind: 'city', city, slug: landing }
  }
  const subject = SUBJECTS.find(s => s.slug && s.slug === landing)
  if (subject) return { kind: 'subject', value: subject.value, label: subject.label, slug: landing }
  return null
}

export async function generateMetadata({ params }: { params: Promise<{ landing: string }> }) {
  const { landing } = await params
  const r = resolve(landing)
  if (!r) return { title: 'Page Not Found' }
  if (r.kind === 'city') {
    return {
      title: `Islamic Teachers in ${r.city} | Quran, Tajweed & Arabic Tutors — IslamicTeachers.co.za`,
      description: `Find trusted, verified Islamic teachers in ${r.city}. Browse Quran, Tajweed, Hifz, Arabic and Islamic studies tutors offering in-person and online lessons in ${r.city}, South Africa.`,
      alternates: { canonical: `${SITE_URL}/${r.slug}` },
    }
  }
  return {
    title: `${r.label} Teachers in South Africa | Find a ${r.label} Tutor — IslamicTeachers.co.za`,
    description: `Find verified ${r.label} teachers across South Africa. Compare qualified ${r.label} tutors for children and adults, offering in-person and online lessons. Free for students and parents.`,
    alternates: { canonical: `${SITE_URL}/${r.slug}` },
  }
}

export default async function LandingPage({ params }: { params: Promise<{ landing: string }> }) {
  const { landing } = await params
  const r = resolve(landing)
  if (!r) notFound()

  const db = createServiceClient()
  let q = db.from('teachers').select('*')
    .eq('listing_status', 'active')
    .order('listing_tier', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(60)
  if (r.kind === 'city') q = q.ilike('city', `%${r.city}%`)
  else q = q.contains('subjects', [r.value])
  const { data } = await q
  const teachers = (data || []) as Teacher[]

  const heading = r.kind === 'city' ? `Islamic Teachers in ${r.city}` : `${r.label} Teachers in South Africa`
  const intro = r.kind === 'city'
    ? `Looking for a trusted Islamic teacher in ${r.city}? IslamicTeachers.co.za connects Muslim families in ${r.city} with verified Quran, Tajweed, Hifz, Arabic and Islamic studies teachers. Every teacher is reviewed before their listing goes live, and you can arrange in-person lessons in ${r.city} or online classes from anywhere in South Africa.`
    : `Find a qualified ${r.label} teacher anywhere in South Africa. Browse verified ${r.label} tutors for children, teenagers and adults — from beginners to advanced learners. Compare experience, teaching style and availability, then contact your chosen teacher directly for in-person or online ${r.label} lessons.`

  // JSON-LD structured data (breadcrumb + item list of teachers)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: heading, item: `${SITE_URL}/${r.slug}` },
        ],
      },
      {
        '@type': 'ItemList',
        itemListElement: teachers.slice(0, 20).map((t, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: t.full_name,
          url: `${SITE_URL}/teachers/${t.slug || t.id}`,
        })),
      },
    ],
  }

  const otherCities = CITIES.filter(c => !(r.kind === 'city' && c === r.city))
  const otherSubjects = SUBJECTS.filter(s => s.slug && !(r.kind === 'subject' && s.value === r.value))

  return (
    <div style={{ background:'#f9f9f9', minHeight:'100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <div style={{ background:'#0F6E56', padding:'44px 0' }}>
        <div className="container">
          <nav style={{ marginBottom:12, fontSize:13 }}>
            <Link href="/" style={{ color:'#5DCAA5', textDecoration:'none' }}>Home</Link>
            <span style={{ color:'#5DCAA5', opacity:0.6 }}> / </span>
            <span style={{ color:'#E1F5EE' }}>{heading}</span>
          </nav>
          <h1 style={{ color:'#fff', fontSize:30, fontWeight:700, margin:'0 0 12px' }}>{heading}</h1>
          <p style={{ color:'#E1F5EE', fontSize:15, lineHeight:1.7, margin:0, maxWidth:760 }}>{intro}</p>
        </div>
      </div>

      <div className="container" style={{ padding:'32px 20px' }}>
        <p style={{ fontSize:14, color:'#666', margin:'0 0 20px' }}>
          {teachers.length > 0
            ? `${teachers.length} ${r.kind === 'subject' ? r.label + ' ' : ''}teacher${teachers.length !== 1 ? 's' : ''} ${r.kind === 'city' ? 'in ' + r.city : 'available'}`
            : ''}
        </p>

        {teachers.length === 0 ? (
          <div style={{ background:'#fff', borderRadius:12, padding:48, textAlign:'center', border:'1.5px solid #e8e8e8', marginBottom:32 }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🔍</div>
            <h2 style={{ color:'#0F6E56', margin:'0 0 8px', fontSize:20 }}>No listings here yet</h2>
            <p style={{ color:'#666', margin:'0 0 20px', lineHeight:1.6 }}>
              We’re growing fast. {r.kind === 'city' ? `Be the first teacher listed in ${r.city}, or` : 'Try browsing all teachers, or'} search across South Africa.
            </p>
            <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              <Link href="/find-a-teacher" className="btn-teal">Browse All Teachers</Link>
              <Link href="/register/teacher" className="btn-outline">Register as a Teacher</Link>
            </div>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:20, marginBottom:40 }}>
            {teachers.map(t => <TeacherCard key={t.id} teacher={t} />)}
          </div>
        )}

        {/* Internal links for SEO */}
        <section style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e8e8e8', padding:'24px 28px', marginBottom:20 }}>
          <h2 style={{ color:'#0F6E56', fontSize:18, fontWeight:700, margin:'0 0 14px' }}>Browse Islamic teachers by city</h2>
          <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
            {otherCities.map(c => (
              <Link key={c} href={`/${CITY_PREFIX}${slugify(c)}`}
                style={{ padding:'8px 16px', borderRadius:40, border:'1.5px solid #5DCAA5', background:'#fff', color:'#0F6E56', fontWeight:600, fontSize:14, textDecoration:'none' }}>
                📍 {c}
              </Link>
            ))}
          </div>
        </section>

        <section style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e8e8e8', padding:'24px 28px' }}>
          <h2 style={{ color:'#0F6E56', fontSize:18, fontWeight:700, margin:'0 0 14px' }}>Browse by subject</h2>
          <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
            {otherSubjects.map(s => (
              <Link key={s.value} href={`/${s.slug}`}
                style={{ padding:'8px 16px', borderRadius:40, border:'1.5px solid #5DCAA5', background:'#fff', color:'#0F6E56', fontWeight:600, fontSize:14, textDecoration:'none' }}>
                {s.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
