export type ListingTier = 'free' | 'standard' | 'premium'
export type ListingStatus = 'pending' | 'active' | 'suspended' | 'expired'
export type SessionType = 'in-person' | 'online' | 'both'
export type Gender = 'male' | 'female'
export type HourlyRate = 'under-r100' | 'r100-r150' | 'r150-r200' | 'r200-r300' | 'r300-plus'
export type AgeGroup = 'children' | 'teenagers' | 'adults'
export type Subject =
  | 'quran_recitation'
  | 'tajweed'
  | 'hifz'
  | 'islamic_studies'
  | 'arabic_language'
  | 'seerah'
  | 'fiqh'
  | 'other'

export const SUBJECTS: { value: Subject; label: string; slug: string }[] = [
  { value: 'quran_recitation', label: 'Quran Recitation', slug: 'quran-teachers' },
  { value: 'tajweed',          label: 'Tajweed',          slug: 'tajweed-teachers' },
  { value: 'hifz',             label: 'Hifz',             slug: 'hifz-teachers' },
  { value: 'islamic_studies',  label: 'Islamic Studies',  slug: 'islamic-studies-tutors' },
  { value: 'arabic_language',  label: 'Arabic Language',  slug: 'arabic-language-teachers' },
  { value: 'seerah',           label: 'Seerah',           slug: 'seerah-teachers' },
  { value: 'fiqh',             label: 'Fiqh',             slug: 'fiqh-teachers' },
  { value: 'other',            label: 'Other',            slug: '' },
]

export const PROVINCES = [
  'Western Cape',
  'Gauteng',
  'KwaZulu-Natal',
  'Eastern Cape',
  'Free State',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Northern Cape',
]

export const CITIES = [
  'Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 'Port Elizabeth',
  'Bloemfontein', 'Nelspruit', 'Polokwane', 'Rustenburg', 'East London',
]

export const HOURLY_RATES: { value: HourlyRate; label: string }[] = [
  { value: 'under-r100',  label: 'Under R100/hr' },
  { value: 'r100-r150',   label: 'R100 – R150/hr' },
  { value: 'r150-r200',   label: 'R150 – R200/hr' },
  { value: 'r200-r300',   label: 'R200 – R300/hr' },
  { value: 'r300-plus',   label: 'R300+/hr' },
]

export interface Teacher {
  id: string
  user_id: string
  full_name: string
  gender: Gender
  province: string
  city: string
  suburb?: string
  email: string
  whatsapp: string
  subjects: Subject[]
  subjects_other?: string
  years_experience: number
  session_type: SessionType
  age_groups: AgeGroup[]
  qualification: 'yes' | 'no' | 'studying'
  qualification_description?: string
  hourly_rate: HourlyRate
  availability: boolean
  online_availability: boolean
  inperson_availability: boolean
  bio?: string
  profile_photo_url?: string
  video_intro_url?: string
  listing_tier: ListingTier
  listing_status: ListingStatus
  subscription_start_date?: string
  subscription_renewal_date?: string
  profile_views: number
  enquiry_count: number
  whatsapp_consent: boolean
  references: TeacherReference[]
  references_data?: TeacherReference[]
  rejection_reason?: string
  created_at: string
  updated_at: string
  // computed
  slug?: string
}

export interface TeacherReference {
  name: string
  relationship: string
  phone: string
}

export interface Institution {
  id: string
  user_id: string
  institution_name: string
  institution_type: string
  province: string
  city: string
  physical_address?: string
  website?: string
  contact_name: string
  contact_position: string
  contact_email: string
  contact_whatsapp: string
  subjects_offered: Subject[]
  session_type: SessionType
  age_groups: AgeGroup[]
  teacher_count: number
  currently_enrolling: 'yes' | 'no' | 'limited'
  institution_logo_url?: string
  institution_description?: string
  listing_status: ListingStatus
  subscription_start_date?: string
  subscription_renewal_date?: string
  institution_views: number
  institution_enquiries: number
  rejection_reason?: string
  created_at: string
  updated_at: string
  slug?: string
}

export interface Enquiry {
  id: string
  teacher_id?: string
  institution_id?: string
  enquirer_name: string
  enquirer_email: string
  enquirer_whatsapp?: string
  message?: string
  created_at: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  cover_image_url?: string
  author?: string
  published: boolean
  created_at: string
  updated_at?: string
}

export interface Workshop {
  id: string
  title: string
  slug: string
  description: string
  cover_image_url?: string
  location?: string
  event_date?: string
  price?: string
  registration_url?: string
  published: boolean
  created_at: string
}

