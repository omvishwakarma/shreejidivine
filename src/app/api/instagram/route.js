import { NextResponse } from 'next/server'
import { fetchInstagramPosts } from '@/lib/instagram'
import { SOCIAL } from '@/lib/site'

export const revalidate = 60

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const limit = Number(searchParams.get('limit') || 6)

  const result = await fetchInstagramPosts(limit)

  return NextResponse.json(
    {
      ...result,
      configured: true,
      profileUrl: SOCIAL.instagram || 'https://www.instagram.com/shreeji.divine/',
      handle: SOCIAL.instagramHandle || '@shreeji.divine',
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    }
  )
}
