'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Nav() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<'teacher' | 'institution' | 'admin' | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) detectRole(session.user.id)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) detectRole(session.user.id)
      else setRole(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function detectRole(uid: string) {
    if (process.env.NEXT_PUBLIC_ADMIN_EMAIL && uid) {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (u?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) { setRole('admin'); return }
    }
    const { data: t } = await supabase.from('teachers').select('id').eq('user_id', uid).single()
    if (t) { setRole('teacher'); return }
    const { data: i } = await supabase.from('institutions').select('id').eq('user_id', uid).single()
    if (i) { setRole('institution'); return }
  }

  const dashLink = role === 'admin' ? '/admin'
    : role === 'institution' ? '/dashboard/institution'
    : '/dashboard/teacher'

  const links = [
    { href: '/', label: 'Home' },
    { href: '/find-a-teacher', label: 'Find a Teacher' },
    { href: '/register/teacher', label: 'Register as Teacher' },
    { href: '/register/institution', label: 'Register Institution' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/blog', label: 'Blog' },
    { href: '/workshops', label: 'Workshops' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <nav className="sticky top-0 z-50 shadow-md" style={{ background: '#0F6E56' }}>
      <div className="container" style={{ padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>

        {/* Desktop logo — left, links to homepage */}
        <Link href="/" className="hidden md:block no-underline" style={{ position: 'absolute', left: 20 }}>
          <img src="/logo.png" alt="IslamicTeachers.co.za — Home" style={{ height: 40, width: 'auto', objectFit: 'contain', borderRadius: 8, background: '#fff', padding: 4 }} />
        </Link>

        {/* Desktop links — centred */}
        <div className="hidden md:flex items-center gap-5" style={{ fontSize: 13 }}>
          {links.map(l => (
            <Link key={l.href} href={l.href}
              style={{ color: pathname === l.href ? '#E1F5EE' : '#ffffff', fontSize: 14, fontWeight: 500, textDecoration: 'none', opacity: pathname === l.href ? 1 : 0.85 }}
            >{l.label}</Link>
          ))}
        </div>

        {/* Login/Dashboard — right side */}
        <div className="hidden md:flex items-center gap-3" style={{ position: 'absolute', right: 20 }}>
          {user ? (
            <>
              <Link href={dashLink} className="btn-gold" style={{ padding: '7px 16px', fontSize: 13 }}>Dashboard</Link>
              <button onClick={() => supabase.auth.signOut()}
                style={{ color: '#E1F5EE', background: 'transparent', border: '1px solid #5DCAA5', borderRadius: 6, padding: '6px 12px', fontSize: 13, cursor: 'pointer' }}>
                Sign out
              </button>
            </>
          ) : (
            <Link href="/login" className="btn-gold" style={{ padding: '7px 16px', fontSize: 13 }}>Login</Link>
          )}
        </div>

        {/* Mobile: logo left + hamburger right */}
        <Link href="/" className="md:hidden no-underline" style={{ position: 'absolute', left: 20 }}>
          <img src="/logo.png" alt="IslamicTeachers.co.za" style={{ height: 40, width: 'auto', objectFit: 'contain', borderRadius: 8, background: '#fff', padding: 4 }} />
        </Link>
        <button className="md:hidden" onClick={() => setOpen(!open)}
          style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, position: 'absolute', right: 20 }}>
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ background: '#0a5540', padding: '12px 20px 20px' }}>
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              style={{ display: 'block', color: '#fff', padding: '10px 0', fontSize: 15, textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              {l.label}
            </Link>
          ))}
          {user
            ? <Link href={dashLink} className="btn-gold" style={{ display: 'block', textAlign: 'center', marginTop: 12 }}>Dashboard</Link>
            : <Link href="/login" className="btn-gold" style={{ display: 'block', textAlign: 'center', marginTop: 12 }}>Login</Link>
          }
        </div>
      )}
    </nav>
  )
}
