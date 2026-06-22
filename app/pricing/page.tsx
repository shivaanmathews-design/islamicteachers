import Link from 'next/link'

const tiers = [
  { id:'free', name:'Free', price:'R0', period:'forever', features:['Basic listing in search results','Province, city & subjects shown','Profile visible to students','No photo or bio displayed','No contact button (phone/WhatsApp shown on request)'], cta:'Register Free', href:'/register/teacher', highlight:false },
  { id:'standard', name:'Standard', price:'R99', period:'per month', features:['Everything in Free','Profile photo uploaded','Full bio about yourself','Contact button (WhatsApp & email shown to enquirers)','Years of experience & qualifications shown','Dashboard to manage your profile'], cta:'Get Standard', href:'/register/teacher', highlight:false },
  { id:'premium', name:'Premium', price:'R179', period:'per month', features:['Everything in Standard','⭐ Featured badge on your listing','Priority placement at the top of search results','2-minute video introduction uploaded','Higher visibility = more enquiries'], cta:'Get Premium', href:'/register/teacher', highlight:true },
  { id:'institution', name:'Institution', price:'R449', period:'per month', features:['Dedicated institution profile page','Logo and full description','List all subjects and programmes offered','Teacher directory (link teachers to institution)','Full contact details and website link','Admin dashboard'], cta:'Register Institution', href:'/register/institution', highlight:false },
]

export default function PricingPage() {
  return (
    <div style={{ background:'#f9f9f9', minHeight:'100vh' }}>
      {/* Header */}
      <div style={{ background:'#0F6E56', padding:'56px 0 40px', textAlign:'center' }}>
        <div className="container">
          <h1 style={{ color:'#fff', fontSize:32, fontWeight:700, margin:'0 0 16px' }}>Simple, Transparent Pricing</h1>
          <p style={{ color:'#E1F5EE', fontSize:17, margin:0 }}>Searching is always free for students and parents. Register your listing today.</p>
        </div>
      </div>

      <div className="container" style={{ padding:'48px 20px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:24, maxWidth:1100, margin:'0 auto' }}>
          {tiers.map(t=>(
            <div key={t.id} style={{ background:'#fff', borderRadius:14, border: t.highlight?'2.5px solid #BA7517':'1.5px solid #e8e8e8',
              padding:32, position:'relative', boxShadow: t.highlight?'0 8px 32px rgba(186,117,23,0.12)':'none' }}>
              {t.highlight && <div style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)',
                background:'#BA7517', color:'#fff', fontSize:11, fontWeight:700, padding:'4px 16px', borderRadius:20 }}>MOST POPULAR</div>}
              <h2 style={{ color:'#0F6E56', fontWeight:700, fontSize:20, margin:'0 0 4px' }}>{t.name}</h2>
              <div style={{ marginBottom:20 }}>
                <span style={{ fontSize:32, fontWeight:700, color:'#BA7517' }}>{t.price}</span>
                <span style={{ fontSize:14, color:'#888', marginLeft:6 }}>{t.period}</span>
              </div>
              <ul style={{ paddingLeft:0, listStyle:'none', margin:'0 0 28px' }}>
                {t.features.map(f=>(
                  <li key={f} style={{ display:'flex', gap:10, marginBottom:10, fontSize:14, color:'#555', alignItems:'flex-start' }}>
                    <span style={{ color:'#0F6E56', fontWeight:700, marginTop:1 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={t.href} className={t.highlight?'btn-gold':'btn-teal'} style={{ display:'block', textAlign:'center' }}>{t.cta}</Link>
            </div>
          ))}
        </div>

        {/* EFT note */}
        <div style={{ background:'#E1F5EE', border:'1.5px solid #5DCAA5', borderRadius:12, padding:28, maxWidth:640, margin:'48px auto 0', textAlign:'center' }}>
          <h3 style={{ color:'#0F6E56', fontWeight:700, marginBottom:12 }}>💳 Payment by EFT</h3>
          <p style={{ fontSize:15, color:'#555', lineHeight:1.7, margin:'0 0 12px' }}>
            We currently accept payment via EFT (Electronic Funds Transfer). After registering, you'll receive our banking details by email.
            Your listing goes live within <strong>2 business days</strong> of payment confirmation.
          </p>
          <p style={{ fontSize:14, color:'#888', margin:0 }}>Questions? Email <strong>admin@islamicteachers.co.za</strong></p>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth:640, margin:'48px auto 0' }}>
          <h2 style={{ color:'#0F6E56', fontWeight:700, fontSize:22, marginBottom:28, textAlign:'center' }}>Frequently Asked Questions</h2>
          {[
            ['Is it really free to search?','Yes, completely free. Students and parents can browse, filter, and view all teacher profiles with no registration required.'],
            ['Can I cancel my subscription?','Yes, contact admin@islamicteachers.co.za at any time to cancel. Your listing will remain active until the end of the current billing period.'],
            ['How long does approval take?','We aim to review all applications within 2 business days. We will contact your references before approving.'],
            ['Can I upgrade from Free to Standard or Premium?','Yes, simply email us to request an upgrade and make an EFT payment.'],
            ['Is there a once-off registration fee?','The amount shown is the first month\'s payment. There is no separate registration fee.'],
          ].map(([q,a])=>(
            <div key={q} style={{ marginBottom:20, padding:'20px 24px', background:'#fff', borderRadius:10, border:'1.5px solid #e8e8e8' }}>
              <p style={{ fontWeight:700, color:'#0F6E56', margin:'0 0 8px', fontSize:15 }}>{q}</p>
              <p style={{ fontSize:14, color:'#555', margin:0, lineHeight:1.7 }}>{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
