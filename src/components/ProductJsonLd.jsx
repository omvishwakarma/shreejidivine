import { SITE_NAME, SITE_URL } from '../lib/site'
import { clipText, plainText } from '../lib/seo'

export default function ProductJsonLd({ product }) {
  if (!product?.slug || !product?.name) return null

  const url = `${SITE_URL}/shop/${product.slug}`
  const description = clipText(
    product.description || product.tagline || `${product.name} from ${SITE_NAME}.`,
    500
  )
  const images = [product.image, ...(product.gallery || [])].filter(Boolean).slice(0, 6)
  const reviews = (product.reviews || []).filter((review) => Number(review.stars) >= 1)
  const offer = {
    '@type': 'Offer',
    url,
    priceCurrency: 'INR',
    price: Number(product.price || 0).toFixed(2),
    availability:
      Number(product.stock) > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    itemCondition: 'https://schema.org/NewCondition',
    seller: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
  }

  const productNode = {
    '@type': 'Product',
    '@id': `${url}#product`,
    name: product.name,
    description: plainText(description),
    image: images,
    sku: product.slug,
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    offers: offer,
  }

  if (reviews.length) {
    const total = reviews.reduce((sum, review) => sum + Number(review.stars), 0)
    productNode.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: (total / reviews.length).toFixed(1),
      reviewCount: reviews.length,
    }
  }

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      productNode,
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Shop', item: `${SITE_URL}/shop` },
          { '@type': 'ListItem', position: 3, name: product.name, item: url },
        ],
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
