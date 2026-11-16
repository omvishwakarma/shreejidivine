import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/mongo/auth'
import { Coupon } from '@/lib/mongo/Coupon'
import {
  couponPublicDescription,
  couponSummary,
  isCouponCurrentlyValid,
} from '@/lib/coupons'
import { findMagicOrder, magicCorsHeaders } from '@/lib/razorpayMagic'

export const dynamic = 'force-dynamic'

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: magicCorsHeaders() })
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    await dbConnect()

    const order = await findMagicOrder({
      orderId: body?.order_id,
      razorpayOrderId: body?.razorpay_order_id,
    })
    const subtotal = Math.max(0, Number(order?.subtotal) || 0)

    const coupons = await Coupon.find({
      active: true,
      publiclyVisible: true,
    })
      .sort({ createdAt: -1 })
      .lean()

    const now = new Date()
    const promotions = coupons
      .filter((coupon) => isCouponCurrentlyValid(coupon, now))
      .filter((coupon) => {
        if (!subtotal) return true
        return subtotal >= (Number(coupon.minOrderAmount) || 0)
      })
      .map((coupon) => ({
        code: coupon.code,
        summary: couponSummary(coupon),
        description: couponPublicDescription(coupon),
      }))

    return NextResponse.json({ promotions }, { headers: magicCorsHeaders() })
  } catch (err) {
    console.error('[magic/get-promotions]', err)
    return NextResponse.json(
      { promotions: [], error: err.message || 'get_promotions_failed' },
      { status: 500, headers: magicCorsHeaders() }
    )
  }
}
