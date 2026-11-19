import { NextResponse } from 'next/server'
import { z } from 'zod'
import { dbConnect, verifyAuth } from '@/lib/mongo/auth'
import { User } from '@/lib/mongo/User'
import { AbandonedCart } from '@/lib/mongo/AbandonedCart'
import {
  abandonedCartDelayMs,
  abandonedCartFollowUp3DelayMs,
  abandonedCartFollowUpDelayMs,
  abandonedProductLabel,
  cartFollowUp3IdleMs,
  cartFollowUpIdleMs,
  cartIdleMs,
  upsertAbandonedCart,
} from '@/lib/abandonedCart'
import { normalizeWhatsappNumber } from '@/lib/whatsapp/phone'
import {
  notifyWhatsAppAbandonedCart,
  notifyWhatsAppAbandonedCartFollowUp,
  notifyWhatsAppAbandonedCartFollowUp3,
} from '@/lib/whatsapp'

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
      (c) => !c.recoveredAt && Array.isArray(c.items) && c.items.length > 0
    ) || null
  )
}

function template1() {
  return process.env.WHATSAPP_ABANDONED_CART_TEMPLATE || 'sd_abandoned_cart_1'
}

function template2() {
  return process.env.WHATSAPP_ABANDONED_CART_2_TEMPLATE || 'sd_abandoned_cart_2'
}

function template3() {
  return process.env.WHATSAPP_ABANDONED_CART_3_TEMPLATE || 'sd_abandoned_cart_3'
}

function isSent(at, status) {
  return Boolean(at && status === 'sent')
}

