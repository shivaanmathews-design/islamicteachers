import Link from 'next/link'
import { PLAN_PRICES, PLAN_LABELS, proRata, formatZAR, formatDate, type PlanTier } from '@/lib/pricing'

export default function RegistrationSuccessPage({
  searchParams,
}: {
  searchParams: { name?: string; tier?: string; type?: string }
}) {
  const name = searchParams.name || 'there'
  const tier = searchParams.tier || 'free'
  const type = searchParams.type || 'teacher'

  const tierLabels: Record<string, { label: string; price: string }> = {
    free:     { label: 'Free',     price: 'R0'   },
    standard: { label: 'Standard', price: 'R99'  },
    premium:  { label: 'Premium',  price: 'R179' },
  }
  const selected = tierLabels[tier] ?? tierLabels.free
  const isPaid = tier !== 'free'
  const monthly = PLAN_PRICES[(tier as PlanTier)] ?? 0
  const pr = isPaid ? proRata(monthly) : null

  return (
    <div style={{ minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 20px', background:'#f9f9f9' }}>
      <div style={{ background:'#fff', borderRadius:16, padding:'48px 40px', maxWidth:560, width:'100%', textAlign:'center', border:'1.5px solid #e8e8e8', boxShadow:'0 4px 24px rgba(15,110,86,.08)' }}>
        <div style={{ fontSize:64, marginBottom:20 }}>✅</div>

        <h1 style={{ color:'#0F6E56', fontWeight:800, fontSize:26, marginBottom:12 }}>
          JazakAllah Khair, {name}!
        </h1>

        <p style={{ color:'#555', fontSize:16, lineHeight:1.8, marginBottom:24 }}>
          Your {type === 'institution' ? 'institution' : 'teacher'} listing has been <strong>submitted successfully</strong> and is now under review. We will contact your references and activate your listing within <strong>2 business days</strong>.
        </p>

        {isPaid && (
          <div style={{ background:'#E1F5EE', borderRadius:10, padding:24, marginBottom:28, textAlign:'left', border:'1.5px solid #5DCAA5' }}>
            <p style={{ margin:'0 0 12px', fontWeight:700, color:'#0F6E56', fontSize:15 }}>💳 Payment Required to Activate</p>
            <p style={{ margin:'0 0 6px', fontSize:14, color:'#2C2C2A' }}>
              Plan: <strong>{selected.label}</strong> &nbsp;|&nbsp; Standard price: <strong>{selected.price}/month</strong>
            </p>
            {pr && (
              <div style={{ background:'#fff', borderRadius:8, padding:'12px 14px', border:'1px dashed #5DCAA5', margin:'0 0 12px' }}>
                <p style={{ margin:'0 0 4px', fontSize:14, color:'#0F6E56', fontWeight:700 }}>
                  Pay now (pro-rata): {formatZAR(pr.amount)}
                </p>
                <p style={{ margin:0, fontSize:13, color:'#555', lineHeight:1.6 }}>
                  This covers the remaining {pr.daysRemaining} day{pr.daysRemaining !== 1 ? 's' : ''} of this month.
                  Your normal <strong>{selected.price}/month</strong> billing then starts on <strong>{formatDate(pr.nextBillingDate)}</strong>.
                </p>
              </div>
            )}
            <p style={{ margin:'0 0 16px', fontSize:14, color:'#2C2C2A' }}>
              Reference: <strong>{name} — {selected.label}</strong>
            </p>
            <div style={{ background:'#fff', borderRadius:8, padding:16, border:'1px solid #5DCAA5', fontSize:14, color:'#2C2C2A', lineHeight:2 }}>
              <strong>Bank:</strong> FNB/RMB<br/>
              <strong>Account holder:</strong> Shivaan Mathews<br/>
              <strong>Account type:</strong> Islamic Aspire Current Account<br/>
              <strong>Account number:</strong> 62311371281<br/>
              <strong>Branch code:</strong> 250655
            </div>
            <p style={{ margin:'12px 0 0', fontSize:13, color:'#555' }}>
              Email proof of payment to{' '}
              <a href="mailto:islamicteachersadmin@gmail.com" style={{ color:'#0F6E56', fontWeight:600 }}>
                islamicteachersadmin@gmail.com
              </a>
            </p>
          </div>
        )}

        <div style={{ background:'#f9f9f9', borderRadius:8, padding:20, marginBottom:28, fontSize:14, color:'#555', lineHeight:1.8, textAlign:'left' }}>
          <p style={{ margin:'0 0 8px', fontWeight:700, color:'#2C2C2A' }}>What happens next?</p>
          <ol style={{ margin:0, paddingLeft:20 }}>
            <li>We review your registration and verify your references</li>
            {isPaid && <li>You make your EFT payment using the details above</li>}
            <li>We activate your listing within 2 business days</li>
            <li>You receive an email confirmation when you go live</li>
          </ol>
        </div>

        <p style={{ fontSize:13, color:'#888', marginBottom:32 }}>
          A confirmation email has been sent to you. Check your inbox (and spam folder).
        </p>

        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/dashboard/teacher" className="btn-teal">Go to Dashboard</Link>
          <Link href="/" className="btn-outline">Back to Home</Link>
        </div>

        <p style={{ marginTop:24, fontSize:13, color:'#888' }}>
          Need help?{' '}
          <Link href="/help" style={{ color:'#0F6E56', fontWeight:600 }}>View our How-To Guide</Link>
          {' '}or{' '}
          <a href="mailto:islamicteachersadmin@gmail.com" style={{ color:'#0F6E56', fontWeight:600 }}>email us</a>
        </p>
      </div>
    </div>
  )
}
