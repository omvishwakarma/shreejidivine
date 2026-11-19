import { AbandonedCart } from '@/lib/mongo/AbandonedCart'
import { normalizeWhatsappNumber } from '@/lib/whatsapp/phone'

export function abandonedProductLabel(items = []) {
  const list = Array.isArray(items) ? items : []
  if (!list.length) return 'your items'
  const first = String(list[0]?.name || 'Product').trim() || 'Product'
  if (list.length === 1) return first.slice(0, 80)
  return `${first.slice(0, 55)} +${list.length - 1} more`
}

export function cartFingerprint(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((i) =>
      [
        i.productId || '',
        i.colour || '',
        i.fragrance || '',
        i.quantity || 0,
        i.price || 0,
      ].join(':')
    )
    .sort()
    .join('|')
}

export function normalizeAbandonedItems(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item) => ({
      productId: String(item.productId || ''),
      slug: String(item.slug || ''),
      name: String(item.name || 'Product').slice(0, 120),
      price: Math.max(0, Number(item.price) || 0),
      quantity: Math.max(1, Math.min(20, Number(item.quantity) || 1)),
      colour: String(item.colour || '').slice(0, 40),
      fragrance: String(item.fragrance || '').slice(0, 40),
      image: String(item.image || '').slice(0, 500),
    }))
    .filter((item) => item.productId || item.name)
    .slice(0, 30)
}

export async function upsertAbandonedCart({
  phone,
  name = '',
  userId = null,
  items = [],
  subtotal = 0,
}) {
  const normalizedPhone = normalizeWhatsappNumber(phone)
  if (!normalizedPhone) return null

  const normalizedItems = normalizeAbandonedItems(items)
  if (!normalizedItems.length) {
    await AbandonedCart.findOneAndUpdate(
      { phone: normalizedPhone },
      {
        $set: {
          items: [],
          subtotal: 0,
          productLabel: '',
          fingerprint: '',
          recoveredAt: new Date(),
          lastActivityAt: new Date(),
        },
      }
    )
    return null
  }

  const fingerprint = cartFingerprint(normalizedItems)
  const existing = await AbandonedCart.findOne({ phone: normalizedPhone })
  const cartChanged = !existing || existing.fingerprint !== fingerprint
  const now = new Date()

  const update = {
    phone: normalizedPhone,
    name: String(name || existing?.name || '').trim().slice(0, 80),
    user: userId || existing?.user || null,
    items: normalizedItems,
    subtotal: Math.max(0, Number(subtotal) || 0),
    productLabel: abandonedProductLabel(normalizedItems),
    fingerprint,
    recoveredAt: null,
    lastActivityAt: now,
  }

  // Idle clock only restarts when cart contents change — not on sync/focus noise.
  if (cartChanged) {
    update.idleStartedAt = now
    update.reminderSentAt = null
    update.reminderStatus = 'pending'
    update.reminderError = ''
    update.reminder2SentAt = null
    update.reminder2Status = 'pending'
    update.reminder2Error = ''
    update.reminder3SentAt = null
    update.reminder3Status = 'pending'
    update.reminder3Error = ''
  } else if (!existing?.idleStartedAt) {
    update.idleStartedAt = existing?.lastActivityAt || existing?.createdAt || now
  }

  return AbandonedCart.findOneAndUpdate(
    { phone: normalizedPhone },
    { $set: update },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )
}

export async function markAbandonedCartRecovered({ phone, userId = null }) {
  const filter = []
  const normalizedPhone = normalizeWhatsappNumber(phone)
  if (normalizedPhone) filter.push({ phone: normalizedPhone })
  if (userId) filter.push({ user: userId })
  if (!filter.length) return

  await AbandonedCart.updateMany(
    filter.length === 1 ? filter[0] : { $or: filter },
    {
      $set: {
        recoveredAt: new Date(),
        items: [],
        subtotal: 0,
        productLabel: '',
        fingerprint: '',
        lastActivityAt: new Date(),
      },
    }
  )
}

export function abandonedCartDelayMs() {
  const secondsRaw = process.env.ABANDONED_CART_DELAY_SECONDS
  if (secondsRaw !== undefined && secondsRaw !== '') {
    const seconds = Number(secondsRaw)
    if (Number.isFinite(seconds) && seconds > 0) {
      return Math.round(seconds * 1000)
    }
  }

  const minutes = Number(process.env.ABANDONED_CART_DELAY_MINUTES || 30)
  const safe = Number.isFinite(minutes) && minutes > 0 ? minutes : 30
  return Math.round(safe * 60 * 1000)
}

function delayFromEnv({ secondsKey, minutesKey, hoursKey, defaultHours }) {
  const secondsRaw = process.env[secondsKey]
  if (secondsRaw !== undefined && secondsRaw !== '') {
    const seconds = Number(secondsRaw)
    if (Number.isFinite(seconds) && seconds > 0) {
      return Math.round(seconds * 1000)
    }
  }

  const minutesRaw = process.env[minutesKey]
  if (minutesRaw !== undefined && minutesRaw !== '') {
    const minutes = Number(minutesRaw)
    if (Number.isFinite(minutes) && minutes > 0) {
      return Math.round(minutes * 60 * 1000)
    }
  }

  const hours = Number(process.env[hoursKey] || defaultHours)
  const safe = Number.isFinite(hours) && hours > 0 ? hours : defaultHours
  return Math.round(safe * 60 * 60 * 1000)
}

/** Delay after first reminder before sd_abandoned_cart_2 (default 6h). */
export function abandonedCartFollowUpDelayMs() {
  return delayFromEnv({
    secondsKey: 'ABANDONED_CART_FOLLOWUP_SECONDS',
    minutesKey: 'ABANDONED_CART_FOLLOWUP_MINUTES',
    hoursKey: 'ABANDONED_CART_FOLLOWUP_HOURS',
    defaultHours: 6,
  })
}

/** Delay after second reminder before sd_abandoned_cart_3 (default 24h). */
export function abandonedCartFollowUp3DelayMs() {
  return delayFromEnv({
    secondsKey: 'ABANDONED_CART_FOLLOWUP_3_SECONDS',
    minutesKey: 'ABANDONED_CART_FOLLOWUP_3_MINUTES',
    hoursKey: 'ABANDONED_CART_FOLLOWUP_3_HOURS',
    defaultHours: 24,
  })
}

export function cartIdleMs(cart) {
  const start = cart?.idleStartedAt || cart?.lastActivityAt || cart?.updatedAt || cart?.createdAt
  if (!start) return 0
  return Math.max(0, Date.now() - new Date(start).getTime())
}

/** Ms since first abandoned reminder was sent. */
export function cartFollowUpIdleMs(cart) {
  const start = cart?.reminderSentAt
  if (!start) return 0
  return Math.max(0, Date.now() - new Date(start).getTime())
}

/** Ms since second abandoned reminder was sent. */
export function cartFollowUp3IdleMs(cart) {
  const start = cart?.reminder2SentAt
  if (!start) return 0
  return Math.max(0, Date.now() - new Date(start).getTime())
}
