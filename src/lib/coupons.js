import { Coupon } from '@/lib/mongo/Coupon'

export function normalizeCouponCode(code) {
  return String(code || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
}

export function calcDiscount({ type, value }, subtotal) {
  const base = Math.max(0, Number(subtotal) || 0)
  if (base <= 0) return 0

  let discount = 0
  if (type === 'PERCENT') {
    const pct = Math.min(100, Math.max(0, Number(value) || 0))
    discount = Math.round((base * pct) / 100)
  } else {
    discount = Math.round(Math.max(0, Number(value) || 0))
  }

  return Math.min(discount, base)
}

/**
 * Validate coupon against current subtotal. Does not increment usage.
 */
export async function validateCoupon(code, subtotal) {
  const normalized = normalizeCouponCode(code)
  if (!normalized) {
    throw new Error('Enter a coupon code')
  }

  const coupon = await Coupon.findOne({ code: normalized })
  if (!coupon || !coupon.active) {
    throw new Error('Invalid or inactive coupon')
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    throw new Error('This coupon has expired')
  }

  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
    throw new Error('This coupon has reached its usage limit')
  }

  const orderAmount = Math.max(0, Number(subtotal) || 0)
  if (orderAmount < (coupon.minOrderAmount || 0)) {
    throw new Error(
      `Minimum order of ₹${coupon.minOrderAmount} required for this coupon`
    )
  }

  if (coupon.type === 'PERCENT' && (coupon.value <= 0 || coupon.value > 100)) {
    throw new Error('Invalid percentage coupon')
  }
  if (coupon.type === 'FIXED' && coupon.value <= 0) {
    throw new Error('Invalid fixed coupon')
  }

  const discount = calcDiscount(coupon, orderAmount)
  if (discount <= 0) {
    throw new Error('Coupon does not apply to this order')
  }

  return {
    coupon,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    discount,
  }
}

/**
 * Atomically redeem one use. Call only when order is confirmed/paid.
 */
export async function redeemCoupon(code) {
  const normalized = normalizeCouponCode(code)
  if (!normalized) return null

  const coupon = await Coupon.findOneAndUpdate(
    {
      code: normalized,
      active: true,
      $or: [{ maxUses: 0 }, { $expr: { $lt: ['$usedCount', '$maxUses'] } }],
    },
    { $inc: { usedCount: 1 } },
    { new: true }
  )

  return coupon
}
