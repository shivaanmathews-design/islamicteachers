'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, slugify } from '@/lib/supabase'
import type { Teacher, BlogPost, Workshop } from '@/lib/types'
import { SUBJECTS } from '@/lib/types'

type AdminTab = 'pending' | 'teachers' | 'enquiries' | 'reviews' | 'banners' | 'blog' | 'workshops'

type Review = { id: string; teacher_id: string; reviewer_name: string; rating: number; comment: string; approved: boolean; created_at: string }
type Banner = { id: string; title: string; placement: string; click_url: string; click_count: number; active: boolean; start_date: string; end_date: string; advertiser_name: string; desktop_image_url: string }

const EMPTY_POST = { title:'', excerpt:'', content:'', cover_image_url:'', author:'IslamicTeachers.co.za', published:true }
const EMPTY_WORKSHOP = { title:'', description:'', cover_image_url:'', location:'', event_date:'', price:'', registration_url:'', published:true }

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
  const [reviews, setReviews] = useState<Review[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [newBanner, setNewBanner] = useState({ title:'', placement:'homepage_leaderboard', click_url:'', advertiser_name:'', desktop_image_url:'', start_date:'', end_date:'' })
  const [showBannerForm, setShowBannerForm] = useState(false)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [postForm, setPostForm] = useState<any>(EMPTY_POST)
  const [editingPostId, setEditingPostId] = useState<string|null>(null)
  const [showPostForm, setShowPostForm] = useState(false)
  const [workshopForm, setWorkshopForm] = useState<any>(EMPTY_WORKSHOP)
  const [editingWorkshopId, setEditingWorkshopId] = useState<string|null>(null)
  const [showWorkshopForm, setShowWorkshopForm] = useState(false)

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
    const { data: r } = await supabase.from('reviews').select('*').order('created_at', { ascending: false })
    setReviews((r || []) as Review[])
    const { data: b } = await supabase.from('banner_ads').select('*').order('created_at', { ascending: false })
    setBanners((b || []) as Banner[])
    const { data: bp } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
    setPosts((bp || []) as BlogPost[])
    const { data: ws } = await supabase.from('workshops').select('*').order('created_at', { ascending: false })
    setWorkshops((ws || []) as Workshop[])
  }

  // ---------- Blog posts ----------
  function editPost(p: BlogPost) {
    setEditingPostId(p.id)
    setPostForm({ title:p.title, excerpt:p.excerpt||'', content:p.content||'', cover_image_url:p.cover_image_url||'', author:p.author||'IslamicTeachers.co.za', published:p.published })
    setShowPostForm(true)
  }
  function resetPostForm() { setPostForm(EMPTY_POST); setEditingPostId(null); setShowPostForm(false) }
  async function savePost() {
    if (!postForm.title.trim()) { alert('Title is required.'); return }
    const payload = { ...postForm, slug: slugify(postForm.title) }
    let err
    if (editingPostId) ({ error: err } = await supabase.from('blog_posts').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editingPostId))
    else ({ error: err } = await supabase.from('blog_posts').insert(payload))
    if (err) { alert('Save failed: ' + err.message); return }
    setActionMsg(editingPostId ? '✅ Article updated.' : '✅ Article published.')
    resetPostForm(); await loadData(); setTimeout(() => setActionMsg(''), 3000)
  }
  async function togglePost(p: BlogPost) {
    await supabase.from('blog_posts').update({ published: !p.published }).eq('id', p.id); await loadData()
  }
  async function deletePost(id: string) {
    if (!confirm('Delete this article permanently?')) return
    await supabase.from('blog_posts').delete().eq('id', id); setActionMsg('🗑️ Article deleted.'); await loadData(); setTimeout(() => setActionMsg(''), 3000)
  }

  // ---------- Workshops ----------
  function editWorkshop(w: Workshop) {
    setEditingWorkshopId(w.id)
    setWorkshopForm({ title:w.title, description:w.description||'', cover_image_url:w.cover_image_url||'', location:w.location||'', event_date:w.event_date ? w.event_date.slice(0,16) : '', price:w.price||'', registration_url:w.registration_url||'', published:w.published })
    setShowWorkshopForm(true)
  }
  function resetWorkshopForm() { setWorkshopForm(EMPTY_WORKSHOP); setEditingWorkshopId(null); setShowWorkshopForm(false) }
  async function saveWorkshop() {
    if (!workshopForm.title.trim()) { alert('Title is required.'); return }
    const payload = { ...workshopForm, slug: slugify(workshopForm.title), event_date: workshopForm.event_date || null }
    let err
    if (editingWorkshopId) ({ error: err } = await supabase.from('workshops').update(payload).eq('id', editingWorkshopId))
    else ({ error: err } = await supabase.from('workshops').insert(payload))
    if (err) { alert('Save failed: ' + err.message); return }
    setActionMsg(editingWorkshopId ? '✅ Workshop updated.' : '✅ Workshop published.')
    resetWorkshopForm(); await loadData(); setTimeout(() => setActionMsg(''), 3000)
  }
  async function toggleWorkshop(w: Workshop) {
    await supabase.from('workshops').update({ published: !w.published }).eq('id', w.id); await loadData()
  }
  async function deleteWorkshop(id: string) {
    if (!confirm('Delete this workshop permanently?')) return
    await supabase.from('workshops').delete().eq('id', id); setActionMsg('🗑️ Workshop deleted.'); await loadData(); setTimeout(() => setActionMsg(''), 3000)
  }

  async function approveReview(id: string) {
    await supabase.from('reviews').update({ approved: true }).eq('id', id)
    setActionMsg('✅ Review approved.'); await loadData(); setTimeout(() => setActionMsg(''), 3000)
  }

  async function deleteReview(id: string) {
    await supabase.from('reviews').delete().eq('id', id)
    setActionMsg('🗑️ Review deleted.'); await loadData(); setTimeout(() => setActionMsg(''), 3000)
  }

  async function toggleBanner(id: string, current: boolean) {
    await supabase.from('banner_ads').update({ active: !current }).eq('id', id)
    await loadData()
  }

  async function deleteBanner(id: string) {
    await supabase.from('banner_ads').delete().eq('id', id)
    await loadData()
  }

  async function createBanner() {
    if (!newBanner.title || !newBanner.click_url) { alert('Title and URL are required.'); return }
    await supabase.from('banner_ads').insert({ ...newBanner, active: false, click_count: 0 })
    setNewBanner({ title:'', placement:'homepage_leaderboard', click_url:'', advertiser_name:'', desktop_image_url:'', start_date:'', end_date:'' })
    setShowBannerForm(false); await loadData()
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
            <a href="/" style={{ display:'inline-block', color:'#fff', fontSize:20, fontWeight:700, margin:'0 0 4px', textDecoration:'none' }}>Admin Panel</a>
            <p style={{ margin:0 }}>
              <a href="/" style={{ color:'#E1F5EE', fontSize:13, textDecoration:'none' }}>← IslamicTeachers.co.za — View Site</a>
            </p>
          </div>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            {[
              { label:`⏳ Pending (${pending.length})`, t:'pending' as AdminTab },
              { label:`📋 All Teachers (${allTeachers.length})`, t:'teachers' as AdminTab },
              { label:'📩 Enquiries', t:'enquiries' as AdminTab },
              { label:`⭐ Reviews (${reviews.filter(r=>!r.approved).length} pending)`, t:'reviews' as AdminTab },
              { label:`📢 Banners (${banners.length})`, t:'banners' as AdminTab },
              { label:`✍️ Blog (${posts.length})`, t:'blog' as AdminTab },
              { label:`🗓️ Workshops (${workshops.length})`, t:'workshops' as AdminTab },
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

        {/* REVIEWS */}
        {tab === 'reviews' && (
          <div>
            <div style={{ display:'flex', gap:16, marginBottom:20 }}>
              <div style={{ background:'#fff7e6', border:'1.5px solid #f0c060', borderRadius:10, padding:'14px 20px', flex:1, textAlign:'center' }}>
                <p style={{ fontSize:24, fontWeight:700, color:'#BA7517', margin:'0 0 4px' }}>{reviews.filter(r=>!r.approved).length}</p>
                <p style={{ fontSize:13, color:'#888', margin:0 }}>Pending Approval</p>
              </div>
              <div style={{ background:'#E1F5EE', border:'1.5px solid #5DCAA5', borderRadius:10, padding:'14px 20px', flex:1, textAlign:'center' }}>
                <p style={{ fontSize:24, fontWeight:700, color:'#0F6E56', margin:'0 0 4px' }}>{reviews.filter(r=>r.approved).length}</p>
                <p style={{ fontSize:13, color:'#888', margin:0 }}>Approved</p>
              </div>
            </div>

            {reviews.length === 0 ? (
              <div style={{ background:'#fff', borderRadius:12, padding:48, textAlign:'center', border:'1.5px solid #e8e8e8' }}>
                <p style={{ color:'#888' }}>No reviews submitted yet.</p>
              </div>
            ) : reviews.map(r => (
              <div key={r.id} style={{ background:'#fff', borderRadius:12, padding:20, marginBottom:12, border:`1.5px solid ${r.approved ? '#5DCAA5' : '#f0c060'}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                      <span style={{ fontWeight:700, color:'#2C2C2A' }}>{r.reviewer_name}</span>
                      <span style={{ color:'#BA7517', fontSize:16 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span>
                      <span style={{ fontSize:11, padding:'2px 8px', borderRadius:10, fontWeight:700,
                        background: r.approved ? '#E1F5EE' : '#fff7e6',
                        color: r.approved ? '#0F6E56' : '#BA7517' }}>
                        {r.approved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                    <p style={{ fontSize:14, color:'#555', margin:'0 0 4px', lineHeight:1.6 }}>{r.comment}</p>
                    <p style={{ fontSize:12, color:'#aaa', margin:0 }}>{new Date(r.created_at).toLocaleDateString('en-ZA')}</p>
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    {!r.approved && (
                      <button onClick={() => approveReview(r.id)} className="btn-teal" style={{ padding:'7px 14px', fontSize:13 }}>✓ Approve</button>
                    )}
                    <button onClick={() => deleteReview(r.id)}
                      style={{ padding:'7px 14px', borderRadius:6, border:'1.5px solid #c00', background:'#fff', color:'#c00', cursor:'pointer', fontSize:13, fontWeight:600 }}>
                      🗑 Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BANNERS */}
        {tab === 'banners' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ color:'#0F6E56', fontWeight:700, margin:0 }}>Banner Ads</h2>
              <button onClick={() => setShowBannerForm(!showBannerForm)} className="btn-gold">+ New Banner</button>
            </div>

            {showBannerForm && (
              <div style={{ background:'#fff', borderRadius:12, padding:24, border:'1.5px solid #e8e8e8', marginBottom:24 }}>
                <h3 style={{ color:'#0F6E56', marginBottom:20 }}>Create Banner Ad</h3>
                <div style={{ display:'grid', gap:14 }}>
                  {[['Title *','title','text'],['Advertiser Name','advertiser_name','text'],['Click URL *','click_url','url'],['Image URL (desktop)','desktop_image_url','url']].map(([label, key, type])=>(
                    <div key={key}>
                      <label className="form-label">{label}</label>
                      <input type={type} className="form-input" value={(newBanner as any)[key]} onChange={e => setNewBanner(b => ({ ...b, [key]: e.target.value }))} />
                    </div>
                  ))}
                  <div>
                    <label className="form-label">Placement</label>
                    <select className="form-input" value={newBanner.placement} onChange={e => setNewBanner(b => ({ ...b, placement: e.target.value }))}>
                      <option value="homepage_leaderboard">Homepage Leaderboard</option>
                      <option value="search_sidebar">Search Sidebar</option>
                      <option value="profile_banner">Profile Banner</option>
                      <option value="mobile_footer">Mobile Footer</option>
                    </select>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                    <div>
                      <label className="form-label">Start Date</label>
                      <input type="date" className="form-input" value={newBanner.start_date} onChange={e => setNewBanner(b => ({ ...b, start_date: e.target.value }))} />
                    </div>
                    <div>
                      <label className="form-label">End Date</label>
                      <input type="date" className="form-input" value={newBanner.end_date} onChange={e => setNewBanner(b => ({ ...b, end_date: e.target.value }))} />
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:10 }}>
                    <button onClick={createBanner} className="btn-teal">Create Banner</button>
                    <button onClick={() => setShowBannerForm(false)} style={{ padding:'10px 20px', borderRadius:6, border:'1.5px solid #ddd', background:'#fff', cursor:'pointer', fontSize:14 }}>Cancel</button>
                  </div>
                </div>
              </div>
            )}

            {banners.length === 0 ? (
              <div style={{ background:'#fff', borderRadius:12, padding:48, textAlign:'center', border:'1.5px solid #e8e8e8' }}>
                <p style={{ color:'#888' }}>No banner ads created yet.</p>
              </div>
            ) : (
              <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e8e8e8', overflow:'hidden' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
                  <thead>
                    <tr style={{ background:'#E1F5EE' }}>
                      {['Title','Advertiser','Placement','Clicks','Status','Dates','Actions'].map(h=>(
                        <th key={h} style={{ padding:'12px 16px', textAlign:'left', color:'#0F6E56', fontWeight:700, fontSize:12, textTransform:'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {banners.map((b, i) => (
                      <tr key={b.id} style={{ borderTop:'1px solid #f0f0f0', background: i%2===0?'#fff':'#fafafa' }}>
                        <td style={{ padding:'12px 16px', fontWeight:600 }}>{b.title}</td>
                        <td style={{ padding:'12px 16px', color:'#555' }}>{b.advertiser_name || '—'}</td>
                        <td style={{ padding:'12px 16px', color:'#555', fontSize:12 }}>{b.placement?.replace(/_/g,' ')}</td>
                        <td style={{ padding:'12px 16px', textAlign:'center', fontWeight:700, color:'#0F6E56' }}>{b.click_count || 0}</td>
                        <td style={{ padding:'12px 16px' }}>
                          <span style={{ padding:'3px 8px', borderRadius:10, fontSize:11, fontWeight:700,
                            background: b.active ? '#E1F5EE' : '#f0f0f0',
                            color: b.active ? '#0F6E56' : '#888' }}>
                            {b.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ padding:'12px 16px', fontSize:12, color:'#888' }}>
                          {b.start_date ? `${b.start_date} → ${b.end_date || '∞'}` : 'No dates set'}
                        </td>
                        <td style={{ padding:'12px 16px' }}>
                          <div style={{ display:'flex', gap:6 }}>
                            <button onClick={() => toggleBanner(b.id, b.active)}
                              style={{ padding:'5px 10px', borderRadius:5, border:'1px solid #e8e8e8', background:'#fff', cursor:'pointer', fontSize:12 }}>
                              {b.active ? 'Pause' : 'Activate'}
                            </button>
                            <button onClick={() => deleteBanner(b.id)}
                              style={{ padding:'5px 10px', borderRadius:5, border:'1px solid #c00', background:'#fff', color:'#c00', cursor:'pointer', fontSize:12 }}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* BLOG */}
        {tab === 'blog' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ color:'#0F6E56', fontWeight:700, margin:0 }}>Blog Articles</h2>
              <button onClick={() => { resetPostForm(); setShowPostForm(true) }} className="btn-gold">+ New Article</button>
            </div>

            {showPostForm && (
              <div style={{ background:'#fff', borderRadius:12, padding:24, border:'1.5px solid #e8e8e8', marginBottom:24 }}>
                <h3 style={{ color:'#0F6E56', marginBottom:20 }}>{editingPostId ? 'Edit Article' : 'New Article'}</h3>
                <div style={{ display:'grid', gap:14 }}>
                  <div>
                    <label className="form-label">Title *</label>
                    <input className="form-input" value={postForm.title} onChange={e=>setPostForm((f:any)=>({...f,title:e.target.value}))} />
                  </div>
                  <div>
                    <label className="form-label">Author</label>
                    <input className="form-input" value={postForm.author} onChange={e=>setPostForm((f:any)=>({...f,author:e.target.value}))} />
                  </div>
                  <div>
                    <label className="form-label">Cover Image URL</label>
                    <input className="form-input" value={postForm.cover_image_url} onChange={e=>setPostForm((f:any)=>({...f,cover_image_url:e.target.value}))} placeholder="https://…" />
                  </div>
                  <div>
                    <label className="form-label">Excerpt (short summary shown on the blog list)</label>
                    <textarea className="form-input" rows={2} value={postForm.excerpt} onChange={e=>setPostForm((f:any)=>({...f,excerpt:e.target.value}))} style={{ resize:'vertical' }} />
                  </div>
                  <div>
                    <label className="form-label">Content (leave a blank line between paragraphs)</label>
                    <textarea className="form-input" rows={10} value={postForm.content} onChange={e=>setPostForm((f:any)=>({...f,content:e.target.value}))} style={{ resize:'vertical' }} />
                  </div>
                  <label style={{ display:'flex', gap:8, alignItems:'center', fontSize:14, cursor:'pointer' }}>
                    <input type="checkbox" checked={postForm.published} onChange={e=>setPostForm((f:any)=>({...f,published:e.target.checked}))} />
                    Published (visible on the public blog)
                  </label>
                  <div style={{ display:'flex', gap:10 }}>
                    <button onClick={savePost} className="btn-teal">{editingPostId ? 'Save Changes' : 'Publish Article'}</button>
                    <button onClick={resetPostForm} style={{ padding:'10px 20px', borderRadius:6, border:'1.5px solid #ddd', background:'#fff', cursor:'pointer', fontSize:14 }}>Cancel</button>
                  </div>
                </div>
              </div>
            )}

            {posts.length === 0 ? (
              <div style={{ background:'#fff', borderRadius:12, padding:48, textAlign:'center', border:'1.5px solid #e8e8e8' }}>
                <p style={{ color:'#888' }}>No articles yet. Click “+ New Article” to create one.</p>
              </div>
            ) : (
              <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e8e8e8', overflow:'hidden' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
                  <thead><tr style={{ background:'#E1F5EE' }}>{['Title','Date','Status','Actions'].map(h=>(<th key={h} style={{ padding:'12px 16px', textAlign:'left', color:'#0F6E56', fontWeight:700, fontSize:12, textTransform:'uppercase' }}>{h}</th>))}</tr></thead>
                  <tbody>
                    {posts.map((p,i)=>(
                      <tr key={p.id} style={{ borderTop:'1px solid #f0f0f0', background:i%2===0?'#fff':'#fafafa' }}>
                        <td style={{ padding:'12px 16px', fontWeight:600 }}>{p.title}</td>
                        <td style={{ padding:'12px 16px', color:'#888', fontSize:12 }}>{new Date(p.created_at).toLocaleDateString('en-ZA')}</td>
                        <td style={{ padding:'12px 16px' }}>
                          <span style={{ padding:'3px 8px', borderRadius:10, fontSize:11, fontWeight:700, background:p.published?'#E1F5EE':'#f0f0f0', color:p.published?'#0F6E56':'#888' }}>{p.published?'Published':'Draft'}</span>
                        </td>
                        <td style={{ padding:'12px 16px' }}>
                          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                            <button onClick={()=>editPost(p)} style={{ padding:'5px 10px', borderRadius:5, border:'1px solid #5DCAA5', background:'#E1F5EE', color:'#0F6E56', cursor:'pointer', fontSize:12 }}>Edit</button>
                            <button onClick={()=>togglePost(p)} style={{ padding:'5px 10px', borderRadius:5, border:'1px solid #e8e8e8', background:'#fff', cursor:'pointer', fontSize:12 }}>{p.published?'Unpublish':'Publish'}</button>
                            <a href={`/blog/${p.slug}`} target="_blank" style={{ padding:'5px 10px', borderRadius:5, border:'1px solid #e8e8e8', background:'#fff', color:'#555', fontSize:12, textDecoration:'none' }}>View</a>
                            <button onClick={()=>deletePost(p.id)} style={{ padding:'5px 10px', borderRadius:5, border:'1px solid #c00', background:'#fff', color:'#c00', cursor:'pointer', fontSize:12 }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* WORKSHOPS */}
        {tab === 'workshops' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ color:'#0F6E56', fontWeight:700, margin:0 }}>Workshops &amp; Events</h2>
              <button onClick={() => { resetWorkshopForm(); setShowWorkshopForm(true) }} className="btn-gold">+ New Workshop</button>
            </div>

            {showWorkshopForm && (
              <div style={{ background:'#fff', borderRadius:12, padding:24, border:'1.5px solid #e8e8e8', marginBottom:24 }}>
                <h3 style={{ color:'#0F6E56', marginBottom:20 }}>{editingWorkshopId ? 'Edit Workshop' : 'New Workshop'}</h3>
                <div style={{ display:'grid', gap:14 }}>
                  <div>
                    <label className="form-label">Title *</label>
                    <input className="form-input" value={workshopForm.title} onChange={e=>setWorkshopForm((f:any)=>({...f,title:e.target.value}))} />
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                    <div>
                      <label className="form-label">Date &amp; Time</label>
                      <input type="datetime-local" className="form-input" value={workshopForm.event_date} onChange={e=>setWorkshopForm((f:any)=>({...f,event_date:e.target.value}))} />
                    </div>
                    <div>
                      <label className="form-label">Price (e.g. Free, R150)</label>
                      <input className="form-input" value={workshopForm.price} onChange={e=>setWorkshopForm((f:any)=>({...f,price:e.target.value}))} />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Location</label>
                    <input className="form-input" value={workshopForm.location} onChange={e=>setWorkshopForm((f:any)=>({...f,location:e.target.value}))} placeholder="e.g. Masjid Al-Noor, Cape Town — or Online" />
                  </div>
                  <div>
                    <label className="form-label">Cover Image URL</label>
                    <input className="form-input" value={workshopForm.cover_image_url} onChange={e=>setWorkshopForm((f:any)=>({...f,cover_image_url:e.target.value}))} placeholder="https://…" />
                  </div>
                  <div>
                    <label className="form-label">Registration / Info URL</label>
                    <input className="form-input" value={workshopForm.registration_url} onChange={e=>setWorkshopForm((f:any)=>({...f,registration_url:e.target.value}))} placeholder="https://…" />
                  </div>
                  <div>
                    <label className="form-label">Description</label>
                    <textarea className="form-input" rows={6} value={workshopForm.description} onChange={e=>setWorkshopForm((f:any)=>({...f,description:e.target.value}))} style={{ resize:'vertical' }} />
                  </div>
                  <label style={{ display:'flex', gap:8, alignItems:'center', fontSize:14, cursor:'pointer' }}>
                    <input type="checkbox" checked={workshopForm.published} onChange={e=>setWorkshopForm((f:any)=>({...f,published:e.target.checked}))} />
                    Published (visible on the public workshops page)
                  </label>
                  <div style={{ display:'flex', gap:10 }}>
                    <button onClick={saveWorkshop} className="btn-teal">{editingWorkshopId ? 'Save Changes' : 'Publish Workshop'}</button>
                    <button onClick={resetWorkshopForm} style={{ padding:'10px 20px', borderRadius:6, border:'1.5px solid #ddd', background:'#fff', cursor:'pointer', fontSize:14 }}>Cancel</button>
                  </div>
                </div>
              </div>
            )}

            {workshops.length === 0 ? (
              <div style={{ background:'#fff', borderRadius:12, padding:48, textAlign:'center', border:'1.5px solid #e8e8e8' }}>
                <p style={{ color:'#888' }}>No workshops yet. Click “+ New Workshop” to create one.</p>
              </div>
            ) : (
              <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e8e8e8', overflow:'hidden' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
                  <thead><tr style={{ background:'#E1F5EE' }}>{['Title','Date','Location','Status','Actions'].map(h=>(<th key={h} style={{ padding:'12px 16px', textAlign:'left', color:'#0F6E56', fontWeight:700, fontSize:12, textTransform:'uppercase' }}>{h}</th>))}</tr></thead>
                  <tbody>
                    {workshops.map((w,i)=>(
                      <tr key={w.id} style={{ borderTop:'1px solid #f0f0f0', background:i%2===0?'#fff':'#fafafa' }}>
                        <td style={{ padding:'12px 16px', fontWeight:600 }}>{w.title}</td>
                        <td style={{ padding:'12px 16px', color:'#888', fontSize:12 }}>{w.event_date ? new Date(w.event_date).toLocaleDateString('en-ZA') : '—'}</td>
                        <td style={{ padding:'12px 16px', color:'#555', fontSize:13 }}>{w.location || '—'}</td>
                        <td style={{ padding:'12px 16px' }}>
                          <span style={{ padding:'3px 8px', borderRadius:10, fontSize:11, fontWeight:700, background:w.published?'#E1F5EE':'#f0f0f0', color:w.published?'#0F6E56':'#888' }}>{w.published?'Published':'Draft'}</span>
                        </td>
                        <td style={{ padding:'12px 16px' }}>
                          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                            <button onClick={()=>editWorkshop(w)} style={{ padding:'5px 10px', borderRadius:5, border:'1px solid #5DCAA5', background:'#E1F5EE', color:'#0F6E56', cursor:'pointer', fontSize:12 }}>Edit</button>
                            <button onClick={()=>toggleWorkshop(w)} style={{ padding:'5px 10px', borderRadius:5, border:'1px solid #e8e8e8', background:'#fff', cursor:'pointer', fontSize:12 }}>{w.published?'Unpublish':'Publish'}</button>
                            <a href="/workshops" target="_blank" style={{ padding:'5px 10px', borderRadius:5, border:'1px solid #e8e8e8', background:'#fff', color:'#555', fontSize:12, textDecoration:'none' }}>View</a>
                            <button onClick={()=>deleteWorkshop(w.id)} style={{ padding:'5px 10px', borderRadius:5, border:'1px solid #c00', background:'#fff', color:'#c00', cursor:'pointer', fontSize:12 }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
