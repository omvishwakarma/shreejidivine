import { NextResponse } from 'next/server'
import { fetchInstagramPosts, isInstagramConfigured } from '@/lib/instagram'
import { SOCIAL } from '@/lib/site'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const limit = Number(searchParams.get('limit') || 6)

  if (!isInstagramConfigured()) {
    return NextResponse.json(
      {
        configured: false,
        posts: [],
        profileUrl: SOCIAL.instagram || '',
        handle: SOCIAL.instagramHandle || '',
        error:
          'Instagram is not configured. Add INSTAGRAM_ACCESS_TOKEN (and optionally INSTAGRAM_BUSINESS_ACCOUNT_ID) to .env',
      },
      {
        status: 200,
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
      }
    )
  }

  const result = await fetchInstagramPosts(limit)

  return NextResponse.json(
    {
      ...result,
      profileUrl: SOCIAL.instagram || '',
      handle: SOCIAL.instagramHandle || '',
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    }
  )
}
