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
  /** Only bump idle timer when cart content actually changes (default). */
  touchActivity = undefined,
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
  // Reminder/focus sync must NOT reset the idle clock when cart is unchanged.
  const shouldTouch =
    touchActivity === true || (touchActivity !== false && cartChanged)

  const update = {
    phone: normalizedPhone,
    name: String(name || existing?.name || '').trim().slice(0, 80),
    user: userId || existing?.user || null,
    items: normalizedItems,
    subtotal: Math.max(0, Number(subtotal) || 0),
    productLabel: abandonedProductLabel(normalizedItems),
    fingerprint,
    recoveredAt: null,
  }

  if (shouldTouch) {
    update.lastActivityAt = new Date()
  } else if (!existing?.lastActivityAt) {
    update.lastActivityAt = existing?.createdAt || new Date()
  }

  if (cartChanged) {
    update.reminderSentAt = null
    update.reminderStatus = 'pending'
    update.reminderError = ''
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
  // Prefer seconds if set. Default minutes = 5 (test window); raise later for prod.
  const secondsRaw = process.env.ABANDONED_CART_DELAY_SECONDS
  if (secondsRaw !== undefined && secondsRaw !== '') {
    const seconds = Number(secondsRaw)
    if (Number.isFinite(seconds) && seconds > 0) {
      return Math.round(seconds * 1000)
    }
  }

  const minutes = Number(process.env.ABANDONED_CART_DELAY_MINUTES || 5)
  const safe = Number.isFinite(minutes) && minutes > 0 ? minutes : 5
  return Math.round(safe * 60 * 1000)
}
