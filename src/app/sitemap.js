import { SITE_URL } from '../lib/site'
import { PRODUCTS } from '../lib/products'

export default function sitemap() {
  const lastModified = new Date()

  const staticRoutes = ['', '/shop', '/cart', '/login', '/signup'].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: path === '' || path === '/shop' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : path === '/shop' ? 0.9 : 0.6,
  }))

  const products = PRODUCTS.map((p) => ({
    url: `${SITE_URL}/shop/${p.slug}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...staticRoutes, ...products]
}
