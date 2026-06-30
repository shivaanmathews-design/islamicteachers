import { createServiceClient } from '@/lib/supabase'
import type { Workshop } from '@/lib/types'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Workshops & Events | IslamicTeachers.co.za',
  description: 'Upcoming Quran, Tajweed, Arabic and Islamic studies workshops and events for South African families, students and teachers.',
}

export default async function WorkshopsPage() {
  const db = createServiceClient()
  const { data } = await db.from('workshops').select('*').eq('published', true).order('event_date', { ascending: true })
  const workshops = (data || []) as Workshop[]

  const now = new Date()
  const upcoming = workshops.filter(w => !w.event_date || new Date(w.event_date) >= now)
  const past = workshops.filter(w => w.event_date && new Date(w.event_date) < now)

  const Card = (w: Workshop) => {
    const isPast = !!w.event_date && new Date(w.event_date) < now
    return (
      <article key={w.id} style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e8e8e8', overflow:'hidden', display:'flex', flexDirection:'column', opacity:isPast?0.75:1 }}>
        {w.cover_image_url
          ? <img src={w.cover_image_url} alt={w.title} style={{ width:'100%', height:180, objectFit:'cover' }} />
          : <div style={{ width:'100%', height:180, background:'#E1F5EE', display:'flex', alignItems:'center', justifyContent:'center', fontSize:40 }}>🕌</div>}
        <div style={{ padding:'20px 22px', display:'flex', flexDirection:'column', flex:1 }}>
          <h2 style={{ color:'#0F6E56', fontSize:19, fontWeight:700, margin:'0 0 10px', lineHeight:1.4 }}>{w.title}</h2>
          <div style={{ display:'grid', gap:6, marginBottom:12, fontSize:14, color:'#555' }}>
            {w.event_date && <span>📅 {new Date(w.event_date).toLocaleDateString('en-ZA', { weekday:'short', day:'numeric', month:'long', year:'numeric' })}{new Date(w.event_date).getHours() ? `, ${new Date(w.event_date).toLocaleTimeString('en-ZA', { hour:'2-digit', minute:'2-digit' })}` : ''}</span>}
            {w.location && <span>📍 {w.location}</span>}
            {w.price && <span>💳 {w.price}</span>}
          </div>
          {w.description && <p style={{ color:'#555', fontSize:14, lineHeight:1.7, margin:'0 0 16px', whiteSpace:'pre-wrap', flex:1 }}>{w.description}</p>}
          {w.registration_url && !isPast && (
            <a href={w.registration_url} target="_blank" rel="noopener noreferrer" className="btn-gold" style={{ textAlign:'center', marginTop:'auto', textDecoration:'none' }}>
              Register / More Info →
            </a>
          )}
          {isPast && <span style={{ marginTop:'auto', fontSize:12, color:'#aaa', fontWeight:600 }}>This event has passed</span>}
        </div>
      </article>
    )
  }

  return (
    <div style={{ background:'#f9f9f9', minHeight:'100vh' }}>
      <div style={{ background:'#0F6E56', padding:'48px 0' }}>
        <div className="container" style={{ textAlign:'center' }}>
          <h1 style={{ color:'#fff', fontSize:32, fontWeight:700, margin:'0 0 8px' }}>Workshops &amp; Events</h1>
          <p style={{ color:'#E1F5EE', fontSize:16, margin:0 }}>Quran, Tajweed, Arabic and Islamic studies workshops across South Africa.</p>
        </div>
      </div>

      <div className="container" style={{ padding:'40px 20px' }}>
        {workshops.length === 0 ? (
          <div style={{ background:'#fff', borderRadius:12, padding:48, textAlign:'center', border:'1.5px solid #e8e8e8' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🗓️</div>
            <p style={{ color:'#0F6E56', fontWeight:700, fontSize:18, margin:'0 0 6px' }}>No workshops scheduled yet</p>
            <p style={{ color:'#888', margin:0 }}>Check back soon — new workshops and events will be listed here.</p>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <div style={{ marginBottom:40 }}>
                <h2 style={{ color:'#0F6E56', fontSize:20, fontWeight:700, margin:'0 0 20px' }}>Upcoming</h2>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:24 }}>
                  {upcoming.map(Card)}
                </div>
              </div>
            )}
            {past.length > 0 && (
              <div>
                <h2 style={{ color:'#888', fontSize:20, fontWeight:700, margin:'0 0 20px' }}>Past Events</h2>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:24 }}>
                  {past.map(Card)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
