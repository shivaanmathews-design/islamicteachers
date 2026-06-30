import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ background: '#0F6E56', color: '#fff', padding: '48px 0 24px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 40 }}>
          <div>
            <Link href="/" style={{ display: 'inline-block', textDecoration: 'none', fontWeight: 700, fontSize: 16, marginBottom: 8, letterSpacing: 0.5, color: '#fff' }}>
              ISLAMICTEACHERS<span style={{ color: '#5DCAA5' }}>.CO.ZA</span>
            </Link>
            <p style={{ color: '#E1F5EE', fontSize: 14, margin: '0 0 16px' }}>
              Find trusted Islamic teachers and institutions across South Africa.
            </p>
            <a href="mailto:islamicteachersadmin@gmail.com" style={{ color: '#5DCAA5', fontSize: 13, margin: 0, textDecoration: 'underline', fontWeight: 600 }}>islamicteachersadmin@gmail.com</a>
          </div>
          <div>
            <h4 style={{ color: '#5DCAA5', fontSize: 13, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>For Students</h4>
            {[['Find a Teacher', '/find-a-teacher'], ['Quran Teachers', '/quran-teachers'], ['Arabic Teachers', '/arabic-language-teachers'], ['Tajweed Teachers', '/tajweed-teachers']].map(([l, h]) => (
              <Link key={h} href={h} style={{ display: 'block', color: '#E1F5EE', fontSize: 14, textDecoration: 'none', marginBottom: 8, opacity: 0.85 }}>{l}</Link>
            ))}
          </div>
          <div>
            <h4 style={{ color: '#5DCAA5', fontSize: 13, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>For Teachers</h4>
            {[['Register as Teacher', '/register/teacher'], ['Register Institution', '/register/institution'], ['Pricing', '/pricing'], ['Login', '/login']].map(([l, h]) => (
              <Link key={h} href={h} style={{ display: 'block', color: '#E1F5EE', fontSize: 14, textDecoration: 'none', marginBottom: 8, opacity: 0.85 }}>{l}</Link>
            ))}
          </div>
          <div>
            <h4 style={{ color: '#5DCAA5', fontSize: 13, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Info</h4>
            {[['About Us', '/about'], ['Contact', '/contact'], ['Privacy Policy', '/privacy-policy'], ['Terms & Conditions', '/terms'], ['Child Safety Policy', '/child-safety']].map(([l, h]) => (
              <Link key={h} href={h} style={{ display: 'block', color: '#E1F5EE', fontSize: 14, textDecoration: 'none', marginBottom: 8, opacity: 0.85 }}>{l}</Link>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ color: '#5DCAA5', fontSize: 13, margin: 0 }}>© 2026 IslamicTeachers.co.za — Free for students and parents</p>
          <div style={{ display: 'flex', gap: 16 }}>
            {['Facebook', 'Instagram', 'WhatsApp'].map(s => (
              <span key={s} style={{ color: '#E1F5EE', fontSize: 13, cursor: 'pointer', opacity: 0.75 }}>{s}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
