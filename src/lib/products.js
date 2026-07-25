export function formatINR(n) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n || 0)
}

export const SHIPPING_FEE = 0
export const FREE_SHIPPING_NOTE = 'Pan-India free shipping on all orders'

/** Fallback catalog / sitemap slugs if API is offline */
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
  { id: 'fallback-mogra', slug: 'mogra-royale', name: 'Mogra Royale', price: 699, image: '/images/aroma-variants.png' },
  { id: 'fallback-rose', slug: 'rose-majesty', name: 'Rose Majesty', price: 699, image: '/images/aroma-variants.png' },
  { id: 'fallback-lavender', slug: 'lavender-bliss', name: 'Lavender Bliss', price: 699, image: '/images/aroma-variants.png' },
  { id: 'fallback-chandan', slug: 'royal-chandan', name: 'Royal Chandan', price: 699, image: '/images/aroma-variants.png' },
]
