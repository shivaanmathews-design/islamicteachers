'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { SUBJECTS, PROVINCES, HOURLY_RATES } from '@/lib/types'

const TIERS = [
  { id:'free',     name:'Free',      price:'R0/month',     reg:'R0',    features:['Basic listing in search','Province, city & subjects shown','No photo or bio','No contact button'] },
  { id:'standard', name:'Standard',  price:'R99/month',    reg:'R99',   features:['Full profile with photo & bio','Contact button (WhatsApp & email)','All profile fields','Dashboard access'], highlight:false },
  { id:'premium',  name:'Premium',   price:'R179/month',   reg:'R179',  features:['Everything in Standard','⭐ Featured badge','Priority placement in search','Video introduction (2 min)'], highlight:true },
]

const STEPS = ['Personal Details','Teaching Details','Select Plan']

export default function RegisterTeacherPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)

  async function uploadFile(file: File, bucket: string): Promise<string | null> {
    const ext = file.name.split('.').pop()
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error: uploadErr } = await supabase.storage.from(bucket).upload(path, file, { upsert:false })
    if (uploadErr) return null
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPhoto(true)
    const url = await uploadFile(file, 'teacher-photos')
    if (url) set('profile_photo_url', url)
    else setError('Photo upload failed. Please try again.')
    setUploadingPhoto(false)
  }

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingVideo(true)
    const url = await uploadFile(file, 'teacher-videos')
    if (url) set('video_intro_url', url)
    else setError('Video upload failed. Please try again.')
    setUploadingVideo(false)
  }

  const [form, setForm] = useState({
    full_name:'', gender:'', province:'', city:'', suburb:'', email:'', whatsapp:'',
    password:'', confirm_password:'', whatsapp_consent:false,
    subjects:[] as string[], subjects_other:'', years_experience:1,
    session_type:'', age_groups:[] as string[], qualification:'no',
    qualification_description:'', hourly_rate:'', availability:true,
    online_availability:false, inperson_availability:false,
    bio:'', listing_tier:'free',
    profile_photo_url:'',
    video_intro_url:'',
    ref1_name:'', ref1_rel:'', ref1_phone:'',
    ref2_name:'', ref2_rel:'', ref2_phone:'',
    privacy_consent:false,
    terms_consent:false,
    child_safety_consent:false,
  })

  function set(k: string, v: any) { setForm(f => ({ ...f, [k]: v })) }

  function toggleArray(key: string, val: string) {
    setForm(f => {
      const arr = (f as any)[key] as string[]
      return { ...f, [key]: arr.includes(val) ? arr.filter((x:string)=>x!==val) : [...arr, val] }
    })
  }

  function validateStep(s: number) {
    if (s === 0) {
      if (!form.full_name) return 'Full name is required'
      if (!form.gender) return 'Gender is required'
      if (!form.province) return 'Province is required'
      if (!form.city) return 'City is required'
      if (!form.email) return 'Email is required'
      if (!form.whatsapp) return 'WhatsApp number is required'
      if (!form.password || form.password.length < 8) return 'Password must be at least 8 characters'
      if (form.password !== form.confirm_password) return 'Passwords do not match'
      if (!form.whatsapp_consent) return 'WhatsApp consent is required'
    }
    if (s === 1) {
      if (!form.subjects.length) return 'Select at least one subject'
      if (!form.session_type) return 'Session type is required'
      if (!form.age_groups.length) return 'Select at least one age group'
      if (!form.hourly_rate) return 'Hourly rate is required'
      if (!form.ref1_name || !form.ref1_phone) return 'Reference 1 is required (name and phone)'
      if (!form.ref2_name || !form.ref2_phone) return 'Reference 2 is required (name and phone)'
    }
    if (s === 2) {
      if (!form.privacy_consent) return 'You must read and accept the Privacy Policy'
      if (!form.terms_consent) return 'You must read and accept the Terms & Conditions'
      if (!form.child_safety_consent) return 'You must read and accept the Child Safety Policy'
    }
    return ''
  }

  function next() {
    const err = validateStep(step)
    if (err) { setError(err); return }
    setError('')
    setStep(s => s + 1)
  }

  async function submit() {
    const err = validateStep(2)
    if (err) { setError(err); return }
    setLoading(true); setError('')
    try {
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: form.email, password: form.password,
        options: { data: { full_name: form.full_name, role: 'teacher' } }
      })
      if (authErr) throw authErr

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'teacher',
          user_id: authData.user?.id,
          ...form,
          references_data: [
            { name: form.ref1_name, relationship: form.ref1_rel, phone: form.ref1_phone },
            { name: form.ref2_name, relationship: form.ref2_rel, phone: form.ref2_phone },
          ],
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const params = new URLSearchParams({ name: form.full_name, tier: form.listing_tier, type: 'teacher' })
      router.push(`/register/success?${params.toString()}`)
    } catch (e: any) {
      setError(e.message || 'Registration failed. Please try again.')
    }
    setLoading(false)
  }

  if (success) return (
    <div style={{ minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'#fff', borderRadius:16, padding:48, maxWidth:520, textAlign:'center', border:'1.5px solid #e8e8e8' }}>
        <div style={{ fontSize:56, marginBottom:16 }}>✅</div>
        <h1 style={{ color:'#0F6E56', marginBottom:12 }}>Registration Submitted!</h1>
        <p style={{ color:'#555', marginBottom:16, lineHeight:1.7 }}>
          JazakAllah Khair, <strong>{form.full_name}</strong>! Your listing has been submitted and is under review.
          We will contact your references and activate your listing within <strong>2 business days</strong>.
        </p>
        {form.listing_tier !== 'free' && (
          <div style={{ background:'#E1F5EE', borderRadius:8, padding:20, marginBottom:20, textAlign:'left' }}>
            <p style={{ margin:'0 0 8px', fontWeight:700, color:'#0F6E56' }}>Payment Required</p>
            <p style={{ margin:'0 0 4px', fontSize:14 }}>Plan: <strong>{form.listing_tier.charAt(0).toUpperCase()+form.listing_tier.slice(1)}</strong></p>
            <p style={{ margin:'0 0 4px', fontSize:14 }}>Amount: <strong>{TIERS.find(t=>t.id===form.listing_tier)?.reg}</strong></p>
            <p style={{ margin:'0 0 12px', fontSize:14 }}>Reference: <strong>{form.full_name} — {form.listing_tier}</strong></p>
            <p style={{ margin:0, fontSize:13, color:'#555' }}>Email proof of payment to <strong>admin@islamicteachers.co.za</strong></p>
          </div>
        )}
        <p style={{ fontSize:13, color:'#888' }}>Check your email (<strong>{form.email}</strong>) for your confirmation.</p>
      </div>
    </div>
  )

  return (
    <div style={{ background:'#f9f9f9', minHeight:'100vh', padding:'48px 0' }}>
      <div className="container" style={{ maxWidth:720 }}>
        {/* Progress */}
        <div style={{ display:'flex', gap:0, marginBottom:40, borderRadius:8, overflow:'hidden', border:'1.5px solid #e8e8e8' }}>
          {STEPS.map((s,i) => (
            <div key={s} style={{ flex:1, padding:'14px 8px', textAlign:'center', fontSize:13, fontWeight:600,
              background: i===step?'#0F6E56':i<step?'#E1F5EE':'#fff',
              color: i===step?'#fff':i<step?'#0F6E56':'#999',
              borderRight: i<2?'1px solid #e8e8e8':'none' }}>
              {i<step?'✓ ':''}{s}
            </div>
          ))}
        </div>

        <div style={{ background:'#fff', borderRadius:12, padding:36, border:'1.5px solid #e8e8e8' }}>
          <h1 style={{ color:'#0F6E56', fontSize:24, fontWeight:700, marginBottom:28 }}>
            Register as a Teacher — {STEPS[step]}
          </h1>

          {error && <div style={{ background:'#fee', color:'#c00', padding:'12px 16px', borderRadius:8, marginBottom:20, fontSize:14 }}>{error}</div>}

          {/* STEP 1 */}
          {step === 0 && (
            <div style={{ display:'grid', gap:20 }}>
              {[['Full Name','full_name','text'],['City','city','text'],['Suburb','suburb','text'],['Email Address','email','email'],['WhatsApp Number','whatsapp','tel'],['Password','password','password'],['Confirm Password','confirm_password','password']].map(([label,key,type])=>(
                <div key={key}>
                  <label className="form-label">{label}{key==='suburb'?' (optional)':' *'}</label>
                  <input type={type} className="form-input" value={(form as any)[key]} onChange={e=>set(key,e.target.value)} />
                </div>
              ))}
              <div>
                <label className="form-label">Gender *</label>
                <select className="form-input" value={form.gender} onChange={e=>set('gender',e.target.value)}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="form-label">Province *</label>
                <select className="form-input" value={form.province} onChange={e=>set('province',e.target.value)}>
                  <option value="">Select province</option>
                  {PROVINCES.map(p=><option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <label style={{ display:'flex', gap:12, alignItems:'flex-start', cursor:'pointer', padding:'12px 16px', borderRadius:8, background:'#f9f9f9', border:'1px solid #e8e8e8' }}>
                <input type="checkbox" checked={form.whatsapp_consent} onChange={e=>set('whatsapp_consent',e.target.checked)} style={{ marginTop:2 }} />
                <span style={{ fontSize:14, color:'#555' }}>I consent to students and parents contacting me via WhatsApp through this platform. *</span>
              </label>
            </div>
          )}

          {/* STEP 2 */}
          {step === 1 && (
            <div style={{ display:'grid', gap:20 }}>
              <div>
                <label className="form-label">Subjects Taught *</label>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:8, padding:16, background:'#f9f9f9', borderRadius:8 }}>
                  {SUBJECTS.map(s=>(
                    <label key={s.value} style={{ display:'flex', gap:8, alignItems:'center', cursor:'pointer', fontSize:14 }}>
                      <input type="checkbox" checked={form.subjects.includes(s.value)} onChange={()=>toggleArray('subjects',s.value)} />
                      {s.label}
                    </label>
                  ))}
                </div>
                {form.subjects.includes('other') && (
                  <input className="form-input" style={{ marginTop:8 }} placeholder="Please specify other subject"
                    value={form.subjects_other} onChange={e=>set('subjects_other',e.target.value)} />
                )}
              </div>
              <div>
                <label className="form-label">Session Type *</label>
                <select className="form-input" value={form.session_type} onChange={e=>set('session_type',e.target.value)}>
                  <option value="">Select type</option>
                  <option value="in-person">In-Person Only</option>
                  <option value="online">Online Only</option>
                  <option value="both">Both In-Person and Online</option>
                </select>
              </div>
              <div>
                <label className="form-label">Age Groups Taught *</label>
                <div style={{ display:'flex', gap:16, flexWrap:'wrap', padding:'12px 16px', background:'#f9f9f9', borderRadius:8 }}>
                  {[['children','Children (under 12)'],['teenagers','Teenagers (13-17)'],['adults','Adults (18+)']].map(([v,l])=>(
                    <label key={v} style={{ display:'flex', gap:8, alignItems:'center', cursor:'pointer', fontSize:14 }}>
                      <input type="checkbox" checked={form.age_groups.includes(v)} onChange={()=>toggleArray('age_groups',v)} />
                      {l}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="form-label">Years of Experience *</label>
                <input type="number" className="form-input" min={0} max={60} value={form.years_experience} onChange={e=>set('years_experience',parseInt(e.target.value)||0)} />
              </div>
              <div>
                <label className="form-label">Hourly Rate *</label>
                <select className="form-input" value={form.hourly_rate} onChange={e=>set('hourly_rate',e.target.value)}>
                  <option value="">Select rate</option>
                  {HOURLY_RATES.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Qualification</label>
                <select className="form-input" value={form.qualification} onChange={e=>set('qualification',e.target.value)}>
                  <option value="no">No formal qualification</option>
                  <option value="yes">Yes, I am qualified</option>
                  <option value="studying">Currently studying</option>
                </select>
              </div>
              {(form.qualification==='yes'||form.qualification==='studying') && (
                <div>
                  <label className="form-label">Qualification Details</label>
                  <input className="form-input" value={form.qualification_description} onChange={e=>set('qualification_description',e.target.value)} placeholder="e.g. Aalim certificate from Darul Uloom, Cape Town" />
                </div>
              )}
              <div>
                <label className="form-label">Bio (required for Standard and Premium plans)</label>
                <textarea className="form-input" rows={4} value={form.bio} onChange={e=>set('bio',e.target.value)}
                  placeholder="Tell students and parents about yourself, your teaching style, and your experience." style={{ resize:'vertical' }} />
              </div>

              {/* Photo upload */}
              <div style={{ background:'#f9f9f9', borderRadius:8, padding:20, border:'1px solid #e8e8e8' }}>
                <label className="form-label">Profile Photo (Standard & Premium)</label>
                <p style={{ fontSize:13, color:'#888', marginBottom:12 }}>Upload a clear, professional-looking photo. JPG or PNG, max 5MB.</p>
                {form.profile_photo_url && (
                  <img src={form.profile_photo_url} alt="Preview" style={{ width:80, height:80, borderRadius:'50%', objectFit:'cover', border:'3px solid #0F6E56', marginBottom:12, display:'block' }} />
                )}
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoUpload} disabled={uploadingPhoto}
                  style={{ fontSize:14 }} />
                {uploadingPhoto && <p style={{ fontSize:13, color:'#0F6E56', marginTop:8 }}>Uploading…</p>}
              </div>

              {/* Video upload (Premium only) */}
              <div style={{ background:'#f9f9f9', borderRadius:8, padding:20, border:'1px solid #e8e8e8' }}>
                <label className="form-label">Video Introduction <span style={{ color:'#BA7517', fontWeight:700 }}>(Premium only)</span></label>
                <p style={{ fontSize:13, color:'#888', marginBottom:12 }}>Short 1–2 minute video introducing yourself. MP4 or MOV, max 50MB. Only visible if you select the Premium plan.</p>
                {form.video_intro_url && (
                  <video src={form.video_intro_url} controls style={{ width:'100%', borderRadius:8, marginBottom:12, maxHeight:160 }} />
                )}
                <input type="file" accept="video/mp4,video/quicktime,video/webm" onChange={handleVideoUpload} disabled={uploadingVideo}
                  style={{ fontSize:14 }} />
                {uploadingVideo && <p style={{ fontSize:13, color:'#0F6E56', marginTop:8 }}>Uploading…</p>}
              </div>

              <div style={{ background:'#E1F5EE', borderRadius:8, padding:20, border:'1px solid #5DCAA5' }}>
                <h3 style={{ color:'#0F6E56', fontSize:16, fontWeight:700, marginBottom:16 }}>References (Required)</h3>
                <p style={{ fontSize:13, color:'#555', marginBottom:20 }}>We will contact at least one reference before approving your listing.</p>
                {[['Reference 1','ref1'],['Reference 2 (parent of a past student preferred)','ref2']].map(([label,prefix])=>(
                  <div key={prefix} style={{ marginBottom:20 }}>
                    <p style={{ fontWeight:600, fontSize:14, color:'#0F6E56', marginBottom:8 }}>{label}</p>
                    <div style={{ display:'grid', gap:10 }}>
                      {[[`${prefix}_name`,'Full name'],[ `${prefix}_rel`,'Relationship (e.g. Sheikh, former student\'s parent)'],[`${prefix}_phone`,'Phone / WhatsApp number']].map(([k,ph])=>(
                        <input key={k} className="form-input" placeholder={ph} value={(form as any)[k]} onChange={e=>set(k,e.target.value)} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
                {[['Currently taking new students','availability'],['Available online','online_availability'],['Available in-person','inperson_availability']].map(([l,k])=>(
                  <label key={k} style={{ display:'flex', gap:8, alignItems:'center', cursor:'pointer', fontSize:14 }}>
                    <input type="checkbox" checked={(form as any)[k]} onChange={e=>set(k,e.target.checked)} />
                    {l}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3 — Plan Selection */}
          {step === 2 && (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16, marginBottom:28 }}>
                {TIERS.map(t=>(
                  <div key={t.id} onClick={()=>set('listing_tier',t.id)}
                    style={{ border: form.listing_tier===t.id?'2.5px solid #0F6E56':'1.5px solid #e8e8e8',
                      borderRadius:12, padding:24, cursor:'pointer', transition:'all .15s',
                      background: form.listing_tier===t.id?'#E1F5EE':'#fff',
                      position:'relative' }}>
                    {t.highlight && <div style={{ position:'absolute', top:-10, left:'50%', transform:'translateX(-50%)', background:'#BA7517', color:'#fff', fontSize:11, fontWeight:700, padding:'2px 12px', borderRadius:20 }}>MOST POPULAR</div>}
                    <h3 style={{ color:'#0F6E56', fontWeight:700, marginBottom:4 }}>{t.name}</h3>
                    <p style={{ color:'#BA7517', fontWeight:700, fontSize:20, margin:'0 0 16px' }}>{t.price}</p>
                    <ul style={{ paddingLeft:16, margin:0 }}>
                      {t.features.map(f=><li key={f} style={{ fontSize:13, color:'#555', marginBottom:6 }}>{f}</li>)}
                    </ul>
                    {form.listing_tier===t.id && <div style={{ marginTop:16, textAlign:'center', color:'#0F6E56', fontWeight:700, fontSize:13 }}>✓ Selected</div>}
                  </div>
                ))}
              </div>

              {form.listing_tier !== 'free' && (
                <div style={{ background:'#fff7e6', border:'1.5px solid #f0c060', borderRadius:8, padding:20, marginBottom:24 }}>
                  <p style={{ fontWeight:700, color:'#BA7517', margin:'0 0 8px' }}>💳 Payment by EFT</p>
                  <p style={{ fontSize:14, color:'#555', margin:'0 0 4px' }}>After registration, pay <strong>{TIERS.find(t=>t.id===form.listing_tier)?.reg}</strong> via EFT.</p>
                  <p style={{ fontSize:13, color:'#888', margin:0 }}>Banking details will be emailed to you. Your listing goes live within 2 business days of payment confirmation.</p>
                </div>
              )}

              <div style={{ display:'grid', gap:10 }}>
                <p style={{ fontWeight:700, fontSize:14, color:'#0F6E56', margin:'0 0 4px' }}>Policies — you must read and accept all three before submitting *</p>
                {[
                  { key:'privacy_consent', label:'I have read and agree to the', link:'/privacy-policy', linkText:'Privacy Policy' },
                  { key:'terms_consent',   label:'I have read and agree to the', link:'/terms',          linkText:'Terms & Conditions' },
                  { key:'child_safety_consent', label:'I have read and agree to the', link:'/child-safety', linkText:'Child Safety Policy' },
                ].map(({ key, label, link, linkText }) => (
                  <label key={key} style={{ display:'flex', gap:12, alignItems:'flex-start', cursor:'pointer', padding:'14px 16px', borderRadius:8, background:'#f9f9f9', border:(form as any)[key]?'1.5px solid #0F6E56':'1px solid #e8e8e8' }}>
                    <input type="checkbox" checked={(form as any)[key]} onChange={e=>set(key,e.target.checked)} style={{ marginTop:2, accentColor:'#0F6E56' }} />
                    <span style={{ fontSize:13, color:'#555', lineHeight:1.6 }}>
                      {label} <a href={link} target="_blank" rel="noopener noreferrer" style={{ color:'#0F6E56', fontWeight:600 }}>{linkText} ↗</a>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:32, paddingTop:24, borderTop:'1px solid #eee' }}>
            {step > 0
              ? <button onClick={()=>{ setError(''); setStep(s=>s-1) }} className="btn-outline">← Back</button>
              : <span />
            }
            {step < 2
              ? <button onClick={next} className="btn-teal">Continue →</button>
              : <button onClick={submit} className="btn-gold" disabled={loading}>{loading?'Submitting…':'Submit Registration'}</button>
            }
          </div>
        </div>
      </div>
    </div>
  )
}
