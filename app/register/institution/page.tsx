'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { SUBJECTS, PROVINCES } from '@/lib/types'
import { phoneError, normalizeEmail, digitsOnly } from '@/lib/validation'

export default function RegisterInstitutionPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    institution_name:'', institution_type:'madressa', province:'', city:'', address:'',
    email:'', phone:'', whatsapp:'', website:'', description:'',
    subjects_offered:[] as string[], password:'', confirm_password:'',
    privacy_consent:false,
    terms_consent:false,
    child_safety_consent:false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function set(k: string, v: any) {
    if (typeof v === 'string' && (k === 'phone' || k === 'whatsapp')) v = digitsOnly(v).slice(0, 10)
    setForm(f=>({...f,[k]:v}))
  }
  function toggleSubject(val: string) {
    setForm(f=>({ ...f, subjects_offered: f.subjects_offered.includes(val)
      ? f.subjects_offered.filter(x=>x!==val) : [...f.subjects_offered, val] }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.privacy_consent) { setError('You must read and accept the Privacy Policy.'); return }
    if (!form.terms_consent) { setError('You must read and accept the Terms & Conditions.'); return }
    if (!form.child_safety_consent) { setError('You must read and accept the Child Safety Policy.'); return }
    const phoneErr = phoneError(form.phone, 'Phone number'); if (phoneErr) { setError(phoneErr); return }
    const waErr = phoneError(form.whatsapp, 'WhatsApp number', false); if (waErr) { setError(waErr); return }
    if (form.password !== form.confirm_password) { setError('Passwords do not match.'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true); setError('')
    try {
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: normalizeEmail(form.email), password: form.password,
        options: { data: { full_name: form.institution_name, role: 'institution' } }
      })
      if (authErr) throw authErr
      const res = await fetch('/api/register', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ type:'institution', user_id: authData.user?.id, ...form, email: normalizeEmail(form.email) }),
      })
      if (!res.ok) throw new Error(await res.text())
      const params = new URLSearchParams({ name: form.institution_name, tier: 'standard', type: 'institution' })
      router.push(`/register/success?${params.toString()}`)
    } catch (e: any) { setError(e.message) }
    setLoading(false)
  }

  if (success) return (
    <div style={{ minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'#fff', borderRadius:16, padding:48, maxWidth:520, textAlign:'center', border:'1.5px solid #e8e8e8' }}>
        <div style={{ fontSize:56, marginBottom:16 }}>✅</div>
        <h1 style={{ color:'#0F6E56', marginBottom:12 }}>Registration Submitted!</h1>
        <p style={{ color:'#555', lineHeight:1.7, marginBottom:16 }}>
          JazakAllah Khair! <strong>{form.institution_name}</strong> has been submitted for review. We will activate your listing within 2 business days.
        </p>
        <div style={{ background:'#E1F5EE', borderRadius:8, padding:20, textAlign:'left', marginBottom:16 }}>
          <p style={{ fontWeight:700, color:'#0F6E56', margin:'0 0 8px' }}>💳 Payment Required — R449/month</p>
          <p style={{ fontSize:14, color:'#555', margin:0 }}>Email proof of EFT payment to <strong>islamicteachersadmin@gmail.com</strong></p>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ background:'#f9f9f9', minHeight:'100vh', padding:'48px 0' }}>
      <div className="container" style={{ maxWidth:680 }}>
        <h1 style={{ color:'#0F6E56', fontSize:26, fontWeight:700, marginBottom:8 }}>Register Your Institution</h1>
        <p style={{ color:'#666', marginBottom:32 }}>List your madressa, maktab, or Islamic school on our directory. R449/month, activated after payment confirmation.</p>
        {error && <div style={{ background:'#fee', color:'#c00', padding:'12px 16px', borderRadius:8, marginBottom:20 }}>{error}</div>}
        <form onSubmit={submit}>
          <div style={{ background:'#fff', borderRadius:12, padding:28, border:'1.5px solid #e8e8e8', display:'grid', gap:20, marginBottom:20 }}>
            <h2 style={{ color:'#0F6E56', fontWeight:700, margin:0 }}>Institution Details</h2>
            {[['Institution Name','institution_name','text'],['City','city','text'],['Street Address','address','text'],['Email Address','email','email'],['Phone Number','phone','tel'],['WhatsApp Number','whatsapp','tel'],['Website (optional)','website','url']].map(([label,key,type])=>(
              <div key={key}>
                <label className="form-label">{label}{!['address','whatsapp','website'].includes(key)?' *':''}</label>
                <input type={type} className="form-input" value={(form as any)[key]} onChange={e=>set(key,e.target.value)} required={!['address','whatsapp','website'].includes(key)} />
              </div>
            ))}
            <div>
              <label className="form-label">Institution Type *</label>
              <select className="form-input" value={form.institution_type} onChange={e=>set('institution_type',e.target.value)} required>
                <option value="madressa">Madressa / Maktab</option>
                <option value="full_time_school">Full-Time Islamic School</option>
                <option value="university">Islamic University / College</option>
                <option value="online_school">Online Islamic School</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="form-label">Province *</label>
              <select className="form-input" value={form.province} onChange={e=>set('province',e.target.value)} required>
                <option value="">Select province</option>
                {PROVINCES.map(p=><option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Description</label>
              <textarea className="form-input" rows={4} value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Tell students about your institution, programmes, and ethos." style={{ resize:'vertical' }} />
            </div>
            <div>
              <label className="form-label">Subjects / Programmes Offered</label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:8, padding:12, background:'#f9f9f9', borderRadius:8 }}>
                {SUBJECTS.map(s=>(
                  <label key={s.value} style={{ display:'flex', gap:8, alignItems:'center', cursor:'pointer', fontSize:14 }}>
                    <input type="checkbox" checked={form.subjects_offered.includes(s.value)} onChange={()=>toggleSubject(s.value)} />
                    {s.label}
                  </label>
                ))}
              </div>
            </div>
            <hr style={{ border:'none', borderTop:'1px solid #eee' }} />
            <h3 style={{ color:'#0F6E56', fontWeight:700, margin:0 }}>Account Password</h3>
            {[['Password','password','password'],['Confirm Password','confirm_password','password']].map(([label,key,type])=>(
              <div key={key}>
                <label className="form-label">{label} *</label>
                <input type={type} className="form-input" required value={(form as any)[key]} onChange={e=>set(key,e.target.value)} />
              </div>
            ))}
            <div style={{ display:'grid', gap:10 }}>
              <p style={{ fontWeight:700, fontSize:14, color:'#0F6E56', margin:'0 0 4px' }}>Policies — you must read and accept all three before submitting *</p>
              {[
                { key:'privacy_consent',      label:'I have read and agree to the', link:'/privacy-policy', linkText:'Privacy Policy' },
                { key:'terms_consent',        label:'I have read and agree to the', link:'/terms',           linkText:'Terms & Conditions' },
                { key:'child_safety_consent', label:'I have read and agree to the', link:'/child-safety',    linkText:'Child Safety Policy' },
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
          <button type="submit" className="btn-gold" style={{ width:'100%', fontSize:16, padding:'14px' }} disabled={loading}>
            {loading ? 'Submitting…' : 'Submit Institution Registration'}
          </button>
        </form>
      </div>
    </div>
  )
}
