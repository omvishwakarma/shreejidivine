import 'dotenv/config'
import mongoose from 'mongoose'
import { User } from '../models/User.js'
import { Product } from '../models/Product.js'

const PRODUCTS = [
  {
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

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shreeji'
  await mongoose.connect(uri)

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@shreejidivinearoma.com').toLowerCase()
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123'

  let admin = await User.findOne({ email: adminEmail })
  if (!admin) {
    admin = await User.create({
      name: 'Shreeji Admin',
      email: adminEmail,
      passwordHash: await User.hashPassword(adminPassword),
      role: 'admin',
    })
    console.log('Admin created:', adminEmail, '/', adminPassword)
  } else {
    console.log('Admin already exists:', adminEmail)
  }

  for (const p of PRODUCTS) {
    await Product.findOneAndUpdate({ slug: p.slug }, p, { upsert: true, new: true })
  }
  console.log(`Seeded ${PRODUCTS.length} products`)

  await mongoose.disconnect()
  console.log('Done')
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
