import { NextResponse } from 'next/server'
import { dbConnect, requireAdmin } from '../../../../lib/mongo/auth'
import { Product } from '../../../../lib/mongo/Product'

export async function GET(_request, { params }) {
  try {
    await dbConnect()
    const { slug } = await params
    const product = await Product.findOne({ slug, active: true })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    return NextResponse.json({ product: product.toPublicJSON() })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Could not load product' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error
  try {
    await dbConnect()
    const { slug: id } = await params
    const body = await request.json()
    const product = await Product.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    return NextResponse.json({ product: product.toPublicJSON() })
  } catch (err) {
    return NextResponse.json({ error: 'Could not update product' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error
  try {
    await dbConnect()
    const { slug: id } = await params
    const product = await Product.findByIdAndDelete(id)
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'Could not delete product' }, { status: 500 })
  }
}
