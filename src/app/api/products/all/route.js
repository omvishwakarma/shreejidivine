import { NextResponse } from 'next/server'
import { dbConnect, requireAdmin } from '../../../../lib/mongo/auth'
import { Product } from '../../../../lib/mongo/Product'

export async function GET(request) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error
  try {
    await dbConnect()
    const products = await Product.find().sort({ createdAt: -1 })
    return NextResponse.json({ products: products.map((p) => p.toPublicJSON()) })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Could not load products' }, { status: 500 })
  }
}
