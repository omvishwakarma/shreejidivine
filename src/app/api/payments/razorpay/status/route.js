import { NextResponse } from 'next/server'
import { dbConnect, requireUser } from '@/lib/mongo/auth'
import { Order } from '@/lib/mongo/Order'
import { getRazorpayClient } from '@/lib/razorpay'

export const PAYMENT_FAILED_MESSAGE =
  'Payment failed. If money was deducted, it will return to your bank in 5–7 business days. Please try again.'

export async function GET(request) {
  const gate = await requireUser(request)
  if (gate.error) return gate.error

  try {
    await dbConnect()
    const orderId = new URL(request.url).searchParams.get('orderId') || ''
    if (!orderId) {
      return NextResponse.json({ status: 'pending' })
    }

    const order = await Order.findById(orderId)
    if (!order || (order.user.toString() !== gate.auth.sub && gate.auth.role !== 'admin')) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    if (order.paymentStatus === 'PAID') {
      return NextResponse.json({ status: 'paid' })
    }
    if (!order.razorpayOrderId) {
      return NextResponse.json({ status: 'pending' })
    }

    const razorpay = getRazorpayClient()
    const result = await razorpay.orders.fetchPayments(order.razorpayOrderId)
    const items = Array.isArray(result?.items) ? result.items : []
    const captured = items.some((item) => item.status === 'captured' || item.status === 'authorized')
    if (captured) {
      return NextResponse.json({ status: 'paid' })
    }

    const failed = items.some((item) => item.status === 'failed')
    const inProgress = items.some((item) => item.status === 'created')
    if (failed && !inProgress) {
      if (order.paymentStatus === 'PENDING') {
        order.paymentStatus = 'FAILED'
        await order.save()
      }
      return NextResponse.json({ status: 'failed', message: PAYMENT_FAILED_MESSAGE })
    }

    return NextResponse.json({ status: 'pending' })
  } catch (err) {
    console.error('Razorpay payment status failed:', err)
    return NextResponse.json({ status: 'pending' })
  }
}
