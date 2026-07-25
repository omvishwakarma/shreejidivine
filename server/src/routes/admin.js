import { Router } from 'express'
import { User } from '../models/User.js'
import { Order } from '../models/Order.js'
import { Product } from '../models/Product.js'
import { adminRequired } from '../middleware/auth.js'

const router = Router()

router.get('/stats', adminRequired, async (_req, res) => {
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

  res.json({
    stats: {
      users,
      orders,
      products,
      revenue: revenue[0]?.total || 0,
    },
    recentOrders: recentOrders.map((o) => o.toJSONSafe()),
  })
})

router.get('/users', adminRequired, async (_req, res) => {
  const users = await User.find({ role: 'user' }).sort({ createdAt: -1 })
  res.json({ users: users.map((u) => u.toSafeJSON()) })
})

export default router
