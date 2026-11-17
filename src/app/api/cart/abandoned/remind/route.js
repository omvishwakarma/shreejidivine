import { NextResponse } from 'next/server'
import { z } from 'zod'
import { dbConnect, verifyAuth } from '@/lib/mongo/auth'
import { User } from '@/lib/mongo/User'
import { AbandonedCart } from '@/lib/mongo/AbandonedCart'
import { abandonedCartDelayMs } from '@/lib/abandonedCart'
import { normalizeWhatsappNumber } from '@/lib/whatsapp/phone'
import { notifyWhatsAppAbandonedCart } from '@/lib/whatsapp'

export const dynamic = 'force-dynamic'

/**
 * Send abandoned-cart WhatsApp for one phone after delay.
 * Used so production can test without waiting for Vercel Cron.
 */
export async function POST(request) {
  try {
    await dbConnect()
    const body = await request.json().catch(() => ({}))
    const schema = z.object({
      phone: z.string().optional(),
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

    const cart = await AbandonedCart.findOne({ phone })
    if (!cart || !cart.items?.length || cart.recoveredAt) {
      return NextResponse.json({ ok: false, reason: 'no_active_cart' })
    }

    if (cart.reminderSentAt && cart.reminderStatus === 'sent') {
      return NextResponse.json({
        ok: false,
        reason: 'already_sent',
        sentAt: cart.reminderSentAt,
      })
    }

    const delayMs = abandonedCartDelayMs()
    const idleMs = Date.now() - new Date(cart.lastActivityAt).getTime()
    if (idleMs < delayMs) {
      return NextResponse.json({
        ok: false,
        reason: 'too_soon',
        waitSeconds: Math.ceil((delayMs - idleMs) / 1000),
        delaySeconds: Math.round(delayMs / 1000),
      })
    }

    const result = await notifyWhatsAppAbandonedCart({
      phone: cart.phone,
      name: cart.name || user?.name || '',
      product: cart.productLabel || cart.items?.[0]?.name || 'your items',
      amount: cart.subtotal,
    })

    if (result?.ok) {
      cart.reminderSentAt = new Date()
      cart.reminderStatus = 'sent'
      cart.reminderError = ''
      await cart.save()
      return NextResponse.json({ ok: true, status: 'sent', phone })
    }

    if (result?.skipped) {
      cart.reminderSentAt = new Date()
      cart.reminderStatus = 'skipped'
      cart.reminderError = result.reason || 'skipped'
      await cart.save()
      return NextResponse.json({
        ok: false,
        reason: result.reason || 'skipped',
        status: 'skipped',
      })
    }

    cart.reminderStatus = 'failed'
    cart.reminderError = String(result?.error || 'send_failed').slice(0, 300)
    await cart.save()
    return NextResponse.json(
      { ok: false, reason: cart.reminderError, status: 'failed' },
      { status: 500 }
    )
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    console.error('[cart/abandoned/remind]', err)
    return NextResponse.json({ error: err.message || 'remind_failed' }, { status: 500 })
  }
}
