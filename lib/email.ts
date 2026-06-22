import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'IslamicTeachers.co.za <noreply@islamicteachers.co.za>'
const ADMIN = process.env.ADMIN_EMAIL || 'admin@islamicteachers.co.za'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://islamicteachers.co.za'

const brandHeader = `
  <div style="background:#0F6E56;padding:20px 32px;text-align:center;">
    <img src="${SITE_URL}/logo.png" alt="IslamicTeachers.co.za" width="120" style="height:auto;margin-bottom:8px;display:block;margin-left:auto;margin-right:auto;" />
    <h1 style="color:#BA7517;font-family:Arial,sans-serif;font-size:20px;margin:0;letter-spacing:1px;font-weight:800;">
      ISLAMICTEACHERS.CO.ZA
    </h1>
    <p style="color:#E1F5EE;font-size:13px;margin:4px 0 0;">Find Trusted Teachers Near You</p>
  </div>`

const brandFooter = `
  <div style="background:#0F6E56;padding:20px 32px;text-align:center;margin-top:32px;">
    <p style="color:#E1F5EE;font-size:12px;margin:0;">
      © 2026 IslamicTeachers.co.za &nbsp;|&nbsp;
      <a href="https://islamicteachers.co.za/privacy-policy" style="color:#5DCAA5;">Privacy Policy</a> &nbsp;|&nbsp;
      <a href="https://islamicteachers.co.za/terms" style="color:#5DCAA5;">Terms</a>
    </p>
    <p style="color:#5DCAA5;font-size:11px;margin:8px 0 0;">
      Questions? Email us at ${ADMIN}
    </p>
  </div>`

