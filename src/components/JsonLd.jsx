import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_TAGLINE, SEO_TITLE, CONTACT_EMAIL } from '../lib/site'

export default function JsonLd() {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    legalName: 'Shreeji Divine',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/images/logo.png`,
      width: 1024,
      height: 1024,
    },
    description: SITE_DESCRIPTION,
    email: CONTACT_EMAIL,
    foundingLocation: {
      '@type': 'Country',
      name: 'India',
    },
    areaServed: {
      '@type': 'Country',
      name: 'India',
    },
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
      slogan: SITE_TAGLINE,
    },
  }

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: 'Shreeji Divine Spiritual Wearables',
    description: SITE_DESCRIPTION,
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: 'en-IN',
  }

  const products = [
    'Rudraksha bracelets',
    'Rudraksha malas',
    'Karungali malas',
    'Pyrite bands',
    'Nepali Rudraksha',
  ]

  const productList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Certified Rudraksha Wearables',
    description: SITE_DESCRIPTION,
    numberOfItems: products.length,
    itemListElement: products.map((name, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name,
        description: SITE_DESCRIPTION,
        image: `${SITE_URL}/images/logo.png`,
        brand: {
          '@type': 'Brand',
          name: SITE_NAME,
        },
        url: `${SITE_URL}/shop`,
      },
    })),
  }

  const webpage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE_URL}/#webpage`,
    url: SITE_URL,
    name: SEO_TITLE,
    description: SITE_DESCRIPTION,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#organization` },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/images/hero-banner.png`,
    },
    inLanguage: 'en-IN',
  }

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What does Shreeji Divine sell?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Shreeji Divine sells certified spiritual wearables: Rudraksha bracelets, malas, Karungali malas, Pyrite bands, and Nepali Rudraksha.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I find the right spiritual wearable?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Japam helps you to find the right spiritual wearables for your needs.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you offer delivery and cash on delivery?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Next Day Dispatch, Free Delivery, and COD are available.',
        },
      },
    ],
  }

  const schemas = [organization, website, webpage, productList, faq]

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          // eslint-disable-next-line react/no-danger
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  )
}
