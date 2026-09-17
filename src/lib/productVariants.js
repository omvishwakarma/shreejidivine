/**
 * Optional product variations: colours + fragrances (fragrance has own price).
 * Each option may include one image URL.
 */

import { safePublicImage } from './media'

export function normalizeColours(list) {
  if (!Array.isArray(list)) return []
  return list
    .map((c) => {
      if (typeof c === 'string') {
        const name = c.trim()
        return name ? { name, hex: '', image: '' } : null
      }
      const name = String(c?.name || '').trim()
      if (!name) return null
      const hex = String(c?.hex || '').trim()
      const image = safePublicImage(c?.image || '', '')
      return { name, hex, image }
    })
    .filter(Boolean)
    .slice(0, 20)
}

export function normalizeFragrances(list) {
  if (!Array.isArray(list)) return []
  return list
    .map((f) => {
      const name = String(f?.name || '').trim()
      if (!name) return null
      const price = Number(f?.price)
      if (!Number.isFinite(price) || price < 0) return null
      const image = safePublicImage(f?.image || '', '')
      return { name, price, image }
    })
    .filter(Boolean)
    .slice(0, 30)
}

export function cartLineKey(productId, colour = '', fragrance = '') {
  return `${productId}::${colour || ''}::${fragrance || ''}`
}

/** Resolve unit price from product + selected fragrance (if any). */
export function resolveVariantPrice(product, fragranceName = '') {
  const fragrances = product?.fragrances || []
  if (fragranceName && fragrances.length) {
    const match = fragrances.find(
      (f) => f.name.toLowerCase() === String(fragranceName).toLowerCase()
    )
    if (match && Number.isFinite(Number(match.price))) {
      return Number(match.price)
    }
  }
  return Number(product?.price) || 0
}

/** Prefer fragrance image, then colour image, then product cover. */
export function resolveVariantImage(product, colourName = '', fragranceName = '') {
  const fragrances = product?.fragrances || []
  const colours = product?.colours || []
  if (fragranceName) {
    const f = fragrances.find(
      (x) => x.name.toLowerCase() === String(fragranceName).toLowerCase()
    )
    if (f?.image) return safePublicImage(f.image, '')
  }
  if (colourName) {
    const c = colours.find(
      (x) => x.name.toLowerCase() === String(colourName).toLowerCase()
    )
    if (c?.image) return safePublicImage(c.image, '')
  }
  return safePublicImage(product?.image || '', '/images/aroma-variants.png')
}

export function productNeedsVariants(product) {
  return (
    (product?.colours?.length || 0) > 0 || (product?.fragrances?.length || 0) > 0
  )
}

/** Lowest fragrance price or base price — for listing “from” display. */
export function productDisplayPrice(product) {
  const base = Number(product?.price) || 0
  const fragrances = product?.fragrances || []
  if (!fragrances.length) return base
  const prices = fragrances.map((f) => Number(f.price)).filter((n) => Number.isFinite(n))
  if (!prices.length) return base
  return Math.min(base, ...prices)
}
