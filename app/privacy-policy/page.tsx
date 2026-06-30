export const metadata = { title:'Privacy Policy — IslamicTeachers.co.za' }

export default function PrivacyPolicyPage() {
  return (
    <div style={{ background:'#f9f9f9', minHeight:'100vh' }}>
      <div style={{ background:'#0F6E56', padding:'48px 0 32px' }}>
        <div className="container"><h1 style={{ color:'#fff', fontWeight:700, fontSize:28 }}>Privacy Policy</h1>
        <p style={{ color:'#E1F5EE', margin:'8px 0 0', fontSize:15 }}>Last updated: June 2026</p></div>
      </div>
      <div className="container" style={{ maxWidth:780, padding:'48px 20px' }}>
        <div style={{ background:'#fff', borderRadius:14, padding:40, border:'1.5px solid #e8e8e8' }}>
          {[
            ['1. Introduction',`IslamicTeachers.co.za ("we", "our", "the Platform") is operated by Mizan Institute and serves as a directory connecting students and parents with Islamic teachers and institutions across South Africa.\n\nWe are committed to protecting your privacy and complying with the Protection of Personal Information Act 4 of 2013 (POPIA). This Privacy Policy explains what information we collect, how we use it, and your rights.`],
            ['2. Our Core Promise — We Will NEVER Sell Your Information',`We will NEVER sell, rent, trade, share, or disclose your personal information to any third party for commercial purposes. Your personal details are collected only for the purpose of operating this directory and will never be monetised by sharing with advertisers, data brokers, or any other third parties.`],
            ['3. What Information We Collect','For Teachers and Institutions: Full name, contact email address, WhatsApp number, city and province, qualifications and subjects, biographical information, profile photo and video, references, and payment records.\n\nFor Students and Parents: Name and email address provided when sending an enquiry to a teacher. We do not require registration for searching.\n\nAutomatically collected: Page views, search terms, and general usage data (no personal identifiers stored in analytics).'],
            ['4. How We Use Your Information','• To create and display your teacher or institution profile\n• To connect students and parents with teachers via the enquiry system\n• To review applications and verify references\n• To send transactional emails (registration confirmation, listing approval, enquiries)\n• To send renewal reminders for paid listings\n• To comply with our legal obligations under South African law'],
            ['5. Who Can See Your Information','Public profiles (Standard and Premium): Name, city, province, subjects, session type, years of experience, hourly rate, bio, and profile photo are publicly visible.\n\nPrivate contact details: Your email address and WhatsApp number are only revealed to a student or parent after they submit an enquiry form.\n\nAdmin only: References, ID information, payment records.'],
            ['6. Children\'s Privacy','We are particularly careful about the privacy of children. We do not collect personal information from minors (under 18). If you are under 18, please have a parent or guardian submit any enquiries on your behalf.'],
            ['7. Data Security','We use Supabase (a SOC 2 compliant platform) to store all data. Passwords are hashed and never stored in plain text. Row Level Security (RLS) is enabled on all database tables. We use HTTPS encryption on all pages.'],
            ['8. Your Rights Under POPIA','Under POPIA, you have the right to: access your personal information; correct inaccurate information; request deletion of your information; object to the processing of your information; and lodge a complaint with the Information Regulator of South Africa.\n\nTo exercise any of these rights, email us at islamicteachersadmin@gmail.com.'],
            ['9. Data Retention','Teacher and institution profiles are retained for as long as the listing is active. If you request deletion, we will remove your profile within 14 business days. We retain minimal records for legal compliance for 5 years.'],
            ['10. Cookies','We use essential cookies only (authentication and session management). We do not use advertising or tracking cookies.'],
            ['11. Contact','For any privacy-related queries, contact us at islamicteachersadmin@gmail.com. For complaints, you may also contact the Information Regulator of South Africa at inforeg.org.za.'],
          ].map(([heading, body]) => (
            <div key={heading as string} style={{ marginBottom:28 }}>
              <h2 style={{ color:'#0F6E56', fontWeight:700, fontSize:18, marginBottom:12 }}>{heading}</h2>
              <p style={{ fontSize:15, lineHeight:1.8, color:'#2C2C2A', margin:0, whiteSpace:'pre-line' }}>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
