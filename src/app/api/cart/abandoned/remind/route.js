import { NextResponse } from 'next/server'
import { z } from 'zod'
import { dbConnect, verifyAuth } from '@/lib/mongo/auth'
import { User } from '@/lib/mongo/User'
import { AbandonedCart } from '@/lib/mongo/AbandonedCart'
import {
  abandonedCartDelayMs,
  abandonedProductLabel,
  upsertAbandonedCart,
} from '@/lib/abandonedCart'
import { normalizeWhatsappNumber } from '@/lib/whatsapp/phone'
import { notifyWhatsAppAbandonedCart } from '@/lib/whatsapp'

export const dynamic = 'force-dynamic'

const itemSchema = z.object({
  productId: z.string().optional(),
  slug: z.string().optional(),
  name: z.string().optional(),
  price: z.number().optional(),
  quantity: z.number().optional(),
  colour: z.string().optional(),
  fragrance: z.string().optional(),
  image: z.string().optional(),
})

async function findActiveCart(phone) {
  const local = phone.slice(-10)
  const carts = await AbandonedCart.find({
    $or: [{ phone }, { phone: local }, { phone: `91${local}` }],
  })
    .sort({ updatedAt: -1 })
    .limit(5)

  return (
    carts.find(
      (c) =>
        !c.recoveredAt &&
        Array.isArray(c.items) &&
        c.items.length > 0
    ) || null
  )
}

/**
 * Send abandoned-cart WhatsApp for one phone after delay.
 * Accepts optional cart items so send still works if sync was missed.
 */
export async function POST(request) {
  try {
    await dbConnect()
    const body = await request.json().catch(() => ({}))
    const schema = z.object({
      phone: z.string().optional(),
      name: z.string().optional(),
      force: z.boolean().optional(),
      items: z.array(itemSchema).optional(),
      subtotal: z.number().optional(),
    })
    const data = schema.parse(body)

    const auth = await verifyAuth(request)
    let user = null
    if (auth?.sub) {
      user = await User.findById(auth.sub).select('name phone').lean()
    }

    const phone =
      normalizeWhatsappNumber(data.phone) ||
      normalizeWhatsappNumber(user?.phone) ||
      ''

    if (!phone) {
      return NextResponse.json({ ok: false, reason: 'phone_required' }, { status: 400 })
    }

    // If client sends cart items, always upsert first (fixes missed sync).
    if (data.items?.length) {
      await upsertAbandonedCart({
        phone,
        name: data.name || user?.name || '',
        userId: auth?.sub || null,
        items: data.items,
        subtotal: data.subtotal,
      })
    }

    let cart = await findActiveCart(phone)

    // Last resort: still no DB cart but client sent items — build ephemeral payload
    if (!cart && data.items?.length) {
      const subtotal =
        data.subtotal != null
          ? Number(data.subtotal)
          : data.items.reduce(
              (sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 1),
              0
            )
      cart = await upsertAbandonedCart({
        phone,
        name: data.name || user?.name || '',
        userId: auth?.sub || null,
        items: data.items,
        subtotal,
      })
    }

    if (!cart || !cart.items?.length) {
      return NextResponse.json({
        ok: false,
        reason: 'no_active_cart',
        phone,
        hint: 'Cart was not saved on server. Keep the tab open after adding items, or retry force with items.',
      })
    }

    if (cart.reminderSentAt && cart.reminderStatus === 'sent') {
      return NextResponse.json({
        ok: false,
        reason: 'already_sent',
        sentAt: cart.reminderSentAt,
        phone: cart.phone,
      })
    }

    const force =
      data.force === true || request.nextUrl?.searchParams?.get('force') === '1'
    const delayMs = abandonedCartDelayMs()
    const idleMs = Date.now() - new Date(cart.lastActivityAt || cart.updatedAt || Date.now()).getTime()
    if (!force && idleMs < delayMs) {
      return NextResponse.json({
        ok: false,
        reason: 'too_soon',
        waitSeconds: Math.ceil((delayMs - idleMs) / 1000),
        delaySeconds: Math.round(delayMs / 1000),
        phone: cart.phone,
        itemCount: cart.items.length,
      })
    }

    const product =
      cart.productLabel ||
      abandonedProductLabel(cart.items) ||
      cart.items?.[0]?.name ||
      'your items'

    const result = await notifyWhatsAppAbandonedCart({
      phone: cart.phone || phone,
      name: cart.name || data.name || user?.name || '',
      product,
      amount: cart.subtotal,
    })

    if (result?.ok) {
      cart.reminderSentAt = new Date()
      cart.reminderStatus = 'sent'
      cart.reminderError = ''
      await cart.save()
      return NextResponse.json({
        ok: true,
        status: 'sent',
        phone: cart.phone,
        product,
        amount: cart.subtotal,
      })
    }

    if (result?.skipped) {
      cart.reminderStatus = 'skipped'
      cart.reminderError = result.reason || 'skipped'
      await cart.save()
      return NextResponse.json({
        ok: false,
        reason: result.reason || 'skipped',
        error: result.reason || 'skipped',
        status: 'skipped',
        phone: cart.phone,
        template: process.env.WHATSAPP_ABANDONED_CART_TEMPLATE || 'sd_abandoned_cart_1',
      })
    }

    const failReason = String(result?.error || 'send_failed').slice(0, 300)
    cart.reminderStatus = 'failed'
    cart.reminderError = failReason
    await cart.save()
    return NextResponse.json({
      ok: false,
      reason: failReason,
      error: failReason,
      status: 'failed',
      phone: cart.phone,
      template: process.env.WHATSAPP_ABANDONED_CART_TEMPLATE || 'sd_abandoned_cart_1',
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', reason: 'invalid_input' }, { status: 400 })
    }
    console.error('[cart/abandoned/remind]', err)
    return NextResponse.json(
      { ok: false, error: err.message || 'remind_failed', reason: err.message || 'remind_failed' },
      { status: 500 }
    )
  }
}
