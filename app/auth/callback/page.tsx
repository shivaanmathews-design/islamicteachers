'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        subscription.unsubscribe()
        const uid = session.user.id
        const email = session.user.email

        if (email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
          router.push('/admin')
          return
        }

        const { data: t } = await supabase.from('teachers').select('id').eq('user_id', uid).single()
        if (t) { router.push('/dashboard/teacher'); return }

        const { data: i } = await supabase.from('institutions').select('id').eq('user_id', uid).single()
        if (i) { router.push('/dashboard/institution'); return }

        router.push('/register/teacher')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  return (
    <div style={{ textAlign: 'center', padding: 80, color: '#0F6E56' }}>
      <p style={{ fontSize: 18, fontWeight: 600 }}>Signing you in…</p>
    </div>
  )
}
