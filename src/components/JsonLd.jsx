import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_TAGLINE, SEO_TITLE, CONTACT_EMAIL, SOCIAL } from '../lib/site'

export default function JsonLd() {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/images/logo.png`,
        },
        description: SITE_DESCRIPTION,
        email: CONTACT_EMAIL,
        slogan: SITE_TAGLINE,
        sameAs: [SOCIAL.instagram],
        areaServed: {
          '@type': 'Country',
          name: 'India',
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        publisher: { '@id': `${SITE_URL}/#organization` },
        inLanguage: 'en-IN',
      },
      {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/#webpage`,
        url: SITE_URL,
        name: SEO_TITLE,
        description: SITE_DESCRIPTION,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#organization` },
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/images/banners/royal-chandan.png`,
        },
        inLanguage: 'en-IN',
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  )
}
