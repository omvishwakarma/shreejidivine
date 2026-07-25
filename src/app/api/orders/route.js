import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getCurrentUser, generateOrderNumber } from '@/lib/auth'
import { getProductById, SHIPPING_FEE } from '@/lib/products'

const itemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1).max(20),
})

const schema = z.object({
  items: z.array(itemSchema).min(1),
  shipping: z.object({
    fullName: z.string().min(2),
    phone: z.string().min(10),
    line1: z.string().min(3),
    line2: z.string().optional().or(z.literal('')),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().min(5).max(10),
  }),
  paymentMethod: z.enum(['COD']).default('COD'),
  notes: z.string().max(500).optional().or(z.literal('')),
  saveAddress: z.boolean().optional(),
  addressLabel: z.string().optional(),
})

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  })

  return NextResponse.json({ orders })
}

export async function POST(req) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Please login to checkout' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = schema.parse(body)

    const lineItems = []
    let subtotal = 0

    for (const item of data.items) {
      const product = getProductById(item.productId)
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 })
      }
      const lineTotal = product.price * item.quantity
      subtotal += lineTotal
      lineItems.push({
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        price: product.price,
        quantity: item.quantity,
        image: product.image,
      })
    }

    const shipping = SHIPPING_FEE
    const total = subtotal + shipping

    if (data.saveAddress) {
      const count = await prisma.address.count({ where: { userId: user.id } })
      await prisma.address.create({
        data: {
          userId: user.id,
          label: data.addressLabel || 'Home',
          fullName: data.shipping.fullName,
          phone: data.shipping.phone,
          line1: data.shipping.line1,
          line2: data.shipping.line2 || null,
          city: data.shipping.city,
          state: data.shipping.state,
          pincode: data.shipping.pincode,
          isDefault: count === 0,
        },
      })
    }

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: user.id,
        status: 'CONFIRMED',
        paymentMethod: data.paymentMethod,
        subtotal,
        shipping,
        total,
        shippingName: data.shipping.fullName,
        shippingPhone: data.shipping.phone,
        shippingLine1: data.shipping.line1,
        shippingLine2: data.shipping.line2 || null,
        shippingCity: data.shipping.city,
        shippingState: data.shipping.state,
        shippingPincode: data.shipping.pincode,
        notes: data.notes || null,
        items: { create: lineItems },
      },
      include: { items: true },
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message || 'Invalid input' }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Could not place order' }, { status: 500 })
  }
}
