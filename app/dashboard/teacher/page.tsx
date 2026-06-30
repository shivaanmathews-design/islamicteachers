'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { SUBJECTS, PROVINCES, HOURLY_RATES } from '@/lib/types'
import type { Subject } from '@/lib/types'
import type { Teacher } from '@/lib/types'
import Link from 'next/link'

export default function TeacherDashboard() {
  const router = useRouter()
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [tab, setTab] = useState<'overview'|'profile'|'subscription'>('overview')

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      const { data } = await supabase.from('teachers').select('*').eq('user_id', session.user.id).single()
      if (!data) { router.push('/register/teacher'); return }
      setTeacher(data as Teacher)
      setLoading(false)
    })
  }, [router])

  async function save() {
    if (!teacher) return
    setSaving(true)
    const { error } = await supabase.from('teachers').update({
      full_name: teacher.full_name,
      city: teacher.city,
      suburb: teacher.suburb,
      province: teacher.province,
      bio: teacher.bio,
      subjects: teacher.subjects,
      session_type: teacher.session_type,
      age_groups: teacher.age_groups,
      hourly_rate: teacher.hourly_rate,
      years_experience: teacher.years_experience,
      availability: teacher.availability,
      online_availability: teacher.online_availability,
      inperson_availability: teacher.inperson_availability,
    }).eq('id', teacher.id)
    setSaveMsg(error ? 'Error saving changes.' : 'Changes saved!')
    setSaving(false)
    setTimeout(() => setSaveMsg(''), 3000)
  }

  function set(k: keyof Teacher, v: any) { setTeacher(t => t ? { ...t, [k]: v } : t) }
  function toggleSubject(val: string) {
    if (!teacher) return
    const arr = teacher.subjects.includes(val as Subject) ? teacher.subjects.filter(x=>x!==val) : [...teacher.subjects, val as Subject]
    set('subjects', arr)
  }

  if (loading) return <div style={{ textAlign:'center', padding:80, color:'#0F6E56' }}>Loading dashboard…</div>
  if (!teacher) return null

  const tierColors: Record<string,string> = { free:'#888', standard:'#1D9E75', premium:'#BA7517', institution:'#0F6E56' }
  const profileUrl = teacher.slug ? `/teachers/${teacher.slug}` : `/teachers/${teacher.id}`

  return (
    <div style={{ background:'#f9f9f9', minHeight:'100vh' }}>
      {/* Header */}
      <div style={{ background:'#0F6E56', padding:'24px 0' }}>
        <div className="container" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 style={{ color:'#fff', fontSize:22, fontWeight:700, margin:'0 0 4px' }}>Teacher Dashboard</h1>
            <p style={{ color:'#E1F5EE', fontSize:14, margin:0 }}>Welcome back, {teacher.full_name}</p>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <span style={{ padding:'6px 14px', borderRadius:20, fontSize:12, fontWeight:700, background:tierColors[teacher.listing_tier]||'#888', color:'#fff' }}>
              {teacher.listing_tier.toUpperCase()} PLAN
            </span>
            <span style={{ padding:'6px 14px', borderRadius:20, fontSize:12, fontWeight:700,
              background: teacher.listing_status==='active'?'#E1F5EE':teacher.listing_status==='pending'?'#fff7e6':'#fee',
              color: teacher.listing_status==='active'?'#0F6E56':teacher.listing_status==='pending'?'#BA7517':'#c00' }}>
              {teacher.listing_status.toUpperCase()}
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
              {t === 'overview' ? '📊 Overview' : t === 'profile' ? '✏️ My Profile' : '💳 Subscription'}
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
                { label:'Profile Views', value:teacher.profile_views || 0, icon:'👀' },
                { label:'Enquiries Received', value:teacher.enquiry_count || 0, icon:'📩' },
                { label:'Your Listing Status', value:teacher.listing_status, icon:'📋' },
                { label:'Current Plan', value:teacher.listing_tier, icon:'⭐' },
              ].map(s=>(
                <div key={s.label} style={{ background:'#fff', borderRadius:12, padding:24, border:'1.5px solid #e8e8e8', textAlign:'center' }}>
                  <div style={{ fontSize:28, marginBottom:8 }}>{s.icon}</div>
                  <p style={{ fontSize:24, fontWeight:700, color:'#0F6E56', margin:'0 0 4px' }}>{s.value}</p>
                  <p style={{ fontSize:13, color:'#888', margin:0 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {teacher.listing_status === 'pending' && (
              <div style={{ background:'#fff7e6', border:'1.5px solid #f0c060', borderRadius:10, padding:20, marginBottom:24 }}>
                <p style={{ fontWeight:700, color:'#BA7517', margin:'0 0 6px' }}>⏳ Your listing is under review</p>
                <p style={{ fontSize:14, color:'#555', margin:0 }}>We are verifying your details and contacting your references. Your listing will go live within 2 business days.</p>
              </div>
            )}

            {teacher.listing_status === 'active' && (
              <div style={{ background:'#E1F5EE', border:'1.5px solid #5DCAA5', borderRadius:10, padding:20, marginBottom:24 }}>
                <p style={{ fontWeight:700, color:'#0F6E56', margin:'0 0 6px' }}>✅ Your listing is live!</p>
                <p style={{ fontSize:14, color:'#555', margin:'0 0 12px' }}>Students and parents can find your profile.</p>
                <Link href={profileUrl} target="_blank" className="btn-teal" style={{ display:'inline-block' }}>View My Profile →</Link>
              </div>
            )}

            <div style={{ background:'#fff', borderRadius:12, padding:24, border:'1.5px solid #e8e8e8' }}>
              <h2 style={{ color:'#0F6E56', fontWeight:700, fontSize:18, marginBottom:20 }}>Quick Settings</h2>
              <div style={{ display:'grid', gap:16 }}>
                {[['availability','Currently taking new students'],['online_availability','Available for online lessons'],['inperson_availability','Available for in-person lessons']].map(([k,l])=>(
                  <label key={k} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 16px', borderRadius:8, background:'#f9f9f9', cursor:'pointer' }}>
                    <span style={{ fontSize:14, color:'#2C2C2A' }}>{l}</span>
                    <input type="checkbox" checked={(teacher as any)[k] ?? false} onChange={e=>{ set(k as keyof Teacher, e.target.checked); save() }} />
                  </label>
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
              {[['Full Name','full_name','text'],['City','city','text'],['Suburb','suburb','text']].map(([label,key,type])=>(
                <div key={key}>
                  <label className="form-label">{label}</label>
                  <input type={type} className="form-input" value={(teacher as any)[key]||''} onChange={e=>set(key as keyof Teacher, e.target.value)} />
                </div>
              ))}
              <div>
                <label className="form-label">Province</label>
                <select className="form-input" value={teacher.province} onChange={e=>set('province', e.target.value)}>
                  {PROVINCES.map(p=><option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Hourly Rate</label>
                <select className="form-input" value={teacher.hourly_rate} onChange={e=>set('hourly_rate', e.target.value)}>
                  {HOURLY_RATES.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Session Type</label>
                <select className="form-input" value={teacher.session_type} onChange={e=>set('session_type', e.target.value)}>
                  <option value="in-person">In-Person Only</option>
                  <option value="online">Online Only</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div>
                <label className="form-label">Years of Experience</label>
                <input type="number" className="form-input" min={0} max={60} value={teacher.years_experience} onChange={e=>set('years_experience', parseInt(e.target.value)||0)} />
              </div>
              <div>
                <label className="form-label">Subjects</label>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:8, padding:12, background:'#f9f9f9', borderRadius:8 }}>
                  {SUBJECTS.map(s=>(
                    <label key={s.value} style={{ display:'flex', gap:8, alignItems:'center', cursor:'pointer', fontSize:14 }}>
                      <input type="checkbox" checked={teacher.subjects.includes(s.value)} onChange={()=>toggleSubject(s.value)} />
                      {s.label}
                    </label>
                  ))}
                </div>
              </div>
              {teacher.listing_tier !== 'free' && (
                <div>
                  <label className="form-label">Bio</label>
                  <textarea className="form-input" rows={5} value={teacher.bio||''} onChange={e=>set('bio', e.target.value)} style={{ resize:'vertical' }} />
                </div>
              )}
              <button onClick={save} className="btn-teal" disabled={saving}>{saving?'Saving…':'Save Changes'}</button>
            </div>
          </div>
        )}

        {/* SUBSCRIPTION */}
        {tab === 'subscription' && (
          <div style={{ maxWidth:600 }}>
            <div style={{ background:'#fff', borderRadius:12, padding:28, border:'1.5px solid #e8e8e8', marginBottom:20 }}>
              <h2 style={{ color:'#0F6E56', fontWeight:700, marginBottom:20 }}>Current Subscription</h2>
              <div style={{ padding:'16px 20px', background:'#E1F5EE', borderRadius:8, marginBottom:20 }}>
                <p style={{ fontWeight:700, color:'#0F6E56', margin:'0 0 4px', fontSize:18 }}>{teacher.listing_tier.charAt(0).toUpperCase()+teacher.listing_tier.slice(1)} Plan</p>
                <p style={{ fontSize:14, color:'#555', margin:0 }}>{teacher.listing_status === 'active' ? 'Active listing' : teacher.listing_status === 'pending' ? 'Pending review' : 'Inactive'}</p>
              </div>
              <p style={{ fontSize:14, color:'#555', marginBottom:20 }}>
                To upgrade your plan, send an email to <strong>islamicteachersadmin@gmail.com</strong> with the subject line <strong>"Upgrade Plan — {teacher.full_name}"</strong>.
              </p>
              <div style={{ background:'#fff7e6', border:'1px solid #f0c060', borderRadius:8, padding:16 }}>
                <p style={{ fontWeight:700, color:'#BA7517', margin:'0 0 8px' }}>Plans available:</p>
                <p style={{ fontSize:13, margin:'0 0 4px' }}>• <strong>Standard</strong> — R99/month (photo, bio, contact button)</p>
                <p style={{ fontSize:13, margin:'0 0 4px' }}>• <strong>Premium</strong> — R179/month (featured placement, video intro)</p>
                <p style={{ fontSize:13, margin:0, color:'#888' }}>Payment by EFT only.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
