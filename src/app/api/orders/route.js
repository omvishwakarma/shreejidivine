import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  dbConnect,
  requireUser,
  generateOrderNumber,
} from '@/lib/mongo/auth'
import { Order } from '@/lib/mongo/Order'
import { Product } from '@/lib/mongo/Product'
import { Address } from '@/lib/mongo/Address'

const SHIPPING_FEE = 0

export async function GET(request) {
  const gate = await requireUser(request)
  if (gate.error) return gate.error
  await dbConnect()
  const { searchParams } = new URL(request.url)
  const all = searchParams.get('all') === '1'
  const filter =
    gate.auth.role === 'admin' && all ? {} : { user: gate.auth.sub }
  const orders = await Order.find(filter)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
  return NextResponse.json({ orders: orders.map((o) => o.toJSONSafe()) })
}

export async function POST(request) {
  const gate = await requireUser(request)
  if (gate.error) return gate.error
  try {
    await dbConnect()
    const schema = z.object({
      items: z
        .array(
          z.object({
            productId: z.string(),
            quantity: z.number().int().min(1).max(20),
          })
        )
        .min(1),
      shipping: z.object({
        fullName: z.string().min(2),
        phone: z.string().min(10),
        line1: z.string().min(3),
        line2: z.string().optional().or(z.literal('')),
        city: z.string().min(2),
        state: z.string().min(2),
        pincode: z.string().min(5),
      }),
      paymentMethod: z.enum(['COD']).default('COD'),
      notes: z.string().optional().or(z.literal('')),
      saveAddress: z.boolean().optional(),
      addressLabel: z.string().optional(),
    })
    const data = schema.parse(await request.json())

    const lineItems = []
    let subtotal = 0
    for (const item of data.items) {
      const product = await Product.findById(item.productId)
      if (!product || !product.active) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        )
      }
      subtotal += product.price * item.quantity
      lineItems.push({
        product: product._id,
        productName: product.name,
        productSlug: product.slug,
        price: product.price,
        quantity: item.quantity,
        image: product.image,
      })
    }

    if (data.saveAddress) {
      const count = await Address.countDocuments({ user: gate.auth.sub })
      await Address.create({
        user: gate.auth.sub,
        label: data.addressLabel || 'Home',
        ...data.shipping,
        line2: data.shipping.line2 || '',
        isDefault: count === 0,
      })
    }

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      user: gate.auth.sub,
      status: 'CONFIRMED',
      paymentMethod: data.paymentMethod,
      subtotal,
      shipping: SHIPPING_FEE,
      total: subtotal + SHIPPING_FEE,
      shippingName: data.shipping.fullName,
      shippingPhone: data.shipping.phone,
      shippingLine1: data.shipping.line1,
      shippingLine2: data.shipping.line2 || '',
      shippingCity: data.shipping.city,
      shippingState: data.shipping.state,
      shippingPincode: data.shipping.pincode,
      notes: data.notes || '',
      items: lineItems,
    })

    return NextResponse.json({ order: order.toJSONSafe() }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors?.[0]?.message || err.issues?.[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    console.error(err)
    return NextResponse.json({ error: 'Could not place order' }, { status: 500 })
  }
}
