import JsonLd from '../components/JsonLd'
import HomeContent from '../components/HomeContent'
import { getHeroPayload } from '../lib/hero'
import { SEO_TITLE, SITE_DESCRIPTION } from '../lib/site'

export const revalidate = 60

export const metadata = {
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    title: SEO_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    title: SEO_TITLE,
    description: SITE_DESCRIPTION,
  },
}

export default async function HomePage() {
  let hero = null
  try {
    hero = await getHeroPayload()
  } catch (err) {
    console.error(err)
  }
  return (
    <>
      <JsonLd />
      <HomeContent hero={hero} />
    </>
  )
}
