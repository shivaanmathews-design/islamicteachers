import Link from 'next/link'
import type { Teacher } from '@/lib/types'
import { SUBJECTS, HOURLY_RATES } from '@/lib/types'

function tierLabel(tier: string) {
  if (tier === 'premium')  return <span className="badge badge-premium">⭐ Featured</span>
  if (tier === 'standard') return <span className="badge badge-standard">Standard</span>
  return null
}

function sessionLabel(s: string) {
  if (s === 'both')      return '🌐 Online & In-Person'
  if (s === 'online')    return '🌐 Online'
  return '📍 In-Person'
}

export default function TeacherCard({ teacher }: { teacher: Teacher }) {
  const subjectLabels = teacher.subjects
    .map(s => SUBJECTS.find(x => x.value === s)?.label)
    .filter(Boolean)
    .slice(0, 3)

  const rateLabel = HOURLY_RATES.find(r => r.value === teacher.hourly_rate)?.label

  const profileUrl = teacher.slug
    ? `/teachers/${teacher.slug}`
    : `/teachers/${teacher.id}`

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Photo */}
      <div style={{ position: 'relative', background: '#E1F5EE', height: 180, overflow: 'hidden' }}>
        {teacher.profile_photo_url
          ? <img src={teacher.profile_photo_url} alt={teacher.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#5DCAA5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#fff', fontWeight: 700 }}>
                {teacher.full_name.charAt(0)}
              </div>
            </div>
          )
        }
        {teacher.listing_tier !== 'free' && (
          <div style={{ position: 'absolute', top: 10, left: 10 }}>{tierLabel(teacher.listing_tier)}</div>
        )}
        {teacher.availability && (
          <div style={{ position: 'absolute', top: 10, right: 10 }}>
            <span className="badge badge-active" style={{ fontSize: 11 }}>
              <span className="dot-available" style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#0F6E56', marginRight: 5 }} />
              Taking Students
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: '#2C2C2A' }}>{teacher.full_name}</h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#666' }}>
            📍 {teacher.city}, {teacher.province}
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {subjectLabels.map(s => <span key={s} className="tag">{s}</span>)}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#555' }}>
          <span>{sessionLabel(teacher.session_type)}</span>
          <span style={{ color: '#0F6E56', fontWeight: 600 }}>{rateLabel}</span>
        </div>

        <p style={{ fontSize: 13, color: '#555', margin: 0 }}>
          {teacher.years_experience} year{teacher.years_experience !== 1 ? 's' : ''} experience
        </p>

        <Link href={profileUrl} className="btn-gold" style={{ marginTop: 'auto', textAlign: 'center', width: '100%' }}>
          View Profile
        </Link>
      </div>
    </div>
  )
}
