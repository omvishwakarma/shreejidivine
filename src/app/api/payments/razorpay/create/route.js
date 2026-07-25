import { NextResponse } from 'next/server'
import { z } from 'zod'
import { dbConnect, requireUser } from '@/lib/mongo/auth'
import { Order } from '@/lib/mongo/Order'
import { getRazorpayClient, getRazorpayKeyId } from '@/lib/razorpay'
import { validateCoupon, redeemCoupon } from '@/lib/coupons'
import { sendOrderEmail } from '@/lib/mail'
import { calcShippingFee, getStoreSettings, orderTotal } from '@/lib/shipping'
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
      couponCode: z.string().optional().or(z.literal('')),
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

    // Fully discounted orders — no Razorpay charge
    if (total <= 0) {
      const order = await Order.create(
        orderPayloadFromShipping({
          userId: gate.auth.sub,
          shipping: data.shipping,
          notes: data.notes,
          lineItems,
          subtotal,
          total: 0,
          shippingFee,
          discount,
          couponCode,
          couponType,
          couponValue,
          paymentMethod: 'COD',
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
        })
      )
      if (couponCode) await redeemCoupon(couponCode)
      void sendOrderEmail(order, {
        email: gate.auth.email,
        name: gate.auth.name || data.shipping.fullName,
      })
      return NextResponse.json({
        freeOrder: true,
        orderId: order._id.toString(),
        order: order.toJSONSafe(),
      })
    }

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
