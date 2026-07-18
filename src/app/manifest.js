import { SITE_NAME, SITE_DESCRIPTION } from '../lib/site'

export default function manifest() {
  return {
    name: `${SITE_NAME} Aroma Stone`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#fdf8f1',
    theme_color: '#2b1e16',
    lang: 'en-IN',
    icons: [
      {
        src: '/images/logo.png',
        sizes: '516x358',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  }
}
