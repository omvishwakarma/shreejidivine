import { SITE_URL } from './site'

export function productShortCode(product) {
  const id = String(product?.id || product?._id || '').trim()
  if (id.length >= 8) return id.slice(-8)
  return String(product?.slug || '').trim()
}

export function productShareUrl(product) {
  const slug = String(product?.slug || '').trim()
  if (slug) return `${SITE_URL.replace(/\/$/, '')}/shop/${slug}`
  const code = productShortCode(product)
  return `${SITE_URL.replace(/\/$/, '')}/p/${code}`
}

export function productPath(slug) {
  return `/shop/${String(slug || '').trim()}`
}
