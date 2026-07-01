import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceClient, slugify } from '@/lib/supabase'
import { SUBJECTS, CITIES } from '@/lib/types'
import type { Teacher } from '@/lib/types'
import TeacherCard from '@/components/TeacherCard'

// This route is a catch-all for the SEO landing pages linked from the homepage:
//   /islamic-teachers-{city}   e.g. /islamic-teachers-cape-town
//   /{subject-slug}            e.g. /quran-teachers
// Next.js always matches static folders (about, blog, find-a-teacher, etc.) first,
// so this dynamic segment only ever receives requests that don't match a real page.
// Always render fresh so newly-approved teacher listings show up immediately.
export const dynamic = 'force-dynamic'

const CITY_PREFIX = 'islamic-teachers-'

const subjectIcons: Record<string, string> = {
  quran_recitation: '📖', tajweed: '🔤', hifz: '🌙', islamic_studies: '🕌',
  arabic_language: '✍️', seerah: '📚', fiqh: '⚖️', other: '📝',
}

type PageInfo =
  | { type: 'city'; city: string }
  | { type: 'subject'; subject: (typeof SUBJECTS)[number] }
  | null

function resolveSlug(slug: string): PageInfo {
  if (slug.startsWith(CITY_PREFIX)) {
    const citySlug = slug.slice(CITY_PREFIX.length)
    const city = CITIES.find(c => slugify(c) === citySlug)
    return city ? { type: 'city', city } : null
  }
  const subject = SUBJECTS.find(s => s.slug && s.slug === slug)
  return subject ? { type: 'subject', subject } : null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const info = resolveSlug(slug)
  if (!info) return { title: 'Page Not Found | IslamicTeachers.co.za' }

  const url = `https://islamicteachers.co.za/${slug}`

  if (info.type === 'city') {
    const title = `Islamic Teachers in ${info.city} | Quran, Tajweed, Hifz & Arabic | IslamicTeachers.co.za`
    const description = `Find verified Quran, Tajweed, Hifz, Arabic and Islamic Studies teachers in ${info.city}. Compare in-person and online tutors and connect for free.`
    return {
      title, description,
      alternates: { canonical: url },
      openGraph: { title: `Islamic Teachers in ${info.city}`, description, url },
    }
  }

  const title = `${info.subject.label} Teachers in South Africa | IslamicTeachers.co.za`
  const description = `Find verified ${info.subject.label} teachers across South Africa. Compare in-person and online tutors by city and connect for free.`
  return {
    title, description,
    alternates: { canonical: url },
    openGraph: { title: `${info.subject.label} Teachers`, description, url },
  }
}

export default async function SeoLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const info = resolveSlug(slug)
  if (!info) notFound()

  const db = createServiceClient()
  let query = db.from('teachers').select('*').eq('listing_status', 'active')
    .order('listing_tier', { ascending: false })
    .order('created_at', { ascending: false })

  query = info.type === 'city'
    ? query.ilike('city', `%${info.city}%`)
    : query.contains('subjects', [info.subject.value])

  const { data } = await query
  const teachers = (data ?? []) as Teacher[]

  const heading = info.type === 'city' ? `Islamic Teachers in ${info.city}` : `${info.subject.label} Teachers`
  const intro = info.type === 'city'
    ? `Browse verified Quran, Tajweed, Hifz, Arabic and Islamic Studies teachers based in ${info.city}. All listings are manually reviewed before going live — search is completely free for students and parents.`
    : `Browse verified ${info.subject.label} teachers from across South Africa. All listings are manually reviewed before going live — search is completely free for students and parents.`

  return (
    <div style={{ background: '#f9f9f9', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: '#0F6E56', padding: '40px 0' }}>
        <div className="container">
          <div style={{ fontSize: 13, color: '#B7E3D3', marginBottom: 12 }}>
            <Link href="/" style={{ color: '#5DCAA5', textDecoration: 'none' }}>Home</Link>
            {' › '}
            <span>{heading}</span>
          </div>
          <h1 style={{ color: '#fff', fontSize: 'clamp(22px,3.5vw,32px)', fontWeight: 700, margin: '0 0 10px' }}>
            {info.type === 'city' ? `📍 ${heading}` : `${subjectIcons[info.subject.value]} ${heading}`}
          </h1>
          <p style={{ color: '#E1F5EE', fontSize: 15, maxWidth: 640, margin: 0, lineHeight: 1.7 }}>{intro}</p>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 20px' }}>
        {/* Results */}
        {teachers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 10, border: '1.5px solid #e8e8e8', marginBottom: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3 style={{ color: '#0F6E56', marginBottom: 8 }}>No teachers listed here yet</h3>
            <p style={{ color: '#666', marginBottom: 20 }}>Check back soon, or browse all teachers.</p>
            <Link href="/find-a-teacher" className="btn-teal">Browse All Teachers</Link>
          </div>
        ) : (
          <>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: '#666' }}>
              {teachers.length} teacher{teachers.length !== 1 ? 's' : ''} found
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20, marginBottom: 48 }}>
              {teachers.map(t => <TeacherCard key={t.id} teacher={t} />)}
            </div>
          </>
        )}

        {/* Refine further */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Link
            href={info.type === 'city' ? `/find-a-teacher?city=${encodeURIComponent(info.city)}` : `/find-a-teacher?subject=${info.subject.value}`}
            className="btn-outline"
          >
            Refine your search with more filters →
          </Link>
        </div>

        {/* Internal cross-links */}
        {info.type === 'city' ? (
          <div>
            <h2 style={{ textAlign: 'center', color: '#0F6E56', fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Browse Teachers in Other Cities</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
              {CITIES.filter(c => c !== info.city).map(c => (
                <Link key={c} href={`/${CITY_PREFIX}${slugify(c)}`}
                  style={{ padding: '8px 18px', borderRadius: 40, border: '1.5px solid #5DCAA5', background: '#fff', color: '#0F6E56', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
                  📍 {c}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <h2 style={{ textAlign: 'center', color: '#0F6E56', fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Browse Other Subjects</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
              {SUBJECTS.filter(s => s.slug && s.value !== info.subject.value).map(s => (
                <Link key={s.value} href={`/${s.slug}`}
                  style={{ padding: '8px 18px', borderRadius: 40, border: '1.5px solid #5DCAA5', background: '#fff', color: '#0F6E56', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
                  {subjectIcons[s.value]} {s.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
