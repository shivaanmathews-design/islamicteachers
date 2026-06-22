# IslamicTeachers.co.za — Deployment Guide

## What's built ✅

| File / Folder | Description |
|---|---|
| `app/page.tsx` | Homepage (hero, search, featured, subjects, cities, how it works) |
| `app/find-a-teacher/page.tsx` | Search page with live filter sidebar |
| `app/teachers/[slug]/page.tsx` | Teacher profile page |
| `app/register/teacher/page.tsx` | 3-step teacher registration |
| `app/register/institution/page.tsx` | Institution registration |
| `app/login/page.tsx` | Login + password reset |
| `app/dashboard/teacher/page.tsx` | Teacher dashboard (overview, profile editor, subscription) |
| `app/admin/page.tsx` | Admin panel (pending approvals, all teachers, stats) |
| `app/pricing/page.tsx` | Pricing page |
| `app/about/page.tsx` | About page |
| `app/contact/page.tsx` | Contact page |
| `app/privacy-policy/page.tsx` | Privacy Policy (POPIA compliant) |
| `app/terms/page.tsx` | Terms and Conditions |
| `app/child-safety/page.tsx` | Child Safety Policy |
| `app/api/register/route.ts` | Registration API |
| `app/api/enquiry/route.ts` | Enquiry submission API |
| `app/api/admin/approve/route.ts` | Approve listing API |
| `app/api/admin/reject/route.ts` | Reject listing API |
| `lib/types.ts` | TypeScript types and constants |
| `lib/supabase.ts` | Supabase client |
| `lib/email.ts` | 9 email templates via Resend |
| `supabase/schema.sql` | Complete database schema with RLS |
| `netlify.toml` | Netlify deployment config |

---

## Step 1 — Set up Supabase

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Name: `islamicteachers` | Region: **South Africa (Cape Town)**
3. Once created, go to **SQL Editor** → paste the entire contents of `supabase/schema.sql` → **Run**
4. Go to **Storage** → create these 4 buckets (all **Public**):
   - `teacher-photos`
   - `teacher-videos`
   - `institution-logos`
   - `banner-ads`
5. Go to **Settings → API** → copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 2 — Set up Resend (emails)

1. Go to [resend.com](https://resend.com) → Create account
2. Add your domain `islamicteachers.co.za` → verify DNS records
3. Go to **API Keys** → Create key → copy it → `RESEND_API_KEY`

---

## Step 3 — Environment Variables

Copy `.env.local.example` to `.env.local` and fill in all values:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RESEND_API_KEY=re_...
NEXT_PUBLIC_SITE_URL=https://islamicteachers.co.za
NEXT_PUBLIC_ADMIN_EMAIL=admin@islamicteachers.co.za
NEXT_PUBLIC_WHATSAPP_NUMBER=27XXXXXXXXX
```

---

## Step 4 — Deploy to Netlify

### Option A: Netlify CLI (recommended)
```bash
cd islamicteachers
npm install
npm install -g netlify-cli
netlify login
netlify init          # Connect to new/existing site
netlify env:import .env.local   # Push env vars
netlify deploy --build --prod
```

### Option B: GitHub + Netlify UI
1. Push this folder to a new GitHub repo
2. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import from Git**
3. Select your repo → Build command: `npm run build` | Publish: `.next`
4. Go to **Site settings → Environment variables** → add all vars from `.env.local`
5. **Deploy site**

---

## Step 5 — Connect your domain

1. In Netlify: **Site settings → Domain management → Add custom domain**
2. Enter `islamicteachers.co.za`
3. Update your DNS at your registrar:
   - `A` record → Netlify's load balancer IP (shown in Netlify)
   - Or `CNAME www` → your Netlify subdomain
4. Netlify auto-provisions SSL (Let's Encrypt) — takes ~5 min

---

## Step 6 — Update Admin WhatsApp Number

In `app/layout.tsx`, update the WhatsApp href:
```tsx
href="https://wa.me/27XXXXXXXXX"  // your number without +
```

Or set `NEXT_PUBLIC_WHATSAPP_NUMBER` in env vars and update layout.tsx to use it.

---

## After going live — Admin Checklist

- [ ] Log in at `/login` with your admin email (`admin@islamicteachers.co.za`)
- [ ] Check `/admin` — your admin panel
- [ ] Update EFT banking details in Supabase: `admin_settings` table
- [ ] Test teacher registration at `/register/teacher`
- [ ] Approve your test registration at `/admin`
- [ ] Test the enquiry flow on a profile page
- [ ] Add your logo to `public/` and update `app/layout.tsx`

---

## Pricing tiers (configured)

| Plan | Price | Features |
|---|---|---|
| Free | R0 | Basic listing |
| Standard | R99/month | Photo, bio, contact button |
| Premium | R179/month | Featured + video |
| Institution | R449/month | Full institution page |
