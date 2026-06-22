import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase'
import PremiumCarousel from '@/components/PremiumCarousel'
import { SUBJECTS, CITIES } from '@/lib/types'
import type { Teacher } from '@/lib/types'

async function getFeaturedTeachers(): Promise<Teacher[]> {
  try {
    const db = createServiceClient()
    const { data } = await db.from('teachers').select('*').eq('listing_status','active').eq('listing_tier','premium').limit(12)
    return (data ?? []) as Teacher[]
  } catch { return [] }
}

const subjectIcons: Record<string,string> = {
  quran_recitation:'📖', tajweed:'🔤', hifz:'🌙', islamic_studies:'🕌',
  arabic_language:'✍️', seerah:'📚', fiqh:'⚖️', other:'📝',
}

export default async function HomePage() {
  const featured = await getFeaturedTeachers()

  return (
    <>
      {/* HERO */}
      <section className="section-mint" style={{ padding:'80px 0' }}>
        <div className="container" style={{ textAlign:'center' }}>
          <h1 style={{ fontSize:'clamp(28px,5vw,48px)',fontWeight:700,color:'#0F6E56',margin:'0 0 16px',lineHeight:1.2 }}>
            Find a Trusted Islamic Teacher Near You
          </h1>
          <p style={{ fontSize:'clamp(15px,2vw,20px)',color:'#2C2C2A',margin:'0 auto 40px',maxWidth:580,opacity:.85 }}>
            Search hundreds of verified Islamic teachers and institutions across South Africa. Free for students and parents.
          </p>

          {/* Search bar */}
          <form action="/find-a-teacher" method="GET"
            style={{ display:'flex',flexWrap:'wrap',gap:12,justifyContent:'center',maxWidth:680,margin:'0 auto' }}>
            <select name="subject" className="form-input" style={{ flex:'1 1 200px',maxWidth:260 }}>
              <option value="">All Subjects</option>
              {SUBJECTS.filter(s=>s.value!=='other').map(s=>(
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <input name="city" className="form-input" placeholder="City or Province" style={{ flex:'1 1 200px',maxWidth:260 }} />
            <button type="submit" className="btn-gold">🔍 Search</button>
          </form>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding:'72px 0',background:'#fff' }}>
        <div className="container">
          <h2 style={{ textAlign:'center',color:'#0F6E56',fontSize:28,fontWeight:700,marginBottom:48 }}>How It Works</h2>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:32 }}>
            {[
              { icon:'🔍', title:'Search', text:'Browse and filter hundreds of verified Islamic teachers by subject, city, and teaching style.' },
              { icon:'📲', title:'Connect', text:'Click the contact button to get the teacher\'s WhatsApp and email directly.' },
              { icon:'📖', title:'Learn', text:'Arrange your first lesson and begin your Islamic education journey.' },
            ].map(s=>(
              <div key={s.title} style={{ textAlign:'center',padding:'32px 24px',borderRadius:10,background:'#E1F5EE' }}>
                <div style={{ fontSize:40,marginBottom:16 }}>{s.icon}</div>
                <h3 style={{ color:'#0F6E56',fontWeight:700,marginBottom:8 }}>{s.title}</h3>
                <p style={{ color:'#2C2C2A',fontSize:15,margin:0,lineHeight:1.7 }}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PREMIUM CAROUSEL */}
      {featured.length > 0 && (
        <section className="section-mint" style={{ padding:'72px 0' }}>
          <div className="container">
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:40 }}>
              <div>
                <h2 style={{ color:'#0F6E56',fontSize:28,fontWeight:700,margin:'0 0 4px' }}>⭐ Featured Teachers</h2>
                <p style={{ color:'#888',fontSize:14,margin:0 }}>Our top-rated Premium members</p>
              </div>
              <Link href="/find-a-teacher?tier=premium" style={{ color:'#BA7517',fontWeight:600,textDecoration:'none',fontSize:15 }}>View all →</Link>
            </div>
            <PremiumCarousel teachers={featured} />
          </div>
        </section>
      )}

      {/* SUBJECTS */}
      <section style={{ padding:'72px 0',background:'#fff' }}>
        <div className="container">
          <h2 style={{ textAlign:'center',color:'#0F6E56',fontSize:28,fontWeight:700,marginBottom:48 }}>Browse by Subject</h2>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:16 }}>
            {SUBJECTS.filter(s=>s.value!=='other'&&s.slug).map(s=>(
              <Link key={s.value} href={`/${s.slug}`} className="subject-card">
                <span style={{ fontSize:32,marginBottom:8 }}>{subjectIcons[s.value]}</span>
                <span style={{ fontSize:13,fontWeight:600,textAlign:'center',color:'#0F6E56' }}>{s.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CITIES */}
      <section className="section-mint" style={{ padding:'72px 0' }}>
        <div className="container">
          <h2 style={{ textAlign:'center',color:'#0F6E56',fontSize:28,fontWeight:700,marginBottom:40 }}>Find Teachers by City</h2>
          <div style={{ display:'flex',flexWrap:'wrap',gap:12,justifyContent:'center' }}>
            {CITIES.map(c=>(
              <Link key={c} href={`/islamic-teachers-${c.toLowerCase().replace(/\s+/g,'-')}`}
                style={{ padding:'10px 20px',borderRadius:40,border:'1.5px solid #5DCAA5',background:'#fff',color:'#0F6E56',fontWeight:600,fontSize:14,textDecoration:'none',transition:'all .15s' }}>
                📍 {c}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section style={{ padding:'72px 0',background:'#fff' }}>
        <div className="container">
          <h2 style={{ textAlign:'center',color:'#0F6E56',fontSize:28,fontWeight:700,marginBottom:48 }}>Why IslamicTeachers.co.za?</h2>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:40 }}>
            <div>
              <h3 style={{ color:'#BA7517',fontWeight:700,marginBottom:20 }}>For Students & Parents</h3>
              {[
                'Completely free to search — no registration needed',
                'All teachers manually reviewed before listing goes live',
                'Filter by subject, city, gender, session type, and more',
                'Child safety is our highest priority — see our Child Safety Policy',
              ].map(t=>(
                <div key={t} style={{ display:'flex',gap:12,marginBottom:14,alignItems:'flex-start' }}>
                  <span style={{ color:'#0F6E56',fontWeight:700,fontSize:18,lineHeight:1.4 }}>✓</span>
                  <p style={{ margin:0,fontSize:15,color:'#2C2C2A',lineHeight:1.6 }}>{t}</p>
                </div>
              ))}
            </div>
            <div>
              <h3 style={{ color:'#BA7517',fontWeight:700,marginBottom:20 }}>For Teachers & Institutions</h3>
              {[
                'Reach hundreds of students and parents across South Africa',
                'Affordable monthly plans starting from R0 (free tier)',
                'Easy-to-use dashboard to manage your profile',
                'Premium listings appear at the top of every search result',
              ].map(t=>(
                <div key={t} style={{ display:'flex',gap:12,marginBottom:14,alignItems:'flex-start' }}>
                  <span style={{ color:'#0F6E56',fontWeight:700,fontSize:18,lineHeight:1.4 }}>✓</span>
                  <p style={{ margin:0,fontSize:15,color:'#2C2C2A',lineHeight:1.6 }}>{t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:'72px 0',background:'#0F6E56',textAlign:'center' }}>
        <div className="container">
          <h2 style={{ color:'#fff',fontSize:28,fontWeight:700,marginBottom:16 }}>Ready to get started?</h2>
          <p style={{ color:'#E1F5EE',fontSize:17,marginBottom:36 }}>Searching is always free. Register your listing today.</p>
          <div style={{ display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap' }}>
            <Link href="/find-a-teacher" className="btn-gold">Find a Teacher</Link>
            <Link href="/register/teacher" className="btn-outline" style={{ color:'#fff',borderColor:'#fff' }}>Register as a Teacher</Link>
          </div>
        </div>
      </section>
    </>
  )
}
