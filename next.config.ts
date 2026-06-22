import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol:'https', hostname:'*.supabase.co' },
      { protocol:'https', hostname:'islamicteachers.co.za' },
    ],
  },
}

export default nextConfig
