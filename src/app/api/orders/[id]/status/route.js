import { NextResponse } from 'next/server'
import { dbConnect, requireAdmin } from '@/lib/mongo/auth'
import { Order } from '@/lib/mongo/Order'
import { notifyWhatsAppOrderStatus } from '@/lib/whatsapp'

export async function PATCH(request, { params }) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error
  await dbConnect()
  const { id } = await params
  const { status } = await request.json()
  const allowed = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }
  const order = await Order.findByIdAndUpdate(id, { status }, { new: true }).populate(
    'user',
    'name email phone'
  )
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  // Await on Vercel — fire-and-forget is frozen after the response returns.
  await notifyWhatsAppOrderStatus(order, status, {
    name: order.shippingName || order.user?.name,
    phone: order.shippingPhone || order.user?.phone,
  })

  return NextResponse.json({ order: order.toJSONSafe() })
}
