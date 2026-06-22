import { createServiceClient } from '@/lib/supabase'

export interface BannerAdRow {
  id: string
  title: string
  placement: string
  desktop_image_url?: string
  mobile_image_url?: string
  click_url: string
}

export async function getBannerForPlacement(placement: string): Promise<BannerAdRow | null> {
  try {
    const db = createServiceClient()
    const today = new Date().toISOString().split('T')[0]
    const { data } = await db
      .from('banner_ads')
      .select('id,title,placement,desktop_image_url,mobile_image_url,click_url')
      .eq('placement', placement)
      .eq('active', true)
      .or(`start_date.is.null,start_date.lte.${today}`)
      .or(`end_date.is.null,end_date.gte.${today}`)
      .limit(1)
      .single()
    return data ?? null
  } catch {
    return null
  }
}
