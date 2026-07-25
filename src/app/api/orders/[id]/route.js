import { NextResponse } from 'next/server'
import { dbConnect, requireUser, requireAdmin } from '../../../../../lib/mongo/auth'
import { Order } from '../../../../../lib/mongo/Order'

export async function GET(request, { params }) {
  const gate = await requireUser(request)
  if (gate.error) return gate.error
  await dbConnect()
  const { id } = await params
  const order = await Order.findById(id).populate('user', 'name email')
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }
  const ownerId = order.user?._id?.toString?.() || order.user?.toString?.()
  if (gate.auth.role !== 'admin' && ownerId !== gate.auth.sub) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return NextResponse.json({ order: order.toJSONSafe() })
}
