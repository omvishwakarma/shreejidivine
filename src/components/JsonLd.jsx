import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_TAGLINE, CONTACT_EMAIL } from '../lib/site'

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
    name: `${SITE_NAME} Aroma Stone`,
    description: SITE_DESCRIPTION,
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: 'en-IN',
  }

  const products = [
    {
      name: 'Mogra Royale Aroma Stone',
      description:
        'Traditional temple mogra (jasmine) fragrance with handcrafted Ganesh Ji aroma stone. Long-lasting, reusable & gift-ready.',
      image: `${SITE_URL}/images/aroma-variants.png`,
      sku: 'SD-MOGRA',
      color: 'Green',
    },
    {
      name: 'Rose Majesty Aroma Stone',
      description:
        'Royal rose fragrance with handcrafted lotus/Om aroma stone. Premium floral aroma for home and pooja room.',
      image: `${SITE_URL}/images/aroma-variants.png`,
      sku: 'SD-ROSE',
      color: 'Red',
    },
    {
      name: 'Lavender Bliss Aroma Stone',
      description:
        'Calming lavender fragrance with Charan Paduka aroma stone. Perfect for meditation and peaceful spaces.',
      image: `${SITE_URL}/images/aroma-variants.png`,
      sku: 'SD-LAVENDER',
      color: 'Purple',
    },
    {
      name: 'Royal Chandan Aroma Stone',
      description:
        'Sacred sandalwood fragrance with Kalash aroma stone. Purity, positivity and traditional divine aroma.',
      image: `${SITE_URL}/images/aroma-variants.png`,
      sku: 'SD-CHANDAN',
      color: 'Gold',
    },
  ]

  const productList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Shreeji Divine Aroma Stone Collection',
    description:
      'Four premium aroma stone & fragrance oil gift sets by Shreeji Divine.',
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: p.name,
        description: p.description,
        image: p.image,
        sku: p.sku,
        brand: {
          '@type': 'Brand',
          name: SITE_NAME,
        },
        color: p.color,
        material: 'Natural gypsum and clay',
        countryOfOrigin: {
          '@type': 'Country',
          name: 'India',
        },
        offers: {
          '@type': 'Offer',
          url: `${SITE_URL}/#products`,
          availability: 'https://schema.org/InStock',
          priceCurrency: 'INR',
          seller: {
            '@type': 'Organization',
            name: SITE_NAME,
          },
        },
      },
    })),
  }

  const webpage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE_URL}/#webpage`,
    url: SITE_URL,
    name: `${SITE_NAME} Aroma Stone | ${SITE_TAGLINE}`,
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
        name: 'What is Shreeji Divine Aroma Stone?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Shreeji Divine Aroma Stone is a premium fragrance diffuser stone made from natural gypsum and clay. Add a few drops of signature fragrance oil to enjoy a long-lasting, smoke-free divine aroma at home, pooja room or office.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I use an aroma stone?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Place the aroma stone on a clean dry surface, add 3–5 drops of Shreeji Divine fragrance oil, enjoy the aroma, and refill with 2–3 drops when the fragrance fades. The stone is reusable.',
        },
      },
      {
        '@type': 'Question',
        name: 'What fragrances are available?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Four signature fragrances: Mogra Royale, Rose Majesty, Lavender Bliss, and Royal Chandan (sandalwood).',
        },
      },
      {
        '@type': 'Question',
        name: 'What is included in the Divine Ritual Kit?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The kit includes 4 divine aroma stones, 4 signature fragrance oils (10ml each), a ritual guide, a blessing card, and a premium magnetic gift box (24 × 20 × 4.5 cm).',
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
