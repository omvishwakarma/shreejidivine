import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/mongo/auth'
import { applyCartRewards } from '@/lib/cartRewards'
import { validateCoupon } from '@/lib/coupons'
import {
  findMagicOrder,
  magicCorsHeaders,
  magicFailure,
} from '@/lib/razorpayMagic'
import { getStoreSettings, orderTotal } from '@/lib/shipping'

export const dynamic = 'force-dynamic'

function mapCouponFailure(message) {
  const text = String(message || 'Invalid coupon')
  const lower = text.toLowerCase()
  if (lower.includes('minimum') || lower.includes('does not apply')) {
    return magicFailure('REQUIREMENT_NOT_MET', text)
  }
  if (lower.includes('login') || lower.includes('registered')) {
    return magicFailure('LOGIN_REQUIRED', text)
  }
  return magicFailure('INVALID_PROMOTION', text)
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: magicCorsHeaders() })
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const code = String(body?.code || '').trim()
    if (!code) {
      const fail = magicFailure('INVALID_PROMOTION', 'Enter a coupon code')
      return NextResponse.json(fail.body, { status: fail.status, headers: magicCorsHeaders() })
    }

    await dbConnect()
    const order = await findMagicOrder({
      orderId: body?.order_id,
      razorpayOrderId: body?.razorpay_order_id,
    })

    if (!order) {
      const fail = magicFailure('INVALID_PROMOTION', 'Order not found for this promotion')
      return NextResponse.json(fail.body, { status: fail.status, headers: magicCorsHeaders() })
    }

    const subtotal = Math.max(0, Number(order.subtotal) || 0)

    let applied
    try {
      applied = await validateCoupon(code, subtotal)
    } catch (err) {
      const fail = mapCouponFailure(err.message)
      return NextResponse.json(fail.body, { status: fail.status, headers: magicCorsHeaders() })
    }

    const settings = await getStoreSettings()
    const rewards = applyCartRewards(
      subtotal,
      settings.cartRewards,
      Math.max(0, subtotal - applied.discount)
    )
    const shippingFee = Math.max(0, Number(order.shipping) || 0)
    const total = orderTotal({
      subtotal,
      shipping: shippingFee,
      discount: applied.discount,
      rewardDiscount: rewards.discount,
    })

    order.discount = applied.discount
    order.couponCode = applied.code
    order.couponType = applied.type
    order.couponValue = applied.value
    order.rewardDiscount = rewards.discount
    order.rewardLabel = rewards.label || ''
    order.total = Math.max(0, total)
    await order.save()

    // Razorpay applies `value` as-is in paise regardless of value_type.
    const valuePaise = Math.round(applied.discount * 100)

    return NextResponse.json(
      {
        promotion: {
          reference_id: applied.coupon._id.toString(),
          type: 'coupon',
          code: applied.code,
          value: valuePaise,
          value_type: 'fixed_amount',
          description:
            applied.coupon.description ||
            (applied.type === 'PERCENT'
              ? `${applied.value}% off`
              : `₹${applied.value} off`),
        },
      },
      { headers: magicCorsHeaders() }
    )
  } catch (err) {
    console.error('[magic/apply-promotions]', err)
    const fail = magicFailure('INVALID_PROMOTION', err.message || 'Could not apply promotion')
    return NextResponse.json(fail.body, {
      status: 500,
      headers: magicCorsHeaders(),
    })
  }
}
