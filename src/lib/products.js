export function formatINR(n) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n || 0)
}

export const SHIPPING_FEE = 0
export const FREE_SHIPPING_NOTE = 'Pan-India free shipping on all orders'

/** Fallback catalog if API is offline (dev only) */
export const FALLBACK_PRODUCTS = [
  {
    id: 'fallback-ritual',
    slug: 'divine-ritual-kit',
    name: 'Divine Ritual Kit',
    tagline: 'Complete sacred set',
    price: 2499,
    compareAt: 2999,
    image: '/images/aroma-collection.png',
    badge: 'Best Seller',
    category: 'kits',
    description: 'Complete Divine Ritual Kit with stones and oils.',
    highlights: ['4 Stones', '4 Oils', 'Gift Box'],
  },
]
