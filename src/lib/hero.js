import { getStoreSettings } from './shipping'
import { SITE_NAME, SITE_TAGLINE } from './site'

export function heroFromSettings(settings) {
  return {
    poster: settings.heroPoster || '/images/banners/royal-chandan.png',
    posterMobile: settings.heroPosterMobile || settings.heroPoster || '/images/banners/royal-chandan.png',
    imagesDesktop: settings.heroImagesDesktop || [],
    imagesMobile: settings.heroImagesMobile || [],
    headline: settings.heroHeadline || SITE_TAGLINE,
    ctaText: settings.heroCtaText || 'Shop Now',
    ctaHref: settings.heroCtaHref || '/shop',
    brand: SITE_NAME,
  }
}

export async function getHeroPayload() {
  const settings = await getStoreSettings()
  return heroFromSettings(settings)
}