function wrap(body: string) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
    <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
      ${brandHeader}
      <div style="padding:32px;">${body}</div>
      ${brandFooter}
    </div>
  </body></html>`
}

const EFT_DETAILS = `
  <div style="background:#E1F5EE;border-left:4px solid #0F6E56;padding:16px 20px;border-radius:4px;margin:16px 0;">
    <p style="margin:0 0 8px;font-weight:bold;color:#0F6E56;">EFT Payment Details</p>
    <p style="margin:0;font-size:14px;color:#2C2C2A;line-height:1.8;">
      Bank: FNB/RMB<br/>
      Account holder: Shivaan Mathews<br/>
      Account type: Islamic Aspire Current Account<br/>
      Account number: 62311371281<br/>
      Branch code: 250655<br/>
      <strong>Reference: YOUR NAME — PLAN NAME</strong>
    </p>
    <p style="margin:12px 0 0;font-size:13px;color:#2C2C2A;">
      Email your proof of payment to <strong>${ADMIN}</strong>.<br/>
      Your listing will be activated within 2 business days of confirmation.
    </p>
  </div>`

export async function sendTeacherRegistrationConfirmation(
  to: string,
  name: string,
  tier: string
) {
  const isPaid = tier !== 'free'
  await resend.emails.send({
    from: FROM, to,
    subject: 'Thank you for registering with IslamicTeachers.co.za',
    html: wrap(`
      <h2 style="color:#0F6E56;">Assalamu Alaykum, ${name}!</h2>
      <p>Thank you for submitting your teacher listing on IslamicTeachers.co.za. We have received your registration and it is now under review.</p>
      ${isPaid ? `<p>You selected the <strong>${tier.charAt(0).toUpperCase() + tier.slice(1)}</strong> plan. Please make your EFT payment to activate your listing:</p>${EFT_DETAILS}` : '<p>You selected the <strong>Free</strong> plan.</p>'}
      <p>Your listing will be reviewed and activated within <strong>2 business days</strong>. You will receive a confirmation email once it is live.</p>
      <p>If you have any questions, reply to this email or WhatsApp us at ${ADMIN}.</p>
      <p style="color:#2C2C2A;">JazakAllah Khair,<br/><strong>The IslamicTeachers.co.za Team</strong></p>
    `),
  })
}

export async function sendInstitutionRegistrationConfirmation(
  to: string,
  name: string
) {
  await resend.emails.send({
    from: FROM, to,
    subject: 'Thank you for registering your institution with IslamicTeachers.co.za',
    html: wrap(`
      <h2 style="color:#0F6E56;">Assalamu Alaykum!</h2>
      <p>Thank you for registering <strong>${name}</strong> on IslamicTeachers.co.za.</p>
      <p>Please make your EFT payment to activate your institution listing:</p>
      ${EFT_DETAILS}
      <p>Your listing will be reviewed and activated within <strong>2 business days</strong> of payment confirmation.</p>
      <p style="color:#2C2C2A;">JazakAllah Khair,<br/><strong>The IslamicTeachers.co.za Team</strong></p>
    `),
  })
}

export async function sendAdminNewListingNotification(
  type: 'teacher' | 'institution',
  name: string,
  details: Record<string, string>,
  reviewUrl: string
) {
  const rows = Object.entries(details)
    .map(([k, v]) => `<tr><td style="padding:6px 12px;font-weight:bold;color:#0F6E56;white-space:nowrap;">${k}</td><td style="padding:6px 12px;color:#2C2C2A;">${v}</td></tr>`)
    .join('')
  await resend.emails.send({
    from: FROM, to: ADMIN,
    subject: `New ${type} listing — ${name}`,
    html: wrap(`
      <h2 style="color:#0F6E56;">New ${type.charAt(0).toUpperCase() + type.slice(1)} Registration</h2>
      <p>A new ${type} listing has been submitted and requires your review.</p>
      <table style="width:100%;border-collapse:collapse;background:#f9f9f9;border-radius:6px;overflow:hidden;margin:16px 0;">
        ${rows}
      </table>
      <a href="${reviewUrl}" style="display:inline-block;background:#BA7517;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin-top:8px;">
        Review in Admin Panel →
      </a>
    `),
  })
}

export async function sendListingApproved(to: string, name: string, profileUrl: string, dashboardUrl: string) {
  await resend.emails.send({
    from: FROM, to,
    subject: 'Your listing on IslamicTeachers.co.za is live!',
    html: wrap(`
      <h2 style="color:#0F6E56;">Mabrook! Your listing is live 🎉</h2>
      <p>Assalamu Alaykum ${name},</p>
      <p>Your listing on IslamicTeachers.co.za has been approved and is now visible to students and parents across South Africa.</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${profileUrl}" style="display:inline-block;background:#0F6E56;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin:0 8px;">
          View My Profile
        </a>
        <a href="${dashboardUrl}" style="display:inline-block;background:#BA7517;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin:0 8px;">
          Go to Dashboard
        </a>
      </div>
      <p style="color:#2C2C2A;">JazakAllah Khair,<br/><strong>The IslamicTeachers.co.za Team</strong></p>
    `),
  })
}

export async function sendListingRejected(to: string, name: string, reason: string) {
  await resend.emails.send({
    from: FROM, to,
    subject: 'Your IslamicTeachers.co.za listing submission',
    html: wrap(`
      <h2 style="color:#0F6E56;">Regarding your listing submission</h2>
      <p>Assalamu Alaykum ${name},</p>
      <p>Thank you for registering with IslamicTeachers.co.za. After reviewing your submission, we are unable to approve your listing at this time.</p>
      <div style="background:#fff3f3;border-left:4px solid #c0392b;padding:16px;border-radius:4px;margin:16px 0;">
        <p style="margin:0;font-weight:bold;color:#c0392b;">Reason:</p>
        <p style="margin:8px 0 0;color:#2C2C2A;">${reason}</p>
      </div>
      <p>You are welcome to resubmit your listing with the necessary corrections. If you have any questions, please reply to this email.</p>
      <p style="color:#2C2C2A;">JazakAllah Khair,<br/><strong>The IslamicTeachers.co.za Team</strong></p>
    `),
  })
}

export async function sendEnquiryToTeacher(
  to: string,
  teacherName: string,
  enquirerName: string,
  message: string
) {
  await resend.emails.send({
    from: FROM, to,
    subject: 'New enquiry via IslamicTeachers.co.za',
    html: wrap(`
      <h2 style="color:#0F6E56;">New Student Enquiry</h2>
      <p>Assalamu Alaykum ${teacherName},</p>
      <p>You have received a new enquiry through IslamicTeachers.co.za:</p>
      <div style="background:#E1F5EE;padding:16px 20px;border-radius:6px;margin:16px 0;">
        <p style="margin:0;"><strong>From:</strong> ${enquirerName}</p>
        ${message ? `<p style="margin:12px 0 0;"><strong>Message:</strong><br/>${message}</p>` : ''}
      </div>
      <p>Reply directly to this email or contact them via the details they provided.</p>
      <p style="color:#2C2C2A;">JazakAllah Khair,<br/><strong>The IslamicTeachers.co.za Team</strong></p>
    `),
  })
}

export async function sendRenewalReminder(
  to: string,
  name: string,
  renewalDate: string,
  amount: string
) {
  await resend.emails.send({
    from: FROM, to,
    subject: 'Your IslamicTeachers.co.za listing renews in 7 days',
    html: wrap(`
      <h2 style="color:#0F6E56;">Listing Renewal Reminder</h2>
      <p>Assalamu Alaykum ${name},</p>
      <p>Your IslamicTeachers.co.za listing is due for renewal on <strong>${renewalDate}</strong>.</p>
      <p>Amount due: <strong>${amount}</strong></p>
      ${EFT_DETAILS}
      <p style="color:#2C2C2A;">JazakAllah Khair,<br/><strong>The IslamicTeachers.co.za Team</strong></p>
    `),
  })
}
