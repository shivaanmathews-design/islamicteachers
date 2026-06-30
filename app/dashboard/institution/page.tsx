'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { SUBJECTS, PROVINCES } from '@/lib/types'
import Link from 'next/link'

type Institution = {
  id: string; user_id: string; institution_name: string; institution_type: string
  province: string; city: string; address: string; email: string; phone: string
  whatsapp: string; website: string; description: string; subjects_offered: string[]
  listing_tier: string; listing_status: string; institution_views: number
  institution_enquiries: number; slug: string; created_at: string
}

export default function InstitutionDashboard() {
  const router = useRouter()
  const [inst, setInst] = useState<Institution | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [tab, setTab] = useState<'overview'|'profile'|'subscription'>('overview')

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      const { data } = await supabase.from('institutions').select('*').eq('user_id', session.user.id).single()
      if (!data) { router.push('/register/institution'); return }
      setInst(data as Institution)
      setLoading(false)
    })
  }, [router])

  async function save() {
    if (!inst) return
    setSaving(true)
    const { error } = await supabase.from('institutions').update({
      institution_name: inst.institution_name,
      institution_type: inst.institution_type,
      city: inst.city,
      province: inst.province,
      address: inst.address,
      phone: inst.phone,
      whatsapp: inst.whatsapp,
      website: inst.website,
      description: inst.description,
      subjects_offered: inst.subjects_offered,
    }).eq('id', inst.id)
    setSaveMsg(error ? 'Error saving changes.' : 'Changes saved!')
    setSaving(false)
    setTimeout(() => setSaveMsg(''), 3000)
  }

  function set(k: keyof Institution, v: any) { setInst(i => i ? { ...i, [k]: v } : i) }

  function toggleSubject(val: string) {
    if (!inst) return
    const arr = inst.subjects_offered.includes(val)
      ? inst.subjects_offered.filter(x => x !== val)
      : [...inst.subjects_offered, val]
    set('subjects_offered', arr)
  }

  if (loading) return <div style={{ textAlign:'center', padding:80, color:'#0F6E56' }}>Loading dashboard…</div>
  if (!inst) return null

  const profileUrl = inst.slug ? `/institutions/${inst.slug}` : null

  return (
    <div style={{ background:'#f9f9f9', minHeight:'100vh' }}>
      {/* Header */}
      <div style={{ background:'#0F6E56', padding:'24px 0' }}>
        <div className="container" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 style={{ color:'#fff', fontSize:22, fontWeight:700, margin:'0 0 4px' }}>Institution Dashboard</h1>
            <p style={{ color:'#E1F5EE', fontSize:14, margin:0 }}>{inst.institution_name}</p>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <span style={{ padding:'6px 14px', borderRadius:20, fontSize:12, fontWeight:700, background:'#0a5540', color:'#fff' }}>
              INSTITUTION PLAN
            </span>
            <span style={{ padding:'6px 14px', borderRadius:20, fontSize:12, fontWeight:700,
              background: inst.listing_status==='active'?'#E1F5EE':inst.listing_status==='pending'?'#fff7e6':'#fee',
              color: inst.listing_status==='active'?'#0F6E56':inst.listing_status==='pending'?'#BA7517':'#c00' }}>
              {inst.listing_status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background:'#fff', borderBottom:'1.5px solid #e8e8e8' }}>
        <div className="container" style={{ display:'flex', gap:0 }}>
          {(['overview','profile','subscription'] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              style={{ padding:'14px 24px', border:'none', background:'none', cursor:'pointer', fontSize:14, fontWeight:600,
                color: tab===t?'#0F6E56':'#888',
                borderBottom: tab===t?'2.5px solid #0F6E56':'2.5px solid transparent',
                textTransform:'capitalize' }}>
              {t === 'overview' ? '📊 Overview' : t === 'profile' ? '✏️ Profile' : '💳 Subscription'}
            </button>
          ))}
        </div>
      </div>

      <div className="container" style={{ padding:'32px 20px' }}>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:16, marginBottom:32 }}>
              {[
                { label:'Profile Views', value: inst.institution_views || 0, icon:'👀' },
                { label:'Enquiries Received', value: inst.institution_enquiries || 0, icon:'📩' },
                { label:'Listing Status', value: inst.listing_status, icon:'📋' },
                { label:'Subjects Offered', value: inst.subjects_offered?.length || 0, icon:'📚' },
              ].map(s=>(
                <div key={s.label} style={{ background:'#fff', borderRadius:12, padding:24, border:'1.5px solid #e8e8e8', textAlign:'center' }}>
                  <div style={{ fontSize:28, marginBottom:8 }}>{s.icon}</div>
                  <p style={{ fontSize:24, fontWeight:700, color:'#0F6E56', margin:'0 0 4px' }}>{s.value}</p>
                  <p style={{ fontSize:13, color:'#888', margin:0 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {inst.listing_status === 'pending' && (
              <div style={{ background:'#fff7e6', border:'1.5px solid #f0c060', borderRadius:10, padding:20, marginBottom:24 }}>
                <p style={{ fontWeight:700, color:'#BA7517', margin:'0 0 6px' }}>⏳ Your listing is under review</p>
                <p style={{ fontSize:14, color:'#555', margin:0 }}>We are reviewing your institution registration. Your listing will go live within 2 business days of payment confirmation.</p>
              </div>
            )}

            {inst.listing_status === 'active' && (
              <div style={{ background:'#E1F5EE', border:'1.5px solid #5DCAA5', borderRadius:10, padding:20, marginBottom:24 }}>
                <p style={{ fontWeight:700, color:'#0F6E56', margin:'0 0 6px' }}>✅ Your listing is live!</p>
                <p style={{ fontSize:14, color:'#555', margin:'0 0 12px' }}>Families can find your institution in search results.</p>
                {profileUrl && <Link href={profileUrl} target="_blank" className="btn-teal" style={{ display:'inline-block' }}>View Institution Profile →</Link>}
              </div>
            )}

            <div style={{ background:'#fff', borderRadius:12, padding:24, border:'1.5px solid #e8e8e8' }}>
              <h2 style={{ color:'#0F6E56', fontWeight:700, fontSize:18, marginBottom:16 }}>Institution Details</h2>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12 }}>
                {[
                  ['Institution', inst.institution_name],
                  ['Type', inst.institution_type || '—'],
                  ['City', inst.city],
                  ['Province', inst.province],
                  ['Phone', inst.phone || '—'],
                  ['WhatsApp', inst.whatsapp || '—'],
                  ['Website', inst.website || '—'],
                  ['Email', inst.email],
                ].map(([k,v])=>(
                  <div key={k} style={{ padding:'12px 16px', background:'#f9f9f9', borderRadius:8 }}>
                    <p style={{ margin:'0 0 4px', fontSize:11, fontWeight:700, color:'#0F6E56', textTransform:'uppercase', letterSpacing:0.5 }}>{k}</p>
                    <p style={{ margin:0, fontSize:14, color:'#2C2C2A' }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PROFILE EDITOR */}
        {tab === 'profile' && (
          <div style={{ maxWidth:680 }}>
            {saveMsg && <div style={{ background:'#E1F5EE', color:'#0F6E56', padding:'12px 16px', borderRadius:8, marginBottom:20, fontWeight:600 }}>{saveMsg}</div>}
            <div style={{ background:'#fff', borderRadius:12, padding:28, border:'1.5px solid #e8e8e8', display:'grid', gap:20 }}>
              {[
                ['Institution Name','institution_name'],
                ['City','city'],
                ['Address','address'],
                ['Phone','phone'],
                ['WhatsApp','whatsapp'],
                ['Website','website'],
              ].map(([label, key])=>(
                <div key={key}>
                  <label className="form-label">{label}</label>
                  <input className="form-input" value={(inst as any)[key]||''} onChange={e=>set(key as keyof Institution, e.target.value)} />
                </div>
              ))}
              <div>
                <label className="form-label">Institution Type</label>
                <select className="form-input" value={inst.institution_type} onChange={e=>set('institution_type', e.target.value)}>
                  {['Madressa','Islamic School','University/College','Hifz Academy','Online Platform','Other'].map(t=>(
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Province</label>
                <select className="form-input" value={inst.province} onChange={e=>set('province', e.target.value)}>
                  {PROVINCES.map(p=><option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={5} value={inst.description||''} onChange={e=>set('description', e.target.value)} style={{ resize:'vertical' }} />
              </div>
              <div>
                <label className="form-label">Subjects Offered</label>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:8, padding:12, background:'#f9f9f9', borderRadius:8 }}>
                  {SUBJECTS.map(s=>(
                    <label key={s.value} style={{ display:'flex', gap:8, alignItems:'center', cursor:'pointer', fontSize:14 }}>
                      <input type="checkbox" checked={inst.subjects_offered?.includes(s.value)} onChange={()=>toggleSubject(s.value)} />
                      {s.label}
                    </label>
                  ))}
                </div>
              </div>
              <button onClick={save} className="btn-teal" disabled={saving}>{saving?'Saving…':'Save Changes'}</button>
            </div>
          </div>
        )}

        {/* SUBSCRIPTION */}
        {tab === 'subscription' && (
          <div style={{ maxWidth:600 }}>
            <div style={{ background:'#fff', borderRadius:12, padding:28, border:'1.5px solid #e8e8e8' }}>
              <h2 style={{ color:'#0F6E56', fontWeight:700, marginBottom:20 }}>Institution Subscription</h2>
              <div style={{ padding:'16px 20px', background:'#E1F5EE', borderRadius:8, marginBottom:20 }}>
                <p style={{ fontWeight:700, color:'#0F6E56', margin:'0 0 4px', fontSize:18 }}>Institution Plan — R449/month</p>
                <p style={{ fontSize:14, color:'#555', margin:0 }}>{inst.listing_status === 'active' ? 'Active' : inst.listing_status === 'pending' ? 'Pending review' : 'Inactive'}</p>
              </div>
              <p style={{ fontSize:14, color:'#555', marginBottom:20 }}>
                For any changes to your subscription or to add teacher listings, email <strong>islamicteachersadmin@gmail.com</strong>.
              </p>
              <div style={{ background:'#fff7e6', border:'1px solid #f0c060', borderRadius:8, padding:16 }}>
                <p style={{ fontWeight:700, color:'#BA7517', margin:'0 0 8px' }}>Your plan includes:</p>
                {['Dedicated institution profile page','Logo and full description','List all subjects and programmes','Link teachers to your institution','Full contact details and website','Admin dashboard'].map(f=>(
                  <p key={f} style={{ fontSize:13, margin:'0 0 4px' }}>✓ {f}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
