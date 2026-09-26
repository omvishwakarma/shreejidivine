import { NextResponse } from 'next/server'
import { fetchInstagramPosts, fetchInstagramPostsFromLinks } from '@/lib/instagram'
import { getStoreSettings } from '@/lib/shipping'
import { INSTAGRAM_STRIP_DEFAULTS, instagramStripCopy } from '@/lib/instagramStrip'

export const revalidate = 60

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const limit = Number(searchParams.get('limit') || 6)
  const capped = Math.min(Math.max(limit, 1), 12)

  let settings = null
  try {
    settings = await getStoreSettings()
  } catch (err) {
    console.error(err)
  }

  const copy = settings ? instagramStripCopy(settings) : { ...INSTAGRAM_STRIP_DEFAULTS }
  const managed = (settings?.instagramStripPosts || []).filter(
    (post) => post.active !== false && post.permalink
  )

  const headers = {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
  }

  if (managed.length) {
    const posts = await fetchInstagramPostsFromLinks(managed, capped)
    return NextResponse.json(
      {
        configured: true,
        posts,
        error: posts.length ? null : 'Could not load these Instagram links',
        source: 'admin',
        profileUrl: copy.url,
        handle: copy.handle,
        label: copy.label,
        cta: copy.cta,
      },
      { headers }
    )
  }

  const result = await fetchInstagramPosts(capped)

  return NextResponse.json(
    {
      ...result,
      profileUrl: copy.url,
      handle: copy.handle,
      label: copy.label,
      cta: copy.cta,
    },
    { headers }
  )
}
