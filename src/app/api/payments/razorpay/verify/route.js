import { NextResponse } from 'next/server'
import { z } from 'zod'
import { dbConnect, requireUser } from '@/lib/mongo/auth'
import { Order } from '@/lib/mongo/Order'
import { verifyRazorpaySignature } from '@/lib/razorpay'
import { sendOrderEmail } from '@/lib/mail'
import { redeemCoupon } from '@/lib/coupons'

export async function POST(request) {
  const gate = await requireUser(request)
  if (gate.error) return gate.error

  try {
    await dbConnect()
    const schema = z.object({
      orderId: z.string().min(1),
      razorpayOrderId: z.string().min(1),
      razorpayPaymentId: z.string().min(1),
      razorpaySignature: z.string().min(1),
    })
    const data = schema.parse(await request.json())

    const order = await Order.findById(data.orderId)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    if (order.user.toString() !== gate.auth.sub && gate.auth.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (order.razorpayOrderId && order.razorpayOrderId !== data.razorpayOrderId) {
      return NextResponse.json({ error: 'Razorpay order mismatch' }, { status: 400 })
    }

    const ok = verifyRazorpaySignature({
      orderId: data.razorpayOrderId,
      paymentId: data.razorpayPaymentId,
      signature: data.razorpaySignature,
    })
    if (!ok) {
      order.paymentStatus = 'FAILED'
      await order.save()
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
    }

    const alreadyPaid = order.paymentStatus === 'PAID'
    order.paymentStatus = 'PAID'
    order.status = 'CONFIRMED'
    order.paymentMethod = 'RAZORPAY'
    order.razorpayOrderId = data.razorpayOrderId
    order.razorpayPaymentId = data.razorpayPaymentId
    order.razorpaySignature = data.razorpaySignature
    await order.save()

    if (!alreadyPaid) {
      if (order.couponCode) {
        await redeemCoupon(order.couponCode)
      }
      void sendOrderEmail(order, {
        email: gate.auth.email,
        name: gate.auth.name || order.shippingName,
      })
    }

    return NextResponse.json({ order: order.toJSONSafe() })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
