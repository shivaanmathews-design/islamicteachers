export const metadata = { title:'Terms and Conditions — IslamicTeachers.co.za' }

export default function TermsPage() {
  return (
    <div style={{ background:'#f9f9f9', minHeight:'100vh' }}>
      <div style={{ background:'#0F6E56', padding:'48px 0 32px' }}>
        <div className="container"><h1 style={{ color:'#fff', fontWeight:700, fontSize:28 }}>Terms and Conditions</h1>
        <p style={{ color:'#E1F5EE', margin:'8px 0 0', fontSize:15 }}>Last updated: June 2026</p></div>
      </div>
      <div className="container" style={{ maxWidth:780, padding:'48px 20px' }}>
        <div style={{ background:'#fff', borderRadius:14, padding:40, border:'1.5px solid #e8e8e8' }}>
          {[
            ['1. Acceptance of Terms','By accessing or using IslamicTeachers.co.za, you agree to these Terms and Conditions. If you do not agree, please do not use this Platform. These terms are governed by the laws of the Republic of South Africa, including the Electronic Communications and Transactions Act 25 of 2002 (ECT Act) and the Consumer Protection Act 68 of 2008.'],
            ['2. Platform Purpose','IslamicTeachers.co.za is a directory service only. We connect students and parents with Islamic teachers and institutions. We do not employ teachers, guarantee results, or take responsibility for the quality of teaching. Any arrangement between a student and teacher is entered into independently.'],
            ['3. Teacher Registration','By registering as a teacher, you confirm that: all information provided is accurate and truthful; you have the right to teach the subjects listed; you agree to our Child Safety Policy; you will maintain professional conduct at all times; you will notify us promptly of any change to your details.'],
            ['4. Listing Approval','All listings are subject to manual review. We reserve the right to reject any application at our discretion without providing reasons. We will contact references provided during registration. False information will result in immediate removal.'],
            ['5. Payment Terms','Paid plans (Standard, Premium, Institution) are billed monthly. Payment is by EFT only. Listings are activated within 2 business days of receipt of payment. Payments are non-refundable once a listing has been activated. Monthly renewals are due on the same date each month. Failure to renew will result in your listing being downgraded to Free.'],
            ['6. Content Standards','You are responsible for all content on your profile. Content must be truthful and not misleading. You must not post: false qualifications; contact details for third parties without consent; content promoting other platforms or competitors; inappropriate, offensive, or non-Islamic content.'],
            ['7. Student and Parent Responsibilities','Students and parents using this directory must: conduct their own due diligence before engaging a teacher; always meet teachers in a safe and appropriate setting; report any concerns to admin@islamicteachers.co.za immediately; not misuse the contact information provided by teachers.'],
            ['8. Limitation of Liability','IslamicTeachers.co.za is a directory service only. We do not guarantee the accuracy of listings or the quality of teachers. We are not liable for any disputes, losses, or damages arising from interactions between teachers and students. Our total liability is limited to the amount paid for your listing in the most recent billing period.'],
            ['9. Termination','We may suspend or terminate any account at any time for breach of these Terms. You may cancel your listing at any time by contacting admin@islamicteachers.co.za.'],
            ['10. Changes to Terms','We may update these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the updated Terms. We will notify active paid users by email of material changes.'],
            ['11. Contact','admin@islamicteachers.co.za'],
          ].map(([heading, body]) => (
            <div key={heading as string} style={{ marginBottom:28 }}>
              <h2 style={{ color:'#0F6E56', fontWeight:700, fontSize:18, marginBottom:12 }}>{heading}</h2>
              <p style={{ fontSize:15, lineHeight:1.8, color:'#2C2C2A', margin:0 }}>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
