import { SITE_URL } from '../lib/site'
import { dbConnect } from '../lib/mongo/db'
import { Product } from '../lib/mongo/Product'
import { FALLBACK_PRODUCTS } from '../lib/products'

export const revalidate = 3600

export default async function sitemap() {
  const lastModified = new Date()

  const staticRoutes = [
    { path: '', priority: 1, changeFrequency: 'weekly' },
    { path: '/shop', priority: 0.9, changeFrequency: 'daily' },
    { path: '/know-your-bracelet', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/policies', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/shipping-policy', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/refund-policy', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/privacy-policy', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/cashback-policy', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/cancellation-policy', priority: 0.3, changeFrequency: 'yearly' },
  ].map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  let products = FALLBACK_PRODUCTS.map((product) => ({
    slug: product.slug,
    updatedAt: lastModified,
  }))

  try {
    await dbConnect()
    const docs = await Product.find({ active: { $ne: false } })
      .select('slug updatedAt')
      .lean()
    if (docs.length) {
      products = docs
        .filter((product) => product.slug)
        .map((product) => ({
          slug: product.slug,
          updatedAt: product.updatedAt || lastModified,
        }))
    }
  } catch (err) {
    console.error(err)
  }

  const productRoutes = products.map((product) => ({
    url: `${SITE_URL}/shop/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...staticRoutes, ...productRoutes]
}
