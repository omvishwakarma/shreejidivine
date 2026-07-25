import { NextResponse } from 'next/server'
import { dbConnect, requireAdmin } from '@/lib/mongo/auth'
import { User } from '@/lib/mongo/User'
import { Order } from '@/lib/mongo/Order'

export async function GET(request, { params }) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error

  await dbConnect()
  const { id } = await params

  const user = await User.findById(id)
  if (!user || user.role === 'admin') {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const orders = await Order.find({ user: user._id })
    .sort({ createdAt: -1 })
    .populate('user', 'name email')

  return NextResponse.json({
    user: user.toSafeJSON(),
    orders: orders.map((o) => o.toJSONSafe()),
  })
}
