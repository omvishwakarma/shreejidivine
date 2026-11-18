import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/mongo/auth'
import { AbandonedCart } from '@/lib/mongo/AbandonedCart'
import { abandonedCartDelayMs } from '@/lib/abandonedCart'
import { notifyWhatsAppAbandonedCart } from '@/lib/whatsapp'

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

async function processAbandonedCarts() {
  await dbConnect()
  const delayMs = abandonedCartDelayMs()
  const cutoff = new Date(Date.now() - delayMs)

  const carts = await AbandonedCart.find({
    recoveredAt: null,
    reminderSentAt: null,
    reminderStatus: { $in: ['pending', 'failed'] },
    $or: [{ idleStartedAt: { $lte: cutoff } }, { idleStartedAt: null, lastActivityAt: { $lte: cutoff } }],
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

    if (result?.ok) {
      cart.reminderSentAt = new Date()
      cart.reminderStatus = 'sent'
      cart.reminderError = ''
    } else if (result?.skipped) {
      cart.reminderSentAt = new Date()
      cart.reminderStatus = 'skipped'
      cart.reminderError = result.reason || 'skipped'
    } else {
      cart.reminderStatus = 'failed'
      cart.reminderError = String(result?.error || 'send_failed').slice(0, 300)
    }
    await cart.save()
    results.push({
      phone: cart.phone,
      status: cart.reminderStatus,
      error: cart.reminderError || undefined,
    })
  }

  return {
    checked: carts.length,
    delayMs,
    delaySeconds: Math.round(delayMs / 1000),
    results,
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
