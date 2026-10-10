import { Cabin, Outfit } from 'next/font/google'
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SEO_TITLE,
} from '../lib/site'
import Providers from '../components/Providers'
import './globals.css'

/** Match Gulessence: Cabin headings + Outfit body */
const display = Cabin({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})

const body = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SEO_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  applicationName: SITE_NAME,
  category: 'Spiritual jewellery and fragrance',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: SITE_NAME,
    images: [
      {
        url: '/images/logo.png',
        width: 1024,
        height: 1024,
        alt: SEO_TITLE,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/images/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/images/logo.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/images/logo.png', sizes: '180x180' }],
  },
  other: {
    'geo.region': 'IN',
  },
}

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1b18' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN" className={`${display.variable} ${body.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
