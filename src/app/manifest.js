import { SITE_NAME, SITE_DESCRIPTION } from '../lib/site'

export default function manifest() {
  return {
    name: `${SITE_NAME} Aroma Stone`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#fdf8f1',
    theme_color: '#b45615',
    lang: 'en-IN',
    icons: [
      {
        src: '/images/logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/images/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
