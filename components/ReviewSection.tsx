'use client'
import { useState } from 'react'

interface Review {
  id: string
  reviewer_name: string
  rating: number
  comment: string
  created_at: string
}

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span style={{ color:'#BA7517', fontSize:size, letterSpacing:1 }}>
      {'★'.repeat(rating)}{'☆'.repeat(5-rating)}
    </span>
  )
}

export default function ReviewSection({ teacherId, reviews }: { teacherId: string; reviews: Review[] }) {
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name:'', email:'', rating:5, comment:'' })

  const avg = reviews.length ? (reviews.reduce((a,r)=>a+r.rating,0)/reviews.length).toFixed(1) : null

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name) { setError('Name is required'); return }
    if (!form.comment) { setError('Please write a review'); return }
    setLoading(true); setError('')
    const res = await fetch('/api/reviews', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ teacher_id: teacherId, ...form }),
    })
    if (!res.ok) { setError('Failed to submit. Please try again.'); setLoading(false); return }
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div style={{ background:'#fff', borderRadius:12, padding:28, marginTop:20, border:'1.5px solid #e8e8e8' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={{ color:'#0F6E56', fontSize:18, fontWeight:700, margin:'0 0 4px' }}>Student Reviews</h2>
          {avg ? (
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <Stars rating={Math.round(Number(avg))} size={18} />
              <span style={{ fontWeight:700, color:'#2C2C2A' }}>{avg}</span>
              <span style={{ color:'#888', fontSize:13 }}>({reviews.length} review{reviews.length!==1?'s':''})</span>
            </div>
          ) : (
            <p style={{ color:'#888', fontSize:14, margin:0 }}>No reviews yet. Be the first!</p>
          )}
        </div>
        {!showForm && !submitted && (
          <button onClick={()=>setShowForm(true)} className="btn-gold" style={{ fontSize:14, padding:'10px 20px' }}>
            ✍️ Leave a Review
          </button>
        )}
      </div>

      {/* Existing reviews */}
      {reviews.length > 0 && (
        <div style={{ display:'grid', gap:16, marginBottom:24 }}>
          {reviews.map(r => (
            <div key={r.id} style={{ padding:20, background:'#f9f9f9', borderRadius:8, border:'1px solid #e8e8e8' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                <div>
                  <span style={{ fontWeight:700, color:'#2C2C2A', fontSize:15 }}>{r.reviewer_name}</span>
                  <div><Stars rating={r.rating} /></div>
                </div>
                <span style={{ fontSize:12, color:'#aaa' }}>
                  {new Date(r.created_at).toLocaleDateString('en-ZA',{ year:'numeric', month:'short', day:'numeric' })}
                </span>
              </div>
              <p style={{ margin:0, fontSize:14, color:'#555', lineHeight:1.7 }}>{r.comment}</p>
            </div>
          ))}
        </div>
      )}

      {/* Submitted state */}
      {submitted && (
        <div style={{ background:'#E1F5EE', borderRadius:8, padding:20, textAlign:'center', border:'1.5px solid #5DCAA5' }}>
          <p style={{ margin:0, color:'#0F6E56', fontWeight:700 }}>✅ Thank you for your review!</p>
          <p style={{ margin:'8px 0 0', fontSize:13, color:'#555' }}>Your review will appear after our team approves it (usually within 24 hours).</p>
        </div>
      )}

      {/* Review form */}
      {showForm && !submitted && (
        <form onSubmit={submit} style={{ background:'#f9f9f9', borderRadius:8, padding:24, border:'1.5px solid #e8e8e8' }}>
          <h3 style={{ color:'#0F6E56', fontSize:16, fontWeight:700, marginBottom:20 }}>Write a Review</h3>
          {error && <div style={{ background:'#fee', color:'#c00', padding:'10px 14px', borderRadius:6, marginBottom:16, fontSize:13 }}>{error}</div>}

          <div style={{ display:'grid', gap:16 }}>
            <div>
              <label className="form-label">Your Name *</label>
              <input className="form-input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Parent of student" />
            </div>
            <div>
              <label className="form-label">Email (not published)</label>
              <input className="form-input" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="For verification only" />
            </div>
            <div>
              <label className="form-label">Rating *</label>
              <div style={{ display:'flex', gap:8 }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" onClick={()=>setForm(f=>({...f,rating:n}))}
                    style={{ fontSize:28, background:'none', border:'none', cursor:'pointer', color:n<=form.rating?'#BA7517':'#ccc', padding:0, lineHeight:1 }}>
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="form-label">Your Review *</label>
              <textarea className="form-input" rows={4} value={form.comment} onChange={e=>setForm(f=>({...f,comment:e.target.value}))}
                placeholder="Share your experience with this teacher..." style={{ resize:'vertical' }} />
            </div>
            <p style={{ fontSize:12, color:'#888', margin:0 }}>Reviews are moderated before appearing publicly.</p>
            <div style={{ display:'flex', gap:12 }}>
              <button type="submit" className="btn-gold" disabled={loading} style={{ fontSize:14 }}>
                {loading?'Submitting…':'Submit Review'}
              </button>
              <button type="button" onClick={()=>setShowForm(false)} className="btn-outline" style={{ fontSize:14 }}>Cancel</button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
