import { NextResponse } from 'next/server'
import { getHeroPayload } from '@/lib/hero'
import { SITE_NAME, SITE_TAGLINE } from '@/lib/site'

export async function GET() {
  try {
    const hero = await getHeroPayload()
    return NextResponse.json(hero, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({
      poster: '/images/banners/royal-chandan.png',
      posterMobile: '/images/banners/royal-chandan.png',
      imagesDesktop: [],
      imagesMobile: [],
      headline: SITE_TAGLINE,
      ctaText: 'Shop Now',
      ctaHref: '/shop',
      brand: SITE_NAME,
    })
  }
}