export async function POST(request) {
  try {
    await dbConnect()
    const body = await request.json().catch(() => ({}))
    const schema = z.object({
      phone: z.string().optional(),
      name: z.string().optional(),
      force: z.boolean().optional(),
      /** 1 / 2 / 3. Auto next pending step if omitted. */
      step: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
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

    if (data.items?.length) {
      const subtotal =
        data.subtotal != null
          ? Number(data.subtotal)
          : data.items.reduce(
              (sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 1),
              0
            )
      await upsertAbandonedCart({
        phone,
        name: data.name || user?.name || '',
        userId: auth?.sub || null,
        items: data.items,
        subtotal,
      })
    }

    const cart = await findActiveCart(phone)

    if (!cart || !cart.items?.length) {
      return NextResponse.json({
        ok: false,
        reason: 'no_active_cart',
        phone,
        hint: 'Cart was not saved on server. Keep the tab open after adding items.',
      })
    }

    const force =
      data.force === true || request.nextUrl?.searchParams?.get('force') === '1'
    const firstDone = isSent(cart.reminderSentAt, cart.reminderStatus)
    const followUpDone = isSent(cart.reminder2SentAt, cart.reminder2Status)
    const followUp3Done = isSent(cart.reminder3SentAt, cart.reminder3Status)
    const displayName = cart.name || data.name || user?.name || ''

    let step = data.step
    if (!step) {
      if (!firstDone) step = 1
      else if (!followUpDone) step = 2
      else if (!followUp3Done) step = 3
      else {
        return NextResponse.json({
          ok: false,
          reason: 'already_sent',
          step: 3,
          sentAt: cart.reminder3SentAt,
          firstSentAt: cart.reminderSentAt,
          secondSentAt: cart.reminder2SentAt,
          phone: cart.phone,
        })
      }
    }

    if (step === 1 && firstDone) {
      return NextResponse.json({
        ok: false,
        reason: 'already_sent',
        step: 1,
        sentAt: cart.reminderSentAt,
        phone: cart.phone,
        hint: followUpDone
          ? followUp3Done
            ? undefined
            : 'Use step: 3 for the 24h follow-up (sd_abandoned_cart_3).'
          : 'Use step: 2 for the 6h follow-up (sd_abandoned_cart_2).',
      })
    }

    if (step === 2) {
      if (!firstDone) {
        return NextResponse.json({
          ok: false,
          reason: 'first_not_sent',
          phone: cart.phone,
          hint: 'Send step 1 (sd_abandoned_cart_1) before the 6h follow-up.',
        })
      }
      if (followUpDone) {
        return NextResponse.json({
          ok: false,
          reason: 'already_sent',
          step: 2,
          sentAt: cart.reminder2SentAt,
          phone: cart.phone,
          hint: followUp3Done
            ? undefined
            : 'Use step: 3 for the 24h follow-up (sd_abandoned_cart_3).',
        })
      }

      const delayMs = abandonedCartFollowUpDelayMs()
      const sinceFirstMs = cartFollowUpIdleMs(cart)
      if (!force && sinceFirstMs < delayMs) {
        return NextResponse.json({
          ok: false,
          reason: 'too_soon',
          step: 2,
          waitSeconds: Math.ceil((delayMs - sinceFirstMs) / 1000),
          delaySeconds: Math.round(delayMs / 1000),
          sinceFirstSeconds: Math.round(sinceFirstMs / 1000),
          phone: cart.phone,
          itemCount: cart.items.length,
        })
      }

      const result = await notifyWhatsAppAbandonedCartFollowUp({
        phone: cart.phone || phone,
        name: displayName,
      })

      if (result?.ok) {
        cart.reminder2SentAt = new Date()
        cart.reminder2Status = 'sent'
        cart.reminder2Error = ''
        await cart.save()
        return NextResponse.json({
          ok: true,
          status: 'sent',
          step: 2,
          phone: cart.phone,
          template: result.template || template2(),
        })
      }

      if (result?.skipped) {
        cart.reminder2Status = 'skipped'
        cart.reminder2Error = result.reason || 'skipped'
        await cart.save()
        return NextResponse.json({
          ok: false,
          reason: result.reason || 'skipped',
          error: result.reason || 'skipped',
          status: 'skipped',
          step: 2,
          phone: cart.phone,
          template: result.template || template2(),
        })
      }

      const failReason = String(result?.error || 'send_failed').slice(0, 300)
      cart.reminder2Status = 'failed'
      cart.reminder2Error = failReason
      await cart.save()
      return NextResponse.json({
        ok: false,
        reason: failReason,
        error: failReason,
        status: 'failed',
        step: 2,
        phone: cart.phone,
        template: result?.template || template2(),
      })
    }

    if (step === 3) {
      if (!followUpDone) {
        return NextResponse.json({
          ok: false,
          reason: 'second_not_sent',
          phone: cart.phone,
          hint: 'Send step 2 (sd_abandoned_cart_2) before the 24h follow-up.',
        })
      }
      if (followUp3Done) {
        return NextResponse.json({
          ok: false,
          reason: 'already_sent',
          step: 3,
          sentAt: cart.reminder3SentAt,
          phone: cart.phone,
        })
      }

      const delayMs = abandonedCartFollowUp3DelayMs()
      const sinceSecondMs = cartFollowUp3IdleMs(cart)
      if (!force && sinceSecondMs < delayMs) {
        return NextResponse.json({
          ok: false,
          reason: 'too_soon',
          step: 3,
          waitSeconds: Math.ceil((delayMs - sinceSecondMs) / 1000),
          delaySeconds: Math.round(delayMs / 1000),
          sinceSecondSeconds: Math.round(sinceSecondMs / 1000),
          phone: cart.phone,
          itemCount: cart.items.length,
        })
      }

      const result = await notifyWhatsAppAbandonedCartFollowUp3({
        phone: cart.phone || phone,
        name: displayName,
      })

      if (result?.ok) {
        cart.reminder3SentAt = new Date()
        cart.reminder3Status = 'sent'
        cart.reminder3Error = ''
        await cart.save()
        return NextResponse.json({
          ok: true,
          status: 'sent',
          step: 3,
          phone: cart.phone,
          template: result.template || template3(),
        })
      }

      if (result?.skipped) {
        cart.reminder3Status = 'skipped'
        cart.reminder3Error = result.reason || 'skipped'
        await cart.save()
        return NextResponse.json({
          ok: false,
          reason: result.reason || 'skipped',
          error: result.reason || 'skipped',
          status: 'skipped',
          step: 3,
          phone: cart.phone,
          template: result.template || template3(),
        })
      }

      const failReason = String(result?.error || 'send_failed').slice(0, 300)
      cart.reminder3Status = 'failed'
      cart.reminder3Error = failReason
      await cart.save()
      return NextResponse.json({
        ok: false,
        reason: failReason,
        error: failReason,
        status: 'failed',
        step: 3,
        phone: cart.phone,
        template: result?.template || template3(),
      })
    }

    // —— Step 1 (sd_abandoned_cart_1) ——
    const delayMs = abandonedCartDelayMs()
    const idleMs = cartIdleMs(cart)
    if (!force && idleMs < delayMs) {
      return NextResponse.json({
        ok: false,
        reason: 'too_soon',
        step: 1,
        waitSeconds: Math.ceil((delayMs - idleMs) / 1000),
        delaySeconds: Math.round(delayMs / 1000),
        idleSeconds: Math.round(idleMs / 1000),
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
      name: displayName,
      product,
      amount: cart.subtotal,
      image: cart.items?.[0]?.image || '',
    })

    if (result?.ok) {
      cart.reminderSentAt = new Date()
      cart.reminderStatus = 'sent'
      cart.reminderError = ''
      await cart.save()
      return NextResponse.json({
        ok: true,
        status: 'sent',
        step: 1,
        phone: cart.phone,
        product,
        amount: cart.subtotal,
        template: result.template || template1(),
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
        step: 1,
        phone: cart.phone,
        template: result.template || template1(),
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
      step: 1,
      phone: cart.phone,
      template: result?.template || template1(),
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
