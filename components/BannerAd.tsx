'use client'

interface BannerAdProps {
  id: string
  desktopImageUrl?: string
  mobileImageUrl?: string
  clickUrl: string
  placement: 'homepage_leaderboard' | 'search_sidebar' | 'profile_banner' | 'mobile_footer'
  title?: string
}

const DIMENSIONS: Record<string, { desktop: string; mobile: string }> = {
  homepage_leaderboard: { desktop:'728px', mobile:'320px' },
  search_sidebar:       { desktop:'300px', mobile:'300px' },
  profile_banner:       { desktop:'728px', mobile:'320px' },
  mobile_footer:        { desktop:'320px', mobile:'320px' },
}

export default function BannerAd({ id, desktopImageUrl, mobileImageUrl, clickUrl, placement, title }: BannerAdProps) {
  const imageUrl = desktopImageUrl || mobileImageUrl
  if (!imageUrl) return null

  async function trackClick() {
    try {
      await fetch('/api/banners/click', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ id }),
      })
    } catch {}
  }

  const w = DIMENSIONS[placement]?.desktop ?? '728px'

  return (
    <div style={{ textAlign:'center', margin:'12px auto', maxWidth: w }}>
      <span style={{ display:'block', fontSize:10, color:'#aaa', marginBottom:2, textTransform:'uppercase', letterSpacing:0.5 }}>Advertisement</span>
      <a href={clickUrl} target="_blank" rel="noopener noreferrer sponsored" onClick={trackClick}
        style={{ display:'block', lineHeight:0 }}>
        <img
          src={imageUrl}
          alt={title || 'Advertisement'}
          style={{ width:'100%', height:'auto', borderRadius:4, border:'1px solid #e8e8e8' }}
        />
      </a>
    </div>
  )
}
