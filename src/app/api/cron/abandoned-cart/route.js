import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/mongo/auth'
import { AbandonedCart } from '@/lib/mongo/AbandonedCart'
import {
  abandonedCartDelayMs,
  abandonedCartFollowUp3DelayMs,
  abandonedCartFollowUpDelayMs,
} from '@/lib/abandonedCart'
import {
  notifyWhatsAppAbandonedCart,
  notifyWhatsAppAbandonedCartFollowUp,
  notifyWhatsAppAbandonedCartFollowUp3,
} from '@/lib/whatsapp'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function authorized(request) {
  // Vercel Cron invocations include this header.
  if (request.headers.get('x-vercel-cron') === '1') return true

  const secret = String(process.env.CRON_SECRET || '').trim()
  if (!secret) return process.env.NODE_ENV !== 'production'
  const header = request.headers.get('authorization') || ''
  const bearer = header.startsWith('Bearer ') ? header.slice(7) : ''
  const query = request.nextUrl?.searchParams?.get('secret') || ''
  return bearer === secret || query === secret
}

function applyReminderResult(cart, result, step = 1) {
  const fields =
    step === 3
      ? {
          at: 'reminder3SentAt',
          status: 'reminder3Status',
          error: 'reminder3Error',
        }
      : step === 2
        ? {
            at: 'reminder2SentAt',
            status: 'reminder2Status',
            error: 'reminder2Error',
          }
        : {
            at: 'reminderSentAt',
            status: 'reminderStatus',
            error: 'reminderError',
          }

  if (result?.ok) {
    cart[fields.at] = new Date()
    cart[fields.status] = 'sent'
    cart[fields.error] = ''
  } else if (result?.skipped) {
    cart[fields.at] = new Date()
    cart[fields.status] = 'skipped'
    cart[fields.error] = result.reason || 'skipped'
  } else {
    cart[fields.status] = 'failed'
    cart[fields.error] = String(result?.error || 'send_failed').slice(0, 300)
  }

  return {
    phone: cart.phone,
    step,
    status: cart[fields.status],
    error: cart[fields.error] || undefined,
    template: result?.template,
  }
}

async function processFirstReminders() {
  const delayMs = abandonedCartDelayMs()
  const cutoff = new Date(Date.now() - delayMs)

  const carts = await AbandonedCart.find({
    recoveredAt: null,
    reminderSentAt: null,
    reminderStatus: { $in: ['pending', 'failed'] },
    $or: [
      { idleStartedAt: { $lte: cutoff } },
      { idleStartedAt: null, lastActivityAt: { $lte: cutoff } },
    ],
    'items.0': { $exists: true },
  })
    .sort({ idleStartedAt: 1, lastActivityAt: 1 })
    .limit(40)

  const results = []
  for (const cart of carts) {
    const result = await notifyWhatsAppAbandonedCart({
      phone: cart.phone,
      name: cart.name,
      product: cart.productLabel || cart.items?.[0]?.name || 'your items',
      amount: cart.subtotal,
      image: cart.items?.[0]?.image || '',
    })
    results.push(applyReminderResult(cart, result, 1))
    await cart.save()
  }

  return { checked: carts.length, delayMs, results }
}

async function processFollowUps() {
  const delayMs = abandonedCartFollowUpDelayMs()
  const cutoff = new Date(Date.now() - delayMs)

  const carts = await AbandonedCart.find({
    recoveredAt: null,
    reminderSentAt: { $ne: null, $lte: cutoff },
    reminderStatus: 'sent',
    reminder2SentAt: null,
    reminder2Status: { $in: ['pending', 'failed'] },
    'items.0': { $exists: true },
  })
    .sort({ reminderSentAt: 1 })
    .limit(40)

  const results = []
  for (const cart of carts) {
    const result = await notifyWhatsAppAbandonedCartFollowUp({
      phone: cart.phone,
      name: cart.name,
    })
    results.push(applyReminderResult(cart, result, 2))
    await cart.save()
  }

  return { checked: carts.length, delayMs, results }
}

async function processFollowUps3() {
  const delayMs = abandonedCartFollowUp3DelayMs()
  const cutoff = new Date(Date.now() - delayMs)

  const carts = await AbandonedCart.find({
    recoveredAt: null,
    reminder2SentAt: { $ne: null, $lte: cutoff },
    reminder2Status: 'sent',
    reminder3SentAt: null,
    reminder3Status: { $in: ['pending', 'failed'] },
    'items.0': { $exists: true },
  })
    .sort({ reminder2SentAt: 1 })
    .limit(40)

  const results = []
  for (const cart of carts) {
    const result = await notifyWhatsAppAbandonedCartFollowUp3({
      phone: cart.phone,
      name: cart.name,
    })
    results.push(applyReminderResult(cart, result, 3))
    await cart.save()
  }

  return { checked: carts.length, delayMs, results }
}

async function processAbandonedCarts() {
  await dbConnect()
  const first = await processFirstReminders()
  const followUp = await processFollowUps()
  const followUp3 = await processFollowUps3()

  return {
    first: {
      checked: first.checked,
      delayMs: first.delayMs,
      delaySeconds: Math.round(first.delayMs / 1000),
      results: first.results,
    },
    followUp: {
      checked: followUp.checked,
      delayMs: followUp.delayMs,
      delaySeconds: Math.round(followUp.delayMs / 1000),
      results: followUp.results,
    },
    followUp3: {
      checked: followUp3.checked,
      delayMs: followUp3.delayMs,
      delaySeconds: Math.round(followUp3.delayMs / 1000),
      results: followUp3.results,
    },
    // Back-compat summary fields
    checked: first.checked + followUp.checked + followUp3.checked,
    delayMs: first.delayMs,
    delaySeconds: Math.round(first.delayMs / 1000),
    results: [...first.results, ...followUp.results, ...followUp3.results],
  }
}

export async function GET(request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const summary = await processAbandonedCarts()
    return NextResponse.json({ ok: true, ...summary })
  } catch (err) {
    console.error('[cron/abandoned-cart]', err)
    return NextResponse.json(
      { error: err.message || 'abandoned_cart_cron_failed' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  return GET(request)
}
