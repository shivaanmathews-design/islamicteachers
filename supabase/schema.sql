-- ═══════════════════════════════════════════════════════════
--  IslamicTeachers.co.za — Supabase Database Schema
--  Run this in the Supabase SQL editor
-- ═══════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── TEACHERS ───────────────────────────────────────────────
create table if not exists teachers (
  id                      uuid primary key default uuid_generate_v4(),
  user_id                 uuid references auth.users(id) on delete cascade,
  full_name               text not null,
  gender                  text not null check (gender in ('male','female')),
  province                text not null,
  city                    text not null,
  email                   text not null,
  whatsapp                text not null,
  subjects                text[] not null default '{}',
  subjects_other          text,
  years_experience        int not null default 0,
  session_type            text not null check (session_type in ('in-person','online','both')),
  age_groups              text[] not null default '{}',
  qualification           text not null check (qualification in ('yes','no','studying')),
  qualification_description text,
  hourly_rate             text not null,
  availability            boolean not null default true,
  online_availability     boolean not null default false,
  inperson_availability   boolean not null default false,
  bio                     text,
  profile_photo_url       text,
  video_intro_url         text,
  listing_tier            text not null default 'free' check (listing_tier in ('free','standard','premium')),
  listing_status          text not null default 'pending' check (listing_status in ('pending','active','suspended','expired')),
  subscription_start_date date,
  subscription_renewal_date date,
  profile_views           int not null default 0,
  enquiry_count           int not null default 0,
  whatsapp_consent        boolean not null default false,
  popia_consent           boolean not null default false,
  references_data         jsonb not null default '[]',
  rejection_reason        text,
  slug                    text unique,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- ─── INSTITUTIONS ────────────────────────────────────────────
create table if not exists institutions (
  id                      uuid primary key default uuid_generate_v4(),
  user_id                 uuid references auth.users(id) on delete cascade,
  institution_name        text not null,
  institution_type        text not null,
  province                text not null,
  city                    text not null,
  physical_address        text,
  website                 text,
  contact_name            text not null,
  contact_position        text not null,
  contact_email           text not null,
  contact_whatsapp        text not null,
  subjects_offered        text[] not null default '{}',
  session_type            text not null check (session_type in ('in-person','online','both')),
  age_groups              text[] not null default '{}',
  teacher_count           int not null default 0,
  currently_enrolling     text not null check (currently_enrolling in ('yes','no','limited')),
  institution_logo_url    text,
  institution_description text,
  listing_status          text not null default 'pending' check (listing_status in ('pending','active','suspended','expired')),
  subscription_start_date date,
  subscription_renewal_date date,
  institution_views       int not null default 0,
  institution_enquiries   int not null default 0,
  popia_consent           boolean not null default false,
  rejection_reason        text,
  slug                    text unique,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- ─── INSTITUTION TEACHERS (sub-profiles) ─────────────────────
create table if not exists institution_teachers (
  id              uuid primary key default uuid_generate_v4(),
  institution_id  uuid references institutions(id) on delete cascade,
  full_name       text not null,
  subjects        text[] not null default '{}',
  years_experience int not null default 0,
  seats_available boolean not null default true,
  created_at      timestamptz not null default now()
);

-- ─── ENQUIRIES ───────────────────────────────────────────────
create table if not exists enquiries (
  id              uuid primary key default uuid_generate_v4(),
  teacher_id      uuid references teachers(id) on delete set null,
  institution_id  uuid references institutions(id) on delete set null,
  enquirer_name   text not null,
  enquirer_email  text not null,
  enquirer_whatsapp text,
  message         text,
  created_at      timestamptz not null default now()
);

-- ─── BANNER ADS ──────────────────────────────────────────────
create table if not exists banner_ads (
  id                    uuid primary key default uuid_generate_v4(),
  advertiser_name       text not null,
  placement             text not null check (placement in ('homepage_leaderboard','search_sidebar','profile_banner','mobile_footer')),
  banner_image_desktop  text,
  banner_image_mobile   text,
  click_url             text not null,
  active                boolean not null default false,
  start_date            date,
  end_date              date,
  click_count           int not null default 0,
  created_at            timestamptz not null default now()
);

-- ─── ADMIN SETTINGS ──────────────────────────────────────────
create table if not exists admin_settings (
  key   text primary key,
  value text not null
);

insert into admin_settings (key, value) values
  ('eft_bank_name',    '[Your bank name]'),
  ('eft_account_name', '[Your account name]'),
  ('eft_account_num',  '[Your account number]'),
  ('eft_branch_code',  '[Branch code]'),
  ('launch_price_standard', '99'),
  ('launch_price_premium',  '179'),
  ('launch_price_institution', '449'),
  ('regular_price_standard', '149'),
  ('regular_price_premium',  '279'),
  ('regular_price_institution', '649')
on conflict (key) do nothing;

-- ─── UPDATED_AT TRIGGER ──────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger teachers_updated_at before update on teachers
  for each row execute function update_updated_at();

create trigger institutions_updated_at before update on institutions
  for each row execute function update_updated_at();

-- ─── SLUG HELPERS ────────────────────────────────────────────
create or replace function slugify(text) returns text as $$
  select lower(regexp_replace(regexp_replace($1, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
$$ language sql;

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
alter table teachers         enable row level security;
alter table institutions     enable row level security;
alter table institution_teachers enable row level security;
alter table enquiries        enable row level security;
alter table banner_ads       enable row level security;
alter table admin_settings   enable row level security;

-- Public can read active listings
create policy "Public read active teachers" on teachers
  for select using (listing_status = 'active');

create policy "Public read active institutions" on institutions
  for select using (listing_status = 'active');

create policy "Public read institution teachers" on institution_teachers
  for select using (true);

-- Teachers can read/update own record
create policy "Teacher reads own record" on teachers
  for select using (auth.uid() = user_id);

create policy "Teacher updates own record" on teachers
  for update using (auth.uid() = user_id);

-- Institutions can read/update own record
create policy "Institution reads own record" on institutions
  for select using (auth.uid() = user_id);

create policy "Institution updates own record" on institutions
  for update using (auth.uid() = user_id);

-- Anyone can create an enquiry
create policy "Anyone can create enquiry" on enquiries
  for insert with check (true);

-- Public can read active banners
create policy "Public read active banners" on banner_ads
  for select using (active = true);

-- Admin settings readable by authenticated users (admin checks done in API)
create policy "Authenticated read settings" on admin_settings
  for select using (auth.role() = 'authenticated');

-- ─── STORAGE BUCKETS ─────────────────────────────────────────
-- Run these in the Supabase dashboard Storage section:
-- 1. Create bucket: "teacher-photos"    (public: true, max size: 5MB)
-- 2. Create bucket: "teacher-videos"    (public: true, max size: 100MB)
-- 3. Create bucket: "institution-logos" (public: true, max size: 5MB)
-- 4. Create bucket: "banner-ads"        (public: true, max size: 2MB)

-- ─── INDEXES ─────────────────────────────────────────────────
create index if not exists idx_teachers_status    on teachers(listing_status);
create index if not exists idx_teachers_tier      on teachers(listing_tier);
create index if not exists idx_teachers_province  on teachers(province);
create index if not exists idx_teachers_city      on teachers(city);
create index if not exists idx_teachers_subjects  on teachers using gin(subjects);
create index if not exists idx_teachers_slug      on teachers(slug);

create index if not exists idx_institutions_status   on institutions(listing_status);
create index if not exists idx_institutions_province on institutions(province);
create index if not exists idx_institutions_city     on institutions(city);
create index if not exists idx_institutions_slug     on institutions(slug);
