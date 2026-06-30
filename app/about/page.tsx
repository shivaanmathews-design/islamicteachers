import Link from 'next/link'

export const metadata = { title:'About IslamicTeachers.co.za' }

export default function AboutPage() {
  return (
    <div style={{ background:'#f9f9f9', minHeight:'100vh' }}>
      <div style={{ background:'#0F6E56', padding:'56px 0 40px', textAlign:'center' }}>
        <div className="container">
          <h1 style={{ color:'#fff', fontSize:32, fontWeight:700, margin:'0 0 12px' }}>About IslamicTeachers.co.za</h1>
          <p style={{ color:'#E1F5EE', fontSize:17, margin:0 }}>Connecting South African Muslim families with trusted Islamic teachers and institutions.</p>
        </div>
      </div>
      <div className="container" style={{ padding:'56px 20px', maxWidth:780 }}>
        <div style={{ background:'#fff', borderRadius:14, padding:40, border:'1.5px solid #e8e8e8', marginBottom:28 }}>
          <h2 style={{ color:'#0F6E56', fontWeight:700, marginBottom:16 }}>Our Mission</h2>
          <p style={{ fontSize:16, lineHeight:1.8, color:'#2C2C2A' }}>
            IslamicTeachers.co.za was created to make it easy for Muslim families across South Africa to find qualified, trustworthy Islamic teachers and institutions in their area.
          </p>
          <p style={{ fontSize:16, lineHeight:1.8, color:'#2C2C2A' }}>
            Whether you are looking for a Quran teacher for your child, an Arabic language tutor, or a full-time Islamic studies programme, our directory helps connect you with the right person quickly and safely.
          </p>
        </div>
        <div style={{ background:'#E1F5EE', borderRadius:14, padding:40, border:'1px solid #5DCAA5', marginBottom:28 }}>
          <h2 style={{ color:'#0F6E56', fontWeight:700, marginBottom:16 }}>Our Commitment to Child Safety</h2>
          <p style={{ fontSize:16, lineHeight:1.8, color:'#2C2C2A', marginBottom:12 }}>
            Protecting children is our highest priority. Every teacher who registers with us is manually reviewed before their listing goes live. We contact at least one reference and verify identity before approving any application.
          </p>
          <Link href="/child-safety" style={{ color:'#0F6E56', fontWeight:700, textDecoration:'none' }}>Read our full Child Safety Policy →</Link>
        </div>
        <div style={{ background:'#fff', borderRadius:14, padding:40, border:'1.5px solid #e8e8e8', marginBottom:28 }}>
          <h2 style={{ color:'#0F6E56', fontWeight:700, marginBottom:16 }}>POPIA Compliance</h2>
          <p style={{ fontSize:16, lineHeight:1.8, color:'#2C2C2A' }}>
            We take your privacy seriously. IslamicTeachers.co.za complies with the Protection of Personal Information Act 4 of 2013 (POPIA). We will never sell, rent, or trade your personal information to any third party.
          </p>
          <Link href="/privacy-policy" style={{ color:'#0F6E56', fontWeight:700, textDecoration:'none' }}>Read our Privacy Policy →</Link>
        </div>
        <div style={{ textAlign:'center', padding:'40px 20px', background:'#0F6E56', borderRadius:14 }}>
          <h2 style={{ color:'#fff', fontWeight:700, marginBottom:12 }}>Get in Touch</h2>
          <p style={{ color:'#E1F5EE', marginBottom:20 }}><a href="mailto:islamicteachersadmin@gmail.com" style={{ color:'#BA7517', fontWeight:600, textDecoration:'none' }}>islamicteachersadmin@gmail.com</a></p>
          <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
            <Link href="/contact" className="btn-gold">Contact Us</Link>
            <Link href="/register/teacher" className="btn-outline" style={{ color:'#fff', borderColor:'#fff' }}>Register as Teacher</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
