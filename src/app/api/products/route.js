import { NextResponse } from 'next/server'
import { z } from 'zod'
import { dbConnect, requireAdmin } from '../../../lib/mongo/auth'
import { Product } from '../../../lib/mongo/Product'

export async function GET() {
  try {
    await dbConnect()
    const products = await Product.find({ active: true }).sort({ createdAt: 1 })
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
      image: z.string().min(1),
      gallery: z.array(z.string()).optional(),
      badge: z.string().nullable().optional(),
      category: z.string().optional(),
      stock: z.number().int().optional(),
      stone: z.string().optional(),
      description: z.string().optional(),
      highlights: z.array(z.string()).optional(),
      active: z.boolean().optional(),
    })
    const data = schema.parse(await request.json())
    const exists = await Product.findOne({ slug: data.slug })
    if (exists) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }
    const product = await Product.create(data)
    return NextResponse.json({ product: product.toPublicJSON() }, { status: 201 })
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
