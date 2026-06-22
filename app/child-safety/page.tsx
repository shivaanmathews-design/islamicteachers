import Link from 'next/link'

export const metadata = { title:'Child Safety Policy — IslamicTeachers.co.za' }

export default function ChildSafetyPage() {
  return (
    <div style={{ background:'#f9f9f9', minHeight:'100vh' }}>
      <div style={{ background:'#0F6E56', padding:'48px 0 32px' }}>
        <div className="container">
          <h1 style={{ color:'#fff', fontWeight:700, fontSize:28 }}>Child Safety Policy</h1>
          <p style={{ color:'#E1F5EE', margin:'8px 0 0', fontSize:15 }}>Last updated: June 2026</p>
        </div>
      </div>
      <div className="container" style={{ maxWidth:780, padding:'48px 20px' }}>
        <div style={{ background:'#fee', border:'2px solid #c00', borderRadius:12, padding:24, marginBottom:28, textAlign:'center' }}>
          <p style={{ fontWeight:700, color:'#c00', fontSize:18, margin:'0 0 8px' }}>⚠️ Emergency Contacts</p>
          <p style={{ fontSize:15, color:'#444', margin:'0 0 4px' }}>South African Police Service (SAPS): <strong>10111</strong></p>
          <p style={{ fontSize:15, color:'#444', margin:'0 0 4px' }}>Childline South Africa: <strong>116</strong> (free, 24/7)</p>
          <p style={{ fontSize:15, color:'#444', margin:0 }}>Report to us: <strong>admin@islamicteachers.co.za</strong> — Subject: CHILD SAFETY REPORT — [Name]</p>
        </div>

        <div style={{ background:'#fff', borderRadius:14, padding:40, border:'1.5px solid #e8e8e8' }}>
          {[
            ['Our Commitment','The safety of children is our highest priority. IslamicTeachers.co.za is committed to creating a safe environment where Muslim families can find trustworthy Islamic teachers with confidence. We take a zero-tolerance approach to child abuse, exploitation, or inappropriate conduct of any kind.'],
            ['Teacher Verification Process','Every teacher on our platform is manually reviewed before their listing goes live.\n\nStep 1 — Identity Verification: We require the teacher\'s full name, contact details, and city of residence. Suspicious or inconsistent information results in immediate rejection.\n\nStep 2 — Reference Check: We require at least two references (name, relationship, phone number). We contact at least one reference and may contact both before approving. References from parents of former students are given priority.\n\nStep 3 — Qualification Check: We review any qualifications stated in the application. Unverified extraordinary claims are flagged.\n\nStep 4 — Manual Admin Review: Every application is reviewed by our admin team. We may ask for additional information or documents before approving.'],
            ['Warning Signs — Parents Should Watch For','• A teacher who insists on meeting your child alone without a parent or guardian present\n• Excessive gifting, special attention, or "grooming" behaviour toward your child\n• Communication with your child via private channels not known to parents\n• Requests for photos or personal details outside of normal educational contexts\n• Any physical, emotional, or sexual contact that makes your child uncomfortable\n• A teacher who discourages your child from talking to parents about lessons'],
            ['Mandatory Reporting Obligations','In terms of the Children\'s Act 38 of 2005, anyone who has reasonable grounds to believe that a child is being abused or neglected is required to report it to the South African Police Service (SAPS) or a designated child protection organisation.\n\nIslamicTeachers.co.za will cooperate fully with any investigation by SAPS, social services, or child protection authorities.'],
            ['How to Report to Us','If you have concerns about any teacher listed on this platform:\n\n1. Email admin@islamicteachers.co.za immediately\n2. Use the subject line: CHILD SAFETY REPORT — [Teacher Name]\n3. Include as much detail as possible about the concern\n\nAll reports are treated with strict confidentiality. The teacher in question will be suspended from the platform immediately pending investigation.\n\nFor immediate danger, call SAPS on 10111.'],
            ['For Teachers — Code of Conduct','By registering on IslamicTeachers.co.za, all teachers agree to:\n\n• Always teach in an open or supervised environment\n• Never be alone with a child without a parent or guardian present or nearby\n• Maintain appropriate Islamic adab (conduct) at all times\n• Report any suspicious approaches or behaviour by other parties involving children\n• Comply fully with the Children\'s Act 38 of 2005\n• Understand that any violation of this policy will result in immediate removal from the platform and, where applicable, referral to the relevant authorities'],
            ['Safe Teaching Practices','We encourage all teachers to follow these safe teaching practices:\n\n• Conduct lessons in a visible space within the home (e.g. lounge, dining room — not a bedroom)\n• For online lessons, keep a record of session recordings if requested by the parent\n• Always communicate with parents, not directly with children under 12\n• Keep WhatsApp and email communication professional and lesson-focused'],
          ].map(([heading, body]) => (
            <div key={heading as string} style={{ marginBottom:28 }}>
              <h2 style={{ color:'#0F6E56', fontWeight:700, fontSize:18, marginBottom:12 }}>{heading}</h2>
              <p style={{ fontSize:15, lineHeight:1.8, color:'#2C2C2A', margin:0, whiteSpace:'pre-line' }}>{body}</p>
            </div>
          ))}

          <div style={{ background:'#E1F5EE', borderRadius:8, padding:20, marginTop:12 }}>
            <p style={{ fontWeight:700, color:'#0F6E56', margin:'0 0 8px' }}>Related Policies</p>
            <Link href="/privacy-policy" style={{ display:'block', color:'#0F6E56', marginBottom:6, textDecoration:'none', fontSize:14 }}>→ Privacy Policy</Link>
            <Link href="/terms" style={{ display:'block', color:'#0F6E56', textDecoration:'none', fontSize:14 }}>→ Terms and Conditions</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
