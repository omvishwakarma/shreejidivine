import { NextResponse } from 'next/server'
import { z } from 'zod'
import { dbConnect, requireAdmin } from '@/lib/mongo/auth'
import { Coupon } from '@/lib/mongo/Coupon'
import { Order } from '@/lib/mongo/Order'
import { normalizeCouponCode } from '@/lib/coupons'

export async function GET(request) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error
  await dbConnect()
  const coupons = await Coupon.find().sort({ createdAt: -1 })
  const codes = coupons.map((c) => c.code).filter(Boolean)
  const orders = codes.length
    ? await Order.find({
        couponCode: { $in: codes },
        $or: [{ paymentMethod: 'COD' }, { paymentStatus: 'PAID' }],
      })
        .select('couponCode user shippingName orderNumber status createdAt')
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .lean()
    : []

  const usedByCode = new Map()
  for (const order of orders) {
    const code = normalizeCouponCode(order.couponCode)
    if (!code) continue
    const user = order.user && typeof order.user === 'object' ? order.user : null
    const list = usedByCode.get(code) || []
    list.push({
      id: user?._id?.toString() || '',
      name: user?.name || order.shippingName || 'Customer',
      email: user?.email || '',
      orderNumber: order.orderNumber || '',
      orderId: order._id.toString(),
      cancelled: order.status === 'CANCELLED',
    })
    usedByCode.set(code, list)
  }

  return NextResponse.json({
    coupons: coupons.map((c) => ({
      ...c.toJSONSafe(),
      usedBy: usedByCode.get(c.code) || [],
    })),
  })
}

export async function POST(request) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error

  try {
    await dbConnect()
    const schema = z.object({
      code: z.string().min(2).max(32),
      type: z.enum(['PERCENT', 'FIXED']),
      value: z.number().positive(),
      maxUses: z.number().int().min(0).default(0),
      expiresAt: z.string().nullable().optional(),
      minOrderAmount: z.number().min(0).default(0),
      active: z.boolean().optional(),
      description: z.string().optional(),
    })
    const data = schema.parse(await request.json())
    const code = normalizeCouponCode(data.code)

    if (data.type === 'PERCENT' && data.value > 100) {
      return NextResponse.json(
        { error: 'Percentage cannot exceed 100' },
        { status: 400 }
      )
    }

    const exists = await Coupon.findOne({ code })
    if (exists) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 409 })
    }

    const coupon = await Coupon.create({
      code,
      type: data.type,
      value: data.value,
      maxUses: data.maxUses ?? 0,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      minOrderAmount: data.minOrderAmount ?? 0,
      active: data.active !== false,
      description: data.description || '',
    })

    return NextResponse.json({ coupon: coupon.toJSONSafe() }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors?.[0]?.message || err.issues?.[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    console.error(err)
    return NextResponse.json({ error: 'Could not create coupon' }, { status: 500 })
  }
}
