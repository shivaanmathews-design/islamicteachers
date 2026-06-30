'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { normalizeEmail } from '@/lib/validation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [mode, setMode] = useState<'login'|'reset'>('login')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error: err, data } = await supabase.auth.signInWithPassword({ email: normalizeEmail(email), password })
    if (err) { setError(err.message); setLoading(false); return }

    // Detect role and redirect
    const uid = data.user?.id
    if (uid) {
      if (data.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        router.push('/admin')
      } else {
        const { data: t } = await supabase.from('teachers').select('id').eq('user_id', uid).single()
        if (t) { router.push('/dashboard/teacher') }
        else { router.push('/dashboard/institution') }
      }
    }
    setLoading(false)
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error: err } = await supabase.auth.resetPasswordForEmail(normalizeEmail(email), {
      redirectTo: `${window.location.origin}/login`,
    })
    if (err) { setError(err.message) } else { setResetSent(true) }
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f9f9f9', padding:20 }}>
      <div style={{ background:'#fff', borderRadius:16, padding:40, maxWidth:420, width:'100%', border:'1.5px solid #e8e8e8' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ background:'#0F6E56', borderRadius:10, padding:'8px 16px', display:'inline-block', marginBottom:16 }}>
            <span style={{ color:'#fff', fontWeight:700, fontSize:15 }}>IT</span>
          </div>
          <h1 style={{ color:'#0F6E56', fontSize:22, fontWeight:700, margin:'0 0 6px' }}>
            {mode === 'login' ? 'Welcome back' : 'Reset Password'}
          </h1>
          <p style={{ color:'#888', fontSize:14, margin:0 }}>IslamicTeachers.co.za</p>
        </div>

        {error && <div style={{ background:'#fee', color:'#c00', padding:'12px 16px', borderRadius:8, marginBottom:20, fontSize:14 }}>{error}</div>}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} style={{ display:'grid', gap:16 }}>
            <div>
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input type="password" className="form-input" required value={password} onChange={e=>setPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn-teal" style={{ marginTop:4 }} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>

            <div style={{ display:'flex', alignItems:'center', gap:12, margin:'4px 0' }}>
              <div style={{ flex:1, height:1, background:'#eee' }} />
              <span style={{ fontSize:12, color:'#aaa' }}>or</span>
              <div style={{ flex:1, height:1, background:'#eee' }} />
            </div>

            <button type="button"
              onClick={async () => {
                await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: { redirectTo: `${window.location.origin}/auth/callback` }
                })
              }}
              style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, background:'#fff', border:'1.5px solid #ddd', borderRadius:8, padding:'10px 16px', fontSize:14, fontWeight:600, color:'#333', cursor:'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div style={{ textAlign:'center', fontSize:13, color:'#888', marginTop:4 }}>
              <button type="button" onClick={()=>setMode('reset')} style={{ background:'none', border:'none', color:'#0F6E56', cursor:'pointer', fontSize:13 }}>
                Forgot your password?
              </button>
            </div>
          </form>
        ) : resetSent ? (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>📧</div>
            <p style={{ color:'#555', lineHeight:1.7 }}>Password reset email sent to <strong>{email}</strong>. Check your inbox.</p>
            <button onClick={()=>{ setMode('login'); setResetSent(false) }} className="btn-outline" style={{ marginTop:16 }}>Back to Login</button>
          </div>
        ) : (
          <form onSubmit={handleReset} style={{ display:'grid', gap:16 }}>
            <div>
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" />
            </div>
            <button type="submit" className="btn-teal" disabled={loading}>{loading?'Sending…':'Send Reset Link'}</button>
            <button type="button" onClick={()=>setMode('login')} style={{ background:'none', border:'none', color:'#0F6E56', cursor:'pointer', fontSize:13, textAlign:'center' }}>
              ← Back to Login
            </button>
          </form>
        )}

        <div style={{ borderTop:'1px solid #eee', marginTop:28, paddingTop:20, textAlign:'center', fontSize:13, color:'#888' }}>
          Don't have an account?{' '}
          <Link href="/register/teacher" style={{ color:'#0F6E56', fontWeight:600, textDecoration:'none' }}>Register as Teacher</Link>
          {' or '}
          <Link href="/register/institution" style={{ color:'#0F6E56', fontWeight:600, textDecoration:'none' }}>Register Institution</Link>
        </div>
      </div>
    </div>
  )
}
