import { Router } from 'express'
import { z } from 'zod'
import { Order } from '../models/Order.js'
import { Product } from '../models/Product.js'
import { Address } from '../models/Address.js'
import { authRequired, adminRequired, generateOrderNumber } from '../middleware/auth.js'

const router = Router()
const SHIPPING_FEE = 0

router.get('/', authRequired, async (req, res) => {
  const filter = req.auth.role === 'admin' && req.query.all === '1' ? {} : { user: req.auth.sub }
  const orders = await Order.find(filter)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
  res.json({ orders: orders.map((o) => o.toJSONSafe()) })
})

router.get('/:id', authRequired, async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email')
  if (!order) return res.status(404).json({ error: 'Order not found' })
  if (req.auth.role !== 'admin' && order.user._id.toString() !== req.auth.sub) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  res.json({ order: order.toJSONSafe() })
})

router.post('/', authRequired, async (req, res) => {
  try {
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
      paymentMethod: z.enum(['COD']).default('COD'),
      notes: z.string().optional().or(z.literal('')),
      saveAddress: z.boolean().optional(),
      addressLabel: z.string().optional(),
    })
    const data = schema.parse(req.body)

    const lineItems = []
    let subtotal = 0
    for (const item of data.items) {
      const product = await Product.findById(item.productId)
      if (!product || !product.active) {
        return res.status(400).json({ error: `Product not found: ${item.productId}` })
      }
      subtotal += product.price * item.quantity
      lineItems.push({
        product: product._id,
        productName: product.name,
        productSlug: product.slug,
        price: product.price,
        quantity: item.quantity,
        image: product.image,
      })
    }

    if (data.saveAddress) {
      const count = await Address.countDocuments({ user: req.auth.sub })
      if (data.isDefault !== false && count === 0) {
        /* default handled below */
      }
      await Address.create({
        user: req.auth.sub,
        label: data.addressLabel || 'Home',
        ...data.shipping,
        line2: data.shipping.line2 || '',
        isDefault: count === 0,
      })
    }

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      user: req.auth.sub,
      status: 'CONFIRMED',
      paymentMethod: data.paymentMethod,
      subtotal,
      shipping: SHIPPING_FEE,
      total: subtotal + SHIPPING_FEE,
      shippingName: data.shipping.fullName,
      shippingPhone: data.shipping.phone,
      shippingLine1: data.shipping.line1,
      shippingLine2: data.shipping.line2 || '',
      shippingCity: data.shipping.city,
      shippingState: data.shipping.state,
      shippingPincode: data.shipping.pincode,
      notes: data.notes || '',
      items: lineItems,
    })

    res.status(201).json({ order: order.toJSONSafe() })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0]?.message || 'Invalid input' })
    }
    console.error(err)
    res.status(500).json({ error: 'Could not place order' })
  }
})

router.patch('/:id/status', adminRequired, async (req, res) => {
  const { status } = req.body
  const allowed = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' })
  }
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  ).populate('user', 'name email')
  if (!order) return res.status(404).json({ error: 'Order not found' })
  res.json({ order: order.toJSONSafe() })
})

export default router
