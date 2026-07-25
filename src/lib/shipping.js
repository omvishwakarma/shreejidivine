import { dbConnect } from '@/lib/mongo/db'
import { StoreSettings, STORE_SETTINGS_DEFAULTS } from '@/lib/mongo/StoreSettings'

export async function getStoreSettings() {
  await dbConnect()
  let doc = await StoreSettings.findOne({ key: 'default' })
  if (!doc) {
    doc = await StoreSettings.create({ key: 'default', ...STORE_SETTINGS_DEFAULTS })
  }
  return doc.toJSONSafe()
}

/**
 * Shipping fee for an order subtotal based on admin settings.
 * Free when shippingFee is 0, or when freeShippingMinOrder > 0 and subtotal meets it.
 */
export function calcShippingFee(subtotal, settings) {
  const fee = Math.max(0, Number(settings?.shippingFee) || 0)
  const minFree = Math.max(0, Number(settings?.freeShippingMinOrder) || 0)
  const base = Math.max(0, Number(subtotal) || 0)
  if (fee === 0) return 0
  if (minFree > 0 && base >= minFree) return 0
  return fee
}

export function shippingNote(settings) {
  const fee = Math.max(0, Number(settings?.shippingFee) || 0)
  const minFree = Math.max(0, Number(settings?.freeShippingMinOrder) || 0)
  if (fee === 0) return 'Pan-India free shipping on all orders'
  if (minFree > 0) {
    return `Free shipping on orders ₹${Math.round(minFree).toLocaleString('en-IN')}+`
  }
  return `Shipping ₹${Math.round(fee).toLocaleString('en-IN')}`
}

export function orderTotal({ subtotal, shipping, discount = 0 }) {
  return Math.max(0, Math.max(0, Number(subtotal) || 0) - Math.max(0, Number(discount) || 0)) +
    Math.max(0, Number(shipping) || 0)
}
