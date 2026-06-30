import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Help & How-To Guide | IslamicTeachers.co.za',
  description: 'Step-by-step guides for teachers and parents using IslamicTeachers.co.za — registration, profile updates, passwords, and more.',
}

const sections = [
  {
    id: 'register-teacher',
    emoji: '📝',
    title: 'How to Register as a Teacher',
    steps: [
      'Go to Register → Teacher (or click "Register as a Teacher" on any page).',
      'Step 1 — Personal Details: Fill in your full name, city, suburb, email, WhatsApp number, and a secure password. Tick the WhatsApp consent checkbox.',
      'Step 2 — Teaching Details: Select the subjects you teach, your session type (in-person / online / both), age groups, years of experience, hourly rate, and provide two references (name + phone). Add a bio if you are on Standard or Premium.',
      'Step 3 — Select a Plan: Choose Free, Standard, or Premium. Read and individually tick all three policy checkboxes (Privacy Policy, Terms & Conditions, and Child Safety Policy) to unlock the Submit button.',
      'Click "Submit Registration". You will be redirected to the success page.',
      'For paid plans, make your EFT payment using the banking details shown and email proof of payment to islamicteachersadmin@gmail.com.',
      'We will verify your references and activate your listing within 2 business days.',
    ],
  },
  {
    id: 'register-institution',
    emoji: '🏫',
    title: 'How to Register as an Institution',
    steps: [
      'Go to Register → Institution.',
      'Fill in your institution name, type, province, city, contact details, subjects offered, and a brief description.',
      'Create a password for your account.',
      'Read and tick all three policy checkboxes, then click "Submit Institution Registration".',
      'Make your EFT payment and email proof to islamicteachersadmin@gmail.com.',
      'Your listing will be activated within 2 business days.',
    ],
  },
  {
    id: 'update-profile',
    emoji: '✏️',
    title: 'How to Update Your Profile',
    steps: [
      'Log in at islamicteachers.co.za/login with your email and password.',
      'You will be taken to your Teacher Dashboard.',
      'Click the "Profile" tab at the top of the dashboard.',
      'Update any of your details — name, city, suburb, bio, subjects, availability, etc.',
      'Click "Save Changes" when done. Your profile updates immediately.',
      'Note: changing your listing tier requires contacting islamicteachersadmin@gmail.com.',
    ],
  },
  {
    id: 'reset-password',
    emoji: '🔑',
    title: 'How to Reset a Forgotten Password',
    steps: [
      'Go to islamicteachers.co.za/login.',
      'Click "Forgot password?" below the login button.',
      'Enter the email address you registered with and click "Send Reset Link".',
      'Check your email inbox (and your spam/junk folder) for a password reset email.',
      'Click the link in the email — it will open a page where you can set a new password.',
      'Once reset, log in with your new password.',
      'The reset link expires after 1 hour. If it has expired, request a new one.',
    ],
  },
  {
    id: 'find-teacher',
    emoji: '🔍',
    title: 'How to Find a Teacher (for Parents & Students)',
    steps: [
      'From the homepage, use the search bar to select a subject and enter your city or province, then click Search.',
      'You can also browse by subject or by city using the sections on the homepage.',
      'Use the filters on the search results page to narrow by gender, session type, age group, or hourly rate.',
      'Click on any teacher card to view their full profile.',
      'Click "Contact via WhatsApp" or "Send Email" to get in touch directly.',
      'Searching and contacting teachers is always free — no account needed.',
    ],
  },
  {
    id: 'plans',
    emoji: '💳',
    title: 'About Listing Plans & Payments',
    steps: [
      'Free: Your listing appears in search with basic details (name, province, city, subjects). No photo, bio, or contact button.',
      'Standard (R99/month): Full profile with photo, bio, and a contact button. Dashboard access to update your details.',
      'Premium (R179/month): Everything in Standard, plus a ⭐ Featured badge and priority placement at the top of search results.',
      'Payments are made by EFT. Banking details are emailed to you after registration.',
      'To upgrade your plan, email islamicteachersadmin@gmail.com with the subject line "Upgrade Plan — [Your Name]".',
      'To cancel, email islamicteachersadmin@gmail.com. Your listing stays active until end of the current billing period.',
    ],
  },
]

export default function HelpPage() {
  return (
    <div style={{ background:'#f9f9f9', minHeight:'100vh', padding:'60px 0' }}>
      <div className="container" style={{ maxWidth:800 }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:56 }}>
          <h1 style={{ color:'#0F6E56', fontWeight:800, fontSize:'clamp(26px,5vw,40px)', marginBottom:12 }}>Help Centre</h1>
          <p style={{ color:'#555', fontSize:17, maxWidth:560, margin:'0 auto' }}>
            Step-by-step guides for everything on IslamicTeachers.co.za
          </p>
        </div>

        {/* Quick nav */}
        <div style={{ background:'#fff', borderRadius:12, padding:24, border:'1.5px solid #e8e8e8', marginBottom:48 }}>
          <p style={{ fontWeight:700, color:'#0F6E56', marginBottom:16, fontSize:15 }}>Jump to a section:</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
            {sections.map(s => (
              <a key={s.id} href={`#${s.id}`}
                style={{ padding:'8px 16px', borderRadius:40, background:'#E1F5EE', color:'#0F6E56', fontSize:13, fontWeight:600, textDecoration:'none', border:'1px solid #5DCAA5' }}>
                {s.emoji} {s.title.replace('How to ','')}
              </a>
            ))}
          </div>
        </div>

        {/* Sections */}
        {sections.map((s, i) => (
          <div key={s.id} id={s.id} style={{ background:'#fff', borderRadius:12, padding:'32px 36px', border:'1.5px solid #e8e8e8', marginBottom:24 }}>
            <h2 style={{ color:'#0F6E56', fontWeight:700, fontSize:20, marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:28 }}>{s.emoji}</span> {s.title}
            </h2>
            <ol style={{ paddingLeft:22, margin:0 }}>
              {s.steps.map((step, j) => (
                <li key={j} style={{ fontSize:15, color:'#2C2C2A', lineHeight:1.8, marginBottom:10 }}>
                  {step.includes('islamicteachersadmin@gmail.com')
                    ? step.split('islamicteachersadmin@gmail.com').flatMap((part, idx, arr) =>
                        idx < arr.length - 1
                          ? [part, <a key={idx} href="mailto:islamicteachersadmin@gmail.com" style={{ color:'#0F6E56', fontWeight:600 }}>islamicteachersadmin@gmail.com</a>]
                          : [part]
                      )
                    : step
                  }
                </li>
              ))}
            </ol>
          </div>
        ))}

        {/* Still need help */}
        <div style={{ background:'#0F6E56', borderRadius:12, padding:36, textAlign:'center', marginTop:16 }}>
          <h2 style={{ color:'#fff', fontWeight:700, marginBottom:12 }}>Still need help?</h2>
          <p style={{ color:'#E1F5EE', marginBottom:24, fontSize:15 }}>Our team is happy to assist you. Get in touch:</p>
          <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
            <a href="mailto:islamicteachersadmin@gmail.com" className="btn-gold">📧 Email Us</a>
            <Link href="/contact" className="btn-outline" style={{ color:'#fff', borderColor:'#fff' }}>Contact Form</Link>
          </div>
        </div>

      </div>
    </div>
  )
}
