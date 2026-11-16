import { NextResponse } from 'next/server'
import { z } from 'zod'
import { dbConnect, requireUser } from '@/lib/mongo/auth'
import { Order } from '@/lib/mongo/Order'
import { getRazorpayClient, getRazorpayKeyId, razorpayErrorMessage } from '@/lib/razorpay'
import { validateCoupon, redeemCoupon } from '@/lib/coupons'
import { sendOrderEmail } from '@/lib/mail'
import { notifyWhatsAppOrderPlaced } from '@/lib/whatsapp'
import { SITE_URL } from '@/lib/site'

export const maxDuration = 30
import { applyCartRewards } from '@/lib/cartRewards'
import { calcShippingFee, getStoreSettings, orderTotal } from '@/lib/shipping'
import {
  buildOrderLineItems,
  maybeSaveAddress,
  orderPayloadFromShipping,
} from '@/lib/orderHelpers'

function toPaise(amount) {
  return Math.max(0, Math.round(Number(amount) || 0) * 100)
}

function absoluteUrl(pathOrUrl) {
  const value = String(pathOrUrl || '').trim()
  if (!value) return `${SITE_URL}/images/logo.png`
  if (/^https?:\/\//i.test(value)) return value
  return `${SITE_URL}${value.startsWith('/') ? value : `/${value}`}`
}

/** Magic Checkout requires line_items + line_items_total or it falls back to Standard Checkout. */
function buildMagicRazorpayLineItems(lineItems) {
  return lineItems.map((item, index) => {
    const unitPaise = toPaise(item.price)
    const variantParts = [item.colour, item.fragrance].filter(Boolean)
    const variant = variantParts.join(' / ') || 'default'
    const sku = String(item.productSlug || item.product || `item-${index + 1}`)
    return {
      sku,
      variant_id: `${sku}-${variant}`.slice(0, 120),
      price: unitPaise,
      offer_price: unitPaise,
      quantity: Math.max(1, Number(item.quantity) || 1),
      name: item.productName || 'Shreeji Divine product',
      description:
        variant !== 'default'
          ? variant
          : item.productName || 'Shreeji Divine spiritual wearable',
      image_url: absoluteUrl(item.image),
      product_url: item.productSlug
        ? `${SITE_URL}/shop/${item.productSlug}`
        : `${SITE_URL}/shop`,
    }
  })
}

const shippingSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(10),
  line1: z.string().min(3),
  line2: z.string().optional().or(z.literal('')),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(5),
})

export async function POST(request) {
  const gate = await requireUser(request)
  if (gate.error) return gate.error

  try {
    await dbConnect()
    const schema = z.object({
      items: z
        .array(
          z.object({
            productId: z.string(),
            quantity: z.number().int().min(1).max(20),
            colour: z.string().optional().default(''),
            fragrance: z.string().optional().default(''),
          })
        )
        .min(1),
      shipping: shippingSchema,
      notes: z.string().optional().or(z.literal('')),
      saveAddress: z.boolean().optional(),
      addressLabel: z.string().optional(),
      couponCode: z.string().optional().or(z.literal('')),
    })
    const data = schema.parse(await request.json())

    const keyId = getRazorpayKeyId()
    if (!keyId || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        {
          error:
            'Razorpay is not configured. Add NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.',
        },
        { status: 500 }
      )
    }

    const { lineItems, subtotal } = await buildOrderLineItems(data.items)
    let discount = 0
    let couponCode = ''
    let couponType = ''
    let couponValue = 0

    if (data.couponCode) {
      const applied = await validateCoupon(data.couponCode, subtotal)
      discount = applied.discount
      couponCode = applied.code
      couponType = applied.type
      couponValue = applied.value
    }

    const settings = await getStoreSettings()
    const rewards = applyCartRewards(subtotal, settings.cartRewards, Math.max(0, subtotal - discount))
    const shippingFee = calcShippingFee(subtotal, settings)
    const total = orderTotal({
      subtotal,
      shipping: shippingFee,
      discount,
      rewardDiscount: rewards.discount,
    })

    await maybeSaveAddress(
      gate.auth.sub,
      data.shipping,
      data.saveAddress,
      data.addressLabel
    )

    // Fully discounted orders — no Razorpay charge
    if (total <= 0) {
      const order = await Order.create(
        orderPayloadFromShipping({
          userId: gate.auth.sub,
          shipping: data.shipping,
          notes: data.notes,
          lineItems,
          subtotal,
          total: 0,
          shippingFee,
          discount,
          rewardDiscount: rewards.discount,
          rewardLabel: rewards.label,
          couponCode,
          couponType,
          couponValue,
          paymentMethod: 'COD',
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
        })
      )
      if (couponCode) await redeemCoupon(couponCode)
      void sendOrderEmail(order, {
        email: gate.auth.email,
        name: gate.auth.name || data.shipping.fullName,
      })
      await notifyWhatsAppOrderPlaced(order, {
        email: gate.auth.email,
        name: gate.auth.name || data.shipping.fullName,
        phone: data.shipping.phone,
      })
      return NextResponse.json({
        freeOrder: true,
        orderId: order._id.toString(),
        order: order.toJSONSafe(),
      })
    }

    const order = await Order.create(
      orderPayloadFromShipping({
        userId: gate.auth.sub,
        shipping: data.shipping,
        notes: data.notes,
        lineItems,
        subtotal,
        total,
        shippingFee,
        discount,
        rewardDiscount: rewards.discount,
        rewardLabel: rewards.label,
        couponCode,
        couponType,
        couponValue,
        paymentMethod: 'RAZORPAY',
        paymentStatus: 'PENDING',
        status: 'PENDING',
      })
    )

    const razorpay = getRazorpayClient()
    const amountPaise = toPaise(total)
    const merchandiseAfterDiscount = Math.max(
      0,
      subtotal - discount - rewards.discount
    )
    const lineItemsTotalPaise = toPaise(merchandiseAfterDiscount)
    const rzpLineItems = buildMagicRazorpayLineItems(lineItems)
    const rzpOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: order.orderNumber,
      line_items_total: lineItemsTotalPaise,
      line_items: rzpLineItems,
      notes: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        prediscount_applied: String(toPaise(discount + rewards.discount)),
      },
    })

    order.razorpayOrderId = rzpOrder.id
    await order.save()

    return NextResponse.json({
      keyId,
      amount: amountPaise,
      currency: 'INR',
      razorpayOrderId: rzpOrder.id,
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      customer: {
        name: data.shipping.fullName,
        email: gate.auth.email || '',
        contact: data.shipping.phone,
      },
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors?.[0]?.message || err.issues?.[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    console.error('Razorpay create payment failed:', err)
    return NextResponse.json(
      { error: razorpayErrorMessage(err) },
      { status: err?.statusCode === 401 ? 502 : 500 }
    )
  }
}
