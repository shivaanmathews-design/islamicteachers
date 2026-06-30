import { createServiceClient } from '@/lib/supabase'
import type { BlogPost } from '@/lib/types'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Blog — Islamic Education Articles & Tips | IslamicTeachers.co.za',
  description: 'Articles, advice and stories on Quran, Tajweed, Hifz, Arabic and Islamic studies for South African families and teachers.',
}

export default async function BlogPage() {
  const db = createServiceClient()
  const { data } = await db.from('blog_posts').select('*').eq('published', true).order('created_at', { ascending: false })
  const posts = (data || []) as BlogPost[]

  return (
    <div style={{ background:'#f9f9f9', minHeight:'100vh' }}>
      <div style={{ background:'#0F6E56', padding:'48px 0' }}>
        <div className="container" style={{ textAlign:'center' }}>
          <h1 style={{ color:'#fff', fontSize:32, fontWeight:700, margin:'0 0 8px' }}>Blog</h1>
          <p style={{ color:'#E1F5EE', fontSize:16, margin:0 }}>Articles, advice and stories on Islamic education in South Africa.</p>
        </div>
      </div>

      <div className="container" style={{ padding:'40px 20px' }}>
        {posts.length === 0 ? (
          <div style={{ background:'#fff', borderRadius:12, padding:48, textAlign:'center', border:'1.5px solid #e8e8e8' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>✍️</div>
            <p style={{ color:'#0F6E56', fontWeight:700, fontSize:18, margin:'0 0 6px' }}>No articles yet</p>
            <p style={{ color:'#888', margin:0 }}>Check back soon — new articles are on the way.</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:24 }}>
            {posts.map(p => (
              <Link key={p.id} href={`/blog/${p.slug}`} style={{ textDecoration:'none' }}>
                <article style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e8e8e8', overflow:'hidden', height:'100%', display:'flex', flexDirection:'column' }}>
                  {p.cover_image_url
                    ? <img src={p.cover_image_url} alt={p.title} style={{ width:'100%', height:180, objectFit:'cover' }} />
                    : <div style={{ width:'100%', height:180, background:'#E1F5EE', display:'flex', alignItems:'center', justifyContent:'center', fontSize:40 }}>📖</div>}
                  <div style={{ padding:'20px 22px', display:'flex', flexDirection:'column', flex:1 }}>
                    <p style={{ fontSize:12, color:'#888', margin:'0 0 8px' }}>{new Date(p.created_at).toLocaleDateString('en-ZA', { day:'numeric', month:'long', year:'numeric' })}</p>
                    <h2 style={{ color:'#0F6E56', fontSize:18, fontWeight:700, margin:'0 0 8px', lineHeight:1.4 }}>{p.title}</h2>
                    {p.excerpt && <p style={{ color:'#555', fontSize:14, lineHeight:1.6, margin:'0 0 12px', flex:1 }}>{p.excerpt}</p>}
                    <span style={{ color:'#BA7517', fontSize:14, fontWeight:600, marginTop:'auto' }}>Read more →</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
