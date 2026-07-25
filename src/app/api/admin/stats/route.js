import { NextResponse } from 'next/server'
import { dbConnect, requireAdmin } from '@/lib/mongo/auth'
import { User } from '@/lib/mongo/User'
import { Order } from '@/lib/mongo/Order'
import { Product } from '@/lib/mongo/Product'

export async function GET(request) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error
  await dbConnect()
  const [users, orders, products, revenue] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Order.countDocuments(),
    Product.countDocuments(),
    Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
  ])
  const recentOrders = await Order.find()
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(8)

  return NextResponse.json({
    stats: {
      users,
      orders,
      products,
      revenue: revenue[0]?.total || 0,
    },
    recentOrders: recentOrders.map((o) => o.toJSONSafe()),
  })
}
