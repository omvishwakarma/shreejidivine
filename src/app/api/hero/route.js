import { NextResponse } from 'next/server'
import { getStoreSettings } from '@/lib/shipping'
import { SITE_NAME, SITE_TAGLINE } from '@/lib/site'

export async function GET() {
  try {
    const settings = await getStoreSettings()
    return NextResponse.json(
      {
        desktop: settings.heroVideoDesktop,
        mobile: settings.heroVideoMobile,
        poster: settings.heroPoster,
        headline: settings.heroHeadline || SITE_TAGLINE,
        ctaText: settings.heroCtaText || 'Shop Now',
        ctaHref: settings.heroCtaHref || '/shop',
        brand: SITE_NAME,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json({
      desktop: '/videos/home.mp4',
      mobile: '/videos/home.mp4',
      poster: '/images/banners/royal-chandan.png',
      headline: SITE_TAGLINE,
      ctaText: 'Shop Now',
      ctaHref: '/shop',
      brand: SITE_NAME,
    })
  }
}
