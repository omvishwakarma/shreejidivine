import { NextResponse } from 'next/server'
import { z } from 'zod'
import { dbConnect, requireAdmin } from '@/lib/mongo/auth'
import { Product } from '@/lib/mongo/Product'
import { normalizeColours, normalizeFragrances } from '@/lib/productVariants'
import { normalizeTags } from '@/lib/rashi'
import { reviewsForStorage } from '@/lib/productReviews'

const colourSchema = z.object({
  name: z.string().min(1),
  hex: z.string().optional().default(''),
  image: z.string().optional().default(''),
})

const fragranceSchema = z.object({
  name: z.string().min(1),
  price: z.number().min(0),
  image: z.string().optional().default(''),
})

export async function GET(request) {
  try {
    await dbConnect()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || ''
    const subcategory = searchParams.get('subcategory') || ''
    const filter = { active: true }
    if (searchParams.get('best') === '1') filter.bestSeller = true
    if (subcategory) {
      filter.subcategorySlug = subcategory
    } else if (category) {
      filter.$or = [{ categorySlug: category }, { subcategorySlug: category }]
    }
    const products = await Product.find(filter).sort({ createdAt: 1 })
    return NextResponse.json({ products: products.map((p) => p.toPublicJSON()) })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: err.message || 'Could not load products' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error
  try {
    await dbConnect()
    const schema = z.object({
      slug: z.string().min(2),
      name: z.string().min(2),
      tagline: z.string().optional(),
      price: z.number().min(0),
      compareAt: z.number().nullable().optional(),
      purchaseCost: z.number().min(0).optional(),
      image: z.string().min(1),
      gallery: z.array(z.string()).max(12).optional(),
      video: z.string().optional(),
      badge: z.string().nullable().optional(),
      tags: z.array(z.string()).max(20).optional(),
      category: z.string().optional(),
      categorySlug: z.string().optional(),
      subcategorySlug: z.string().optional(),
      stock: z.number().int().optional(),
      stone: z.string().optional(),
      description: z.string().optional(),
      highlights: z.array(z.string()).optional(),
      reviews: z.array(z.object({
        name: z.string().optional(),
        stars: z.number().min(1).max(5).optional(),
        text: z.string().optional(),
        images: z.array(z.string()).max(8).optional(),
        video: z.string().optional(),
        instagram: z.string().optional(),
        status: z.enum(['pending', 'approved']).optional(),
        id: z.string().optional(),
      })).max(40).optional(),
      colours: z.array(colourSchema).max(20).optional(),
      fragrances: z.array(fragranceSchema).max(30).optional(),
      active: z.boolean().optional(),
      bestSeller: z.boolean().optional(),
    })
    const data = schema.parse(await request.json())
    data.colours = normalizeColours(data.colours)
    data.fragrances = normalizeFragrances(data.fragrances)
    data.tags = normalizeTags(data.tags)
    data.reviews = reviewsForStorage(data.reviews)
    const exists = await Product.findOne({ slug: data.slug })
    if (exists) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }
    const product = await Product.create(data)
    return NextResponse.json({ product: product.toAdminJSON() }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors?.[0]?.message || err.issues?.[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Could not create product' }, { status: 500 })
  }
}
