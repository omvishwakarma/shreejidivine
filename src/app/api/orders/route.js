import { NextResponse } from 'next/server'
import { z } from 'zod'
import { dbConnect, requireUser } from '@/lib/mongo/auth'
import { Order } from '@/lib/mongo/Order'
import { sendOrderEmail } from '@/lib/mail'
import { redeemCoupon, validateCoupon } from '@/lib/coupons'
import { calcShippingFee, getStoreSettings, orderTotal } from '@/lib/shipping'
import {
  buildOrderLineItems,
  maybeSaveAddress,
  orderPayloadFromShipping,
} from '@/lib/orderHelpers'

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
      paymentMethod: z.enum(['COD', 'RAZORPAY']).default('COD'),
      notes: z.string().optional().or(z.literal('')),
      saveAddress: z.boolean().optional(),
      addressLabel: z.string().optional(),
      couponCode: z.string().optional().or(z.literal('')),
    })
    const data = schema.parse(await request.json())

    if (data.paymentMethod === 'RAZORPAY') {
      return NextResponse.json(
        { error: 'Use /api/payments/razorpay/create for online payments' },
        { status: 400 }
      )
    }

    const { lineItems, subtotal } = await buildOrderLineItems(data.items)
    let discount = 0
    let couponCode = ''
    let couponType = ''
    let couponValue = 0

    if (data.couponCode) {
      const applied = await validateCoupon(data.couponCode, subtotal)
      discount = applied.discount
      couponCode = applied.code
      couponType = applied.type
      couponValue = applied.value
    }

    const settings = await getStoreSettings()
    const shippingFee = calcShippingFee(subtotal, settings)
    const total = orderTotal({ subtotal, shipping: shippingFee, discount })

    await maybeSaveAddress(
      gate.auth.sub,
      data.shipping,
      data.saveAddress,
      data.addressLabel
    )

    const order = await Order.create(
      orderPayloadFromShipping({
        userId: gate.auth.sub,
        shipping: data.shipping,
        notes: data.notes,
        lineItems,
        subtotal,
        total,
        shippingFee,
        discount,
        couponCode,
        couponType,
        couponValue,
        paymentMethod: 'COD',
        paymentStatus: 'PENDING',
        status: 'CONFIRMED',
      })
    )

    if (couponCode) {
      await redeemCoupon(couponCode)
    }

    void sendOrderEmail(order, {
      email: gate.auth.email,
      name: gate.auth.name || data.shipping.fullName,
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
    return NextResponse.json(
      { error: err.message || 'Could not place order' },
      { status: 500 }
    )
  }
}
