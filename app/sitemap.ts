import type { MetadataRoute } from 'next'
import { createServiceClient, slugify } from '@/lib/supabase'
import { SUBJECTS, CITIES } from '@/lib/types'

const SITE_URL = 'https://islamicteachers.co.za'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    '', 'about', 'find-a-teacher', 'pricing', 'contact', 'help',
    'register/teacher', 'register/institution', 'blog', 'workshops',
    'privacy-policy', 'terms', 'child-safety',
  ].map(path => ({
    url: `${SITE_URL}/${path}`,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
  }))

  // SEO landing pages — the highest-priority pages for organic search
  const cityPages: MetadataRoute.Sitemap = CITIES.map(c => ({
    url: `${SITE_URL}/islamic-teachers-${slugify(c)}`,
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  const subjectPages: MetadataRoute.Sitemap = SUBJECTS.filter(s => s.slug).map(s => ({
    url: `${SITE_URL}/${s.slug}`,
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  // Individual teacher/institution profiles, if reachable at build time.
  let teacherPages: MetadataRoute.Sitemap = []
  let institutionPages: MetadataRoute.Sitemap = []
  let blogPages: MetadataRoute.Sitemap = []
  try {
    const db = createServiceClient()

    const { data: teachers } = await db.from('teachers').select('slug,id,updated_at').eq('listing_status', 'active')
    teacherPages = (teachers ?? []).map(t => ({
      url: `${SITE_URL}/teachers/${t.slug || t.id}`,
      lastModified: t.updated_at ? new Date(t.updated_at) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

    const { data: institutions } = await db.from('institutions').select('slug,id,updated_at').eq('listing_status', 'active')
    institutionPages = (institutions ?? []).map(i => ({
      url: `${SITE_URL}/institutions/${i.slug || i.id}`,
      lastModified: i.updated_at ? new Date(i.updated_at) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

    const { data: posts } = await db.from('blog_posts').select('slug,updated_at').eq('published', true)
    blogPages = (posts ?? []).map(p => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  } catch {
    // If Supabase can't be reached at build time, still ship the static + SEO pages.
  }

  return [...staticPages, ...cityPages, ...subjectPages, ...teacherPages, ...institutionPages, ...blogPages]
}
