export const PRODUCTS = [
  {
    id: 'ritual-kit',
    slug: 'divine-ritual-kit',
    name: 'Divine Ritual Kit',
    tagline: 'Complete sacred set',
    price: 2499,
    compareAt: 2999,
    image: '/images/aroma-collection.png',
    gallery: ['/images/aroma-collection.png', '/images/divine-ritual-kit.png', '/images/hero-banner.png'],
    badge: 'Best Seller',
    category: 'kits',
    stock: 50,
    description:
      'The complete Divine Ritual Kit — 4 handcrafted aroma stones, 4 signature fragrance oils (10ml), ritual guide, blessing card, and a premium magnetic gift box.',
    highlights: [
      '4 Divine Aroma Stones',
      '4 Signature Oils (10ml)',
      'Ritual Guide & Blessing Card',
      'Premium Magnetic Gift Box',
    ],
  },
  {
    id: 'mogra',
    slug: 'mogra-royale',
    name: 'Mogra Royale',
    tagline: 'Temple jasmine aroma',
    price: 699,
    compareAt: 849,
    image: '/images/aroma-variants.png',
    gallery: ['/images/aroma-variants.png', '/images/aroma-brochure.png'],
    badge: null,
    category: 'singles',
    stock: 100,
    stone: 'Ganesh Ji',
    description:
      'Traditional temple mogra fragrance with a handcrafted Ganesh Ji aroma stone and 10ml concentrated oil. Gift-ready premium box.',
    highlights: ['Ganesh Ji stone', '10ml Mogra oil', 'Natural gypsum & clay', 'Reusable'],
  },
  {
    id: 'rose',
    slug: 'rose-majesty',
    name: 'Rose Majesty',
    tagline: 'Royal floral fragrance',
    price: 699,
    compareAt: 849,
    image: '/images/aroma-variants.png',
    gallery: ['/images/aroma-variants.png', '/images/aroma-brochure.png'],
    badge: null,
    category: 'singles',
    stock: 100,
    stone: 'Om / Lotus',
    description:
      'Luxurious rose fragrance with a handcrafted lotus/Om aroma stone and 10ml concentrated oil for a soothing ambiance.',
    highlights: ['Om / Lotus stone', '10ml Rose oil', 'Long lasting', 'Premium gift pack'],
  },
  {
    id: 'lavender',
    slug: 'lavender-bliss',
    name: 'Lavender Bliss',
    tagline: 'Calm & restore',
    price: 699,
    compareAt: 849,
    image: '/images/aroma-variants.png',
    gallery: ['/images/aroma-variants.png', '/images/aroma-brochure.png'],
    badge: null,
    category: 'singles',
    stock: 100,
    stone: 'Charan Paduka',
    description:
      'Calming lavender fragrance with Charan Paduka aroma stone — perfect for meditation and peaceful spaces.',
    highlights: ['Charan Paduka stone', '10ml Lavender oil', 'Smoke-free', 'Handmade'],
  },
  {
    id: 'chandan',
    slug: 'royal-chandan',
    name: 'Royal Chandan',
    tagline: 'Sacred sandalwood',
    price: 749,
    compareAt: 899,
    image: '/images/aroma-variants.png',
    gallery: ['/images/aroma-variants.png', '/images/aroma-brochure.png'],
    badge: 'Sacred',
    category: 'singles',
    stock: 80,
    stone: 'Kalash',
    description:
      'Sacred sandalwood fragrance with Kalash aroma stone for purity, positivity, and traditional divine aroma.',
    highlights: ['Kalash stone', '10ml Chandan oil', 'Made in India', 'Ideal for gifting'],
  },
]

export function getProduct(slug) {
  return PRODUCTS.find((p) => p.slug === slug) || null
}

export function getProductById(id) {
  return PRODUCTS.find((p) => p.id === id) || null
}

export function formatINR(paiseOrRupees) {
  // prices stored in rupees (whole numbers)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paiseOrRupees)
}

export const SHIPPING_FEE = 0
export const FREE_SHIPPING_NOTE = 'Pan-India free shipping on all orders'
