import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'IslamicTeachers.co.za — Find Trusted Islamic Teachers in South Africa',
  description: 'Search hundreds of verified Islamic teachers across South Africa. Find Quran, Tajweed, Hifz, Arabic, and Islamic Studies teachers near you. Free for students and parents.',
  openGraph: {
    title: 'IslamicTeachers.co.za',
    description: 'Find trusted Islamic teachers in South Africa.',
    url: 'https://islamicteachers.co.za',
    siteName: 'IslamicTeachers.co.za',
    locale: 'en_ZA',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div style={{ background:'#BA7517', color:'#fff', textAlign:'center', padding:'10px 16px', fontSize:13, fontWeight:600, position:'sticky', top:0, zIndex:1000 }}>
          🚧 This website is currently under development. Some features may not be fully available yet.
        </div>
        <Nav />
        <main>{children}</main>
        <Footer />
        <a
          href="https://wa.me/27741061100"
          target="_blank" rel="noopener noreferrer"
          style={{ position:'fixed',bottom:24,right:24,zIndex:999,background:'#25D366',color:'#fff',borderRadius:'50%',width:56,height:56,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 16px rgba(0,0,0,0.2)',textDecoration:'none',fontSize:28 }}
          aria-label="Chat on WhatsApp">💬</a>
      </body>
    </html>
  )
}
