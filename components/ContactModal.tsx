'use client'
import { useState } from 'react'
import type { Teacher } from '@/lib/types'

export default function ContactModal({ teacher }: { teacher: Teacher }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacher_id: teacher.id, enquirer_name: name, enquirer_email: email, message: msg }),
    })
    setSent(true)
    setLoading(false)
  }

  return (
    <>
      <div style={{ background:'#fff', borderRadius:12, padding:24, border:'1.5px solid #e8e8e8' }}>
        <h3 style={{ color:'#0F6E56', fontWeight:700, marginBottom:8, fontSize:18 }}>Contact {teacher.full_name}</h3>
        <p style={{ fontSize:14, color:'#666', marginBottom:20 }}>
          Send an enquiry to get their WhatsApp and email.
        </p>
        <button onClick={() => setOpen(true)} className="btn-gold" style={{ width:'100%' }}>
          📩 Send Enquiry
        </button>
      </div>

      {open && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}>
          <div style={{ background:'#fff', borderRadius:12, padding:32, maxWidth:480, width:'100%', position:'relative' }}>
            <button onClick={() => setOpen(false)}
              style={{ position:'absolute', top:16, right:16, background:'none', border:'none', fontSize:20, cursor:'pointer', color:'#888' }}>✕</button>

            {sent ? (
              <div style={{ textAlign:'center', padding:'20px 0' }}>
                <div style={{ fontSize:48, marginBottom:16 }}>✅</div>
                <h3 style={{ color:'#0F6E56', marginBottom:8 }}>Enquiry sent!</h3>
                <p style={{ color:'#555', marginBottom:16 }}>
                  {teacher.full_name} will be in touch soon.
                </p>
                <div style={{ background:'#E1F5EE', borderRadius:8, padding:16, marginBottom:16 }}>
                  <p style={{ margin:'0 0 6px', fontSize:14, fontWeight:600, color:'#0F6E56' }}>Contact details:</p>
                  <p style={{ margin:'0 0 4px', fontSize:14 }}>📧 {teacher.email}</p>
                  <p style={{ margin:0, fontSize:14 }}>💬 {teacher.whatsapp}</p>
                </div>
                <button onClick={() => setOpen(false)} className="btn-teal">Done</button>
              </div>
            ) : (
              <form onSubmit={handleSend}>
                <h3 style={{ color:'#0F6E56', marginBottom:20 }}>Contact {teacher.full_name}</h3>
                <div style={{ marginBottom:16 }}>
                  <label className="form-label">Your Name *</label>
                  <input className="form-input" required value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
                </div>
                <div style={{ marginBottom:16 }}>
                  <label className="form-label">Your Email *</label>
                  <input type="email" className="form-input" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
                </div>
                <div style={{ marginBottom:20 }}>
                  <label className="form-label">Message (optional)</label>
                  <textarea className="form-input" rows={3} value={msg} onChange={e => setMsg(e.target.value)}
                    placeholder="Tell the teacher what subject you need help with, your level, and preferred schedule." style={{ resize:'vertical' }} />
                </div>
                <p style={{ fontSize:12, color:'#888', marginBottom:16 }}>
                  By sending this enquiry you agree to our{' '}
                  <a href="/privacy-policy" style={{ color:'#0F6E56' }}>Privacy Policy</a>.
                </p>
                <button type="submit" className="btn-gold" style={{ width:'100%' }} disabled={loading}>
                  {loading ? 'Sending…' : 'Send Enquiry & View Contact Details'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
