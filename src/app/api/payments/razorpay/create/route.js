import { NextResponse } from 'next/server'
import { z } from 'zod'
import { dbConnect, requireUser } from '@/lib/mongo/auth'
import { Order } from '@/lib/mongo/Order'
import { getRazorpayClient, getRazorpayKeyId } from '@/lib/razorpay'
import {
  buildOrderLineItems,
  maybeSaveAddress,
  orderPayloadFromShipping,
} from '@/lib/orderHelpers'

const shippingSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(10),
  line1: z.string().min(3),
  line2: z.string().optional().or(z.literal('')),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(5),
})

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
      shipping: shippingSchema,
      notes: z.string().optional().or(z.literal('')),
      saveAddress: z.boolean().optional(),
      addressLabel: z.string().optional(),
    })
    const data = schema.parse(await request.json())

    const keyId = getRazorpayKeyId()
    if (!keyId || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        {
          error:
            'Razorpay is not configured. Add NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.',
        },
        { status: 500 }
      )
    }

    const { lineItems, subtotal, total } = await buildOrderLineItems(data.items)
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
        paymentMethod: 'RAZORPAY',
        paymentStatus: 'PENDING',
        status: 'PENDING',
      })
    )

    const razorpay = getRazorpayClient()
    const amountPaise = Math.round(total * 100)
    const rzpOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
      },
    })

    order.razorpayOrderId = rzpOrder.id
    await order.save()

    return NextResponse.json({
      keyId,
      amount: amountPaise,
      currency: 'INR',
      razorpayOrderId: rzpOrder.id,
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      customer: {
        name: data.shipping.fullName,
        email: gate.auth.email || '',
        contact: data.shipping.phone,
      },
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors?.[0]?.message || err.issues?.[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    console.error(err)
    return NextResponse.json(
      { error: err.message || 'Could not start Razorpay payment' },
      { status: 500 }
    )
  }
}
