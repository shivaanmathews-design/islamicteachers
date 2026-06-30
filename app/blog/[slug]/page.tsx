import { createServiceClient } from '@/lib/supabase'
import type { BlogPost } from '@/lib/types'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const db = createServiceClient()
  const { data: p } = await db.from('blog_posts').select('title,excerpt').eq('slug', slug).eq('published', true).single()
  if (!p) return { title: 'Article Not Found' }
  return {
    title: `${p.title} | IslamicTeachers.co.za Blog`,
    description: p.excerpt || `${p.title} — IslamicTeachers.co.za`,
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const db = createServiceClient()
  const { data } = await db.from('blog_posts').select('*').eq('slug', slug).eq('published', true).single()
  if (!data) notFound()
  const post = data as BlogPost
  const paragraphs = (post.content || '').split(/\n{2,}/).filter(Boolean)

  return (
    <div style={{ background:'#f9f9f9', minHeight:'100vh' }}>
      <div className="container" style={{ maxWidth:760, padding:'40px 20px' }}>
        <Link href="/blog" style={{ color:'#0F6E56', fontSize:14, fontWeight:600, textDecoration:'none' }}>← Back to Blog</Link>

        <article style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e8e8e8', overflow:'hidden', marginTop:16 }}>
          {post.cover_image_url && (
            <img src={post.cover_image_url} alt={post.title} style={{ width:'100%', maxHeight:380, objectFit:'cover' }} />
          )}
          <div style={{ padding:'32px 36px' }}>
            <h1 style={{ color:'#0F6E56', fontSize:30, fontWeight:700, margin:'0 0 12px', lineHeight:1.3 }}>{post.title}</h1>
            <p style={{ fontSize:13, color:'#888', margin:'0 0 24px' }}>
              {post.author || 'IslamicTeachers.co.za'} · {new Date(post.created_at).toLocaleDateString('en-ZA', { day:'numeric', month:'long', year:'numeric' })}
            </p>
            {paragraphs.map((para, i) => (
              <p key={i} style={{ color:'#2C2C2A', fontSize:16, lineHeight:1.8, margin:'0 0 18px', whiteSpace:'pre-wrap' }}>{para}</p>
            ))}
          </div>
        </article>
      </div>
    </div>
  )
}
