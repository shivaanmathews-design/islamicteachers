'use client'
import { useState } from 'react'

export default function ContactPage() {
  const [form, setForm] = useState({ name:'', email:'', subject:'', message:'' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    // Simple mailto fallback — can be replaced with API route + Resend
    window.location.href = `mailto:islamicteachersadmin@gmail.com?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)}`
    setSent(true)
    setLoading(false)
  }

  return (
    <div style={{ background:'#f9f9f9', minHeight:'100vh' }}>
      <div style={{ background:'#0F6E56', padding:'56px 0 40px', textAlign:'center' }}>
        <div className="container">
          <h1 style={{ color:'#fff', fontSize:32, fontWeight:700, margin:'0 0 12px' }}>Contact Us</h1>
          <p style={{ color:'#E1F5EE', margin:0 }}>We'd love to hear from you.</p>
        </div>
      </div>
      <div className="container" style={{ padding:'56px 20px', maxWidth:680 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginBottom:36 }}>
          {[
            { icon:'📧', label:'Email', value:'islamicteachersadmin@gmail.com' },
            { icon:'⏰', label:'Response Time', value:'1-2 business days' },
          ].map(c=>(
            <div key={c.label} style={{ background:'#fff', borderRadius:10, padding:24, border:'1.5px solid #e8e8e8', textAlign:'center' }}>
              <div style={{ fontSize:32, marginBottom:8 }}>{c.icon}</div>
              <p style={{ fontWeight:700, color:'#0F6E56', margin:'0 0 4px' }}>{c.label}</p>
              <p style={{ fontSize:14, color:'#555', margin:0 }}>{c.value}</p>
            </div>
          ))}
        </div>

        <div style={{ background:'#fff', borderRadius:14, padding:36, border:'1.5px solid #e8e8e8' }}>
          <h2 style={{ color:'#0F6E56', fontWeight:700, marginBottom:24 }}>Send us a Message</h2>
          {sent ? (
            <div style={{ textAlign:'center', padding:'20px 0' }}>
              <div style={{ fontSize:48, marginBottom:12 }}>📬</div>
              <p style={{ color:'#0F6E56', fontWeight:700 }}>Opening your email client…</p>
              <p style={{ color:'#888', fontSize:14 }}>Alternatively, email us directly at islamicteachersadmin@gmail.com</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display:'grid', gap:16 }}>
              {[['Name','name','text'],['Email','email','email'],['Subject','subject','text']].map(([label,key,type])=>(
                <div key={key}>
                  <label className="form-label">{label} *</label>
                  <input type={type} className="form-input" required value={(form as any)[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} />
                </div>
              ))}
              <div>
                <label className="form-label">Message *</label>
                <textarea className="form-input" rows={5} required value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} style={{ resize:'vertical' }} />
              </div>
              <button type="submit" className="btn-teal" disabled={loading}>{loading?'Opening…':'Send Message'}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
