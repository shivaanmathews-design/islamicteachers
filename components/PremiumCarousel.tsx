'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { Teacher } from '@/lib/types'

function initials(name: string) {
  return name.split(' ').slice(0,2).map(n=>n[0]?.toUpperCase()||'').join('')
}

const RATE_LABELS: Record<string,string> = {
  'under-r100':'< R100/hr','r100-r150':'R100–R150/hr','r150-r200':'R150–R200/hr',
  'r200-r300':'R200–R300/hr','r300-plus':'R300+/hr',
}

export default function PremiumCarousel({ teachers }: { teachers: Teacher[] }) {
  const [idx, setIdx] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null)

  const VISIBLE = Math.min(teachers.length, 3)
  const total = teachers.length

  function startTimer() {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setIdx(i => (i + 1) % total)
    }, 4000)
  }

  useEffect(() => {
    if (total > VISIBLE) startTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [total])

  if (total === 0) return null

  function go(dir: 1|-1) {
    setIdx(i => (i + dir + total) % total)
    startTimer()
  }

  // Get currently visible slice (wrapping)
  const visible = Array.from({ length: VISIBLE }, (_, i) => teachers[(idx + i) % total])

  return (
    <div style={{ position:'relative' }}>
      {/* Cards */}
      <div style={{ display:'grid', gridTemplateColumns:`repeat(${VISIBLE},1fr)`, gap:20, overflowX:'hidden' }}>
        {visible.map((t, i) => (
          <div key={`${t.id}-${i}`} className="card" style={{ padding:28, textAlign:'center', position:'relative' }}>
            {/* Featured badge */}
            <div style={{ position:'absolute', top:14, right:14 }}>
              <span className="badge badge-premium">⭐ Premium</span>
            </div>

            {/* Avatar */}
            {t.profile_photo_url ? (
              <img src={t.profile_photo_url} alt={t.full_name}
                style={{ width:80, height:80, borderRadius:'50%', objectFit:'cover', margin:'0 auto 12px', display:'block', border:'3px solid #BA7517' }} />
            ) : (
              <div style={{ width:80, height:80, borderRadius:'50%', background:'#0F6E56', color:'#fff', fontSize:28, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', border:'3px solid #BA7517' }}>
                {initials(t.full_name)}
              </div>
            )}

            <h3 style={{ color:'#0F6E56', fontWeight:700, fontSize:17, margin:'0 0 4px' }}>{t.full_name}</h3>
            <p style={{ color:'#BA7517', fontSize:13, fontWeight:600, margin:'0 0 12px' }}>
              📍 {t.city}{t.suburb ? `, ${t.suburb}` : ''}
            </p>

            {/* Subjects */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, justifyContent:'center', marginBottom:12 }}>
              {(t.subjects||[]).slice(0,3).map(s => (
                <span key={s} className="tag" style={{ fontSize:11 }}>
                  {s.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}
                </span>
              ))}
            </div>

            <p style={{ fontSize:13, color:'#888', margin:'0 0 4px' }}>{t.years_experience} yrs experience</p>
            {t.hourly_rate && <p style={{ fontSize:13, color:'#0F6E56', fontWeight:600, margin:'0 0 16px' }}>{RATE_LABELS[t.hourly_rate]}</p>}

            <Link href={`/teachers/${t.slug || t.id}`} className="btn-teal"
              style={{ width:'100%', fontSize:14, padding:'10px 16px' }}>
              View Profile
            </Link>
          </div>
        ))}
      </div>

      {/* Controls */}
      {total > VISIBLE && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, marginTop:24 }}>
          <button onClick={()=>go(-1)} style={{ background:'none', border:'1.5px solid #0F6E56', color:'#0F6E56', width:36, height:36, borderRadius:'50%', cursor:'pointer', fontSize:16, fontWeight:700 }}>‹</button>
          <div style={{ display:'flex', gap:6 }}>
            {Array.from({ length: total }, (_,i) => (
              <button key={i} onClick={()=>{ setIdx(i); startTimer() }}
                style={{ width: i===idx?20:8, height:8, borderRadius:4, background:i===idx?'#BA7517':'#d0d0d0', border:'none', cursor:'pointer', transition:'all .2s', padding:0 }} />
            ))}
          </div>
          <button onClick={()=>go(1)} style={{ background:'none', border:'1.5px solid #0F6E56', color:'#0F6E56', width:36, height:36, borderRadius:'50%', cursor:'pointer', fontSize:16, fontWeight:700 }}>›</button>
        </div>
      )}
    </div>
  )
}
