'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Teacher } from '@/lib/types'
import { SUBJECTS } from '@/lib/types'

type AdminTab = 'pending' | 'teachers' | 'enquiries'

export default function AdminPanel() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authed, setAuthed] = useState(false)
  const [tab, setTab] = useState<AdminTab>('pending')
  const [pending, setPending] = useState<Teacher[]>([])
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([])
  const [rejecting, setRejecting] = useState<string|null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [actionMsg, setActionMsg] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session || session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        router.push('/login'); return
      }
      setAuthed(true)
      await loadData()
      setLoading(false)
    })
  }, [router])

  async function loadData() {
    const { data: p } = await supabase.from('teachers').select('*').eq('listing_status','pending').order('created_at', { ascending: true })
    setPending((p || []) as Teacher[])
    const { data: a } = await supabase.from('teachers').select('*').order('created_at', { ascending: false }).limit(100)
    setAllTeachers((a || []) as Teacher[])
  }

  async function approve(id: string, type='teacher') {
    await fetch('/api/admin/approve', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id, type }) })
    setActionMsg('✅ Listing approved and teacher notified.')
    await loadData()
    setTimeout(() => setActionMsg(''), 3000)
  }

  async function reject(id: string, type='teacher') {
    if (!rejectReason) { alert('Please enter a reason.'); return }
    await fetch('/api/admin/reject', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id, type, reason: rejectReason }) })
    setRejecting(null); setRejectReason('')
    setActionMsg('❌ Listing rejected and teacher notified.')
    await loadData()
    setTimeout(() => setActionMsg(''), 3000)
  }

  async function toggleStatus(t: Teacher) {
    const newStatus = t.listing_status === 'active' ? 'inactive' : 'active'
    await supabase.from('teachers').update({ listing_status: newStatus }).eq('id', t.id)
    await loadData()
  }

  if (loading) return <div style={{ textAlign:'center', padding:80, color:'#0F6E56' }}>Loading admin panel…</div>
  if (!authed) return null

  const filtered = allTeachers.filter(t =>
    !searchTerm || t.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || t.city.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={{ background:'#f9f9f9', minHeight:'100vh' }}>
      {/* Header */}
      <div style={{ background:'#0F6E56', padding:'20px 0' }}>
        <div className="container" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 style={{ color:'#fff', fontSize:20, fontWeight:700, margin:'0 0 4px' }}>Admin Panel</h1>
            <p style={{ color:'#E1F5EE', fontSize:13, margin:0 }}>IslamicTeachers.co.za</p>
          </div>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            {[
              { label:`⏳ Pending (${pending.length})`, t:'pending' as AdminTab },
              { label:`📋 All Teachers (${allTeachers.length})`, t:'teachers' as AdminTab },
              { label:'📩 Enquiries', t:'enquiries' as AdminTab },
            ].map(b=>(
              <button key={b.t} onClick={()=>setTab(b.t)}
                style={{ padding:'8px 16px', borderRadius:6, border:'none', cursor:'pointer', fontSize:13, fontWeight:600,
                  background: tab===b.t?'#BA7517':'rgba(255,255,255,0.15)',
                  color:'#fff' }}>
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding:'28px 20px' }}>
        {actionMsg && <div style={{ background:'#E1F5EE', color:'#0F6E56', padding:'12px 16px', borderRadius:8, marginBottom:20, fontWeight:600 }}>{actionMsg}</div>}

        {/* Stats row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:16, marginBottom:28 }}>
          {[
            { label:'Pending Review', value:pending.length, color:'#BA7517' },
            { label:'Active Teachers', value:allTeachers.filter(t=>t.listing_status==='active').length, color:'#0F6E56' },
            { label:'Premium Listings', value:allTeachers.filter(t=>t.listing_tier==='premium').length, color:'#BA7517' },
            { label:'Total Teachers', value:allTeachers.length, color:'#555' },
          ].map(s=>(
            <div key={s.label} style={{ background:'#fff', borderRadius:10, padding:'16px 20px', border:'1.5px solid #e8e8e8', textAlign:'center' }}>
              <p style={{ fontSize:28, fontWeight:700, color:s.color, margin:'0 0 4px' }}>{s.value}</p>
              <p style={{ fontSize:13, color:'#888', margin:0 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* PENDING */}
        {tab === 'pending' && (
          pending.length === 0 ? (
            <div style={{ background:'#fff', borderRadius:12, padding:48, textAlign:'center', border:'1.5px solid #e8e8e8' }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🎉</div>
              <p style={{ color:'#0F6E56', fontWeight:700, fontSize:18 }}>All caught up!</p>
              <p style={{ color:'#888' }}>No pending listings to review.</p>
            </div>
          ) : pending.map(t => (
            <div key={t.id} style={{ background:'#fff', borderRadius:12, padding:24, marginBottom:16, border:'1.5px solid #e8e8e8' }}>
              <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
                <div style={{ flex:1 }}>
                  <h3 style={{ color:'#0F6E56', fontWeight:700, margin:'0 0 6px' }}>{t.full_name}</h3>
                  <p style={{ fontSize:14, color:'#555', margin:'0 0 4px' }}>📍 {t.city}, {t.province} | {t.gender} | {t.listing_tier} plan</p>
                  <p style={{ fontSize:14, color:'#555', margin:'0 0 4px' }}>📧 {t.email} | 💬 {t.whatsapp}</p>
                  <p style={{ fontSize:14, color:'#555', margin:'0 0 8px' }}>
                    Subjects: {t.subjects.map(s=>SUBJECTS.find(x=>x.value===s)?.label).filter(Boolean).join(', ')}
                    {' | '}{t.years_experience} yrs exp
                    {' | '}Session: {t.session_type}
                  </p>
                  {t.bio && <p style={{ fontSize:13, color:'#777', margin:'0 0 8px', lineHeight:1.6, background:'#f9f9f9', padding:'10px 14px', borderRadius:6 }}>{t.bio.slice(0,300)}{t.bio.length>300?'…':''}</p>}
                  {/* References */}
                  {(t.references_data as any[])?.length > 0 && (
                    <div style={{ background:'#E1F5EE', borderRadius:8, padding:'10px 14px', marginTop:8 }}>
                      <p style={{ fontSize:12, fontWeight:700, color:'#0F6E56', margin:'0 0 6px' }}>REFERENCES</p>
                      {(t.references_data as any[]).map((r,i) => (
                        <p key={i} style={{ fontSize:13, margin:'0 0 4px', color:'#555' }}>
                          {r.name} ({r.relationship}) — {r.phone}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:10, minWidth:140 }}>
                  <button onClick={()=>approve(t.id)} className="btn-teal">✓ Approve</button>
                  <button onClick={()=>setRejecting(t.id)}
                    style={{ padding:'10px 20px', borderRadius:6, border:'1.5px solid #c00', background:'#fff', color:'#c00', cursor:'pointer', fontWeight:600, fontSize:14 }}>
                    ✕ Reject
                  </button>
                  {rejecting === t.id && (
                    <div style={{ marginTop:8 }}>
                      <textarea className="form-input" rows={2} placeholder="Reason for rejection" value={rejectReason} onChange={e=>setRejectReason(e.target.value)} style={{ resize:'none', fontSize:13 }} />
                      <button onClick={()=>reject(t.id)} style={{ marginTop:6, width:'100%', padding:'8px', borderRadius:6, background:'#c00', color:'#fff', border:'none', cursor:'pointer', fontSize:13, fontWeight:600 }}>Confirm Reject</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* ALL TEACHERS */}
        {tab === 'teachers' && (
          <div>
            <input className="form-input" style={{ maxWidth:360, marginBottom:20 }} placeholder="Search by name or city…" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
            <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e8e8e8', overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
                <thead>
                  <tr style={{ background:'#E1F5EE' }}>
                    {['Name','City','Tier','Status','Views','Enquiries','Actions'].map(h=>(
                      <th key={h} style={{ padding:'12px 16px', textAlign:'left', color:'#0F6E56', fontWeight:700, fontSize:12, textTransform:'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t,i) => (
                    <tr key={t.id} style={{ borderTop:'1px solid #f0f0f0', background:i%2===0?'#fff':'#fafafa' }}>
                      <td style={{ padding:'12px 16px' }}>
                        <p style={{ margin:0, fontWeight:600 }}>{t.full_name}</p>
                        <p style={{ margin:0, fontSize:12, color:'#888' }}>{t.email}</p>
                      </td>
                      <td style={{ padding:'12px 16px', color:'#555' }}>{t.city}, {t.province}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <span style={{ padding:'3px 8px', borderRadius:10, fontSize:11, fontWeight:700,
                          background:t.listing_tier==='premium'?'#fff7e6':t.listing_tier==='standard'?'#E1F5EE':'#f0f0f0',
                          color:t.listing_tier==='premium'?'#BA7517':t.listing_tier==='standard'?'#0F6E56':'#888' }}>
                          {t.listing_tier}
                        </span>
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        <span style={{ padding:'3px 8px', borderRadius:10, fontSize:11, fontWeight:700,
                          background:t.listing_status==='active'?'#E1F5EE':t.listing_status==='pending'?'#fff7e6':'#fee',
                          color:t.listing_status==='active'?'#0F6E56':t.listing_status==='pending'?'#BA7517':'#c00' }}>
                          {t.listing_status}
                        </span>
                      </td>
                      <td style={{ padding:'12px 16px', color:'#555', textAlign:'center' }}>{t.profile_views || 0}</td>
                      <td style={{ padding:'12px 16px', color:'#555', textAlign:'center' }}>{t.enquiry_count || 0}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <div style={{ display:'flex', gap:6 }}>
                          <button onClick={()=>toggleStatus(t)}
                            style={{ padding:'5px 10px', borderRadius:5, border:'1px solid #e8e8e8', background:'#fff', cursor:'pointer', fontSize:12, color:'#555' }}>
                            {t.listing_status==='active'?'Deactivate':'Activate'}
                          </button>
                          <a href={`/teachers/${t.slug||t.id}`} target="_blank"
                            style={{ padding:'5px 10px', borderRadius:5, border:'1px solid #5DCAA5', background:'#E1F5EE', color:'#0F6E56', fontSize:12, textDecoration:'none', display:'inline-block' }}>
                            View
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <p style={{ textAlign:'center', padding:32, color:'#888' }}>No teachers found.</p>}
            </div>
          </div>
        )}

        {/* ENQUIRIES */}
        {tab === 'enquiries' && (
          <div style={{ background:'#fff', borderRadius:12, padding:28, border:'1.5px solid #e8e8e8', textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>📩</div>
            <p style={{ color:'#0F6E56', fontWeight:700, fontSize:18, marginBottom:8 }}>Enquiry Log</p>
            <p style={{ color:'#888', fontSize:14 }}>Enquiries are emailed directly to each teacher. You can view all enquiries directly in your Supabase dashboard under the <strong>enquiries</strong> table.</p>
          </div>
        )}
      </div>
    </div>
  )
}
