import JsonLd from '../components/JsonLd'
import HomeContent from '../components/HomeContent'
import { SEO_TITLE, SITE_DESCRIPTION } from '../lib/site'

export const metadata = {
  alternates: { canonical: '/' },
  openGraph: {
    url: '/',
    title: SEO_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    title: SEO_TITLE,
    description: SITE_DESCRIPTION,
  },
}

export default function HomePage() {
  return (
    <>
      <JsonLd />
      <HomeContent />
    </>
  )
}
