import { CONTACT_EMAIL, SITE_URL } from '../site'
import { sendWhatsAppTemplate, isWhatsAppConfigured } from './client'
import { buildTemplateComponents, WA_TEMPLATES } from './templates'
import { normalizeWhatsappNumber } from './phone'

function firstName(value) {
  const name = String(value || '').trim()
  if (!name) return 'Ji'
  return name.split(/\s+/)[0]
}

function money(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '0'
  return String(Math.round(n))
}

function orderPhone(order, customer = {}) {
  return (
    normalizeWhatsappNumber(order?.shippingPhone) ||
    normalizeWhatsappNumber(customer.phone) ||
    normalizeWhatsappNumber(order?.user?.phone) ||
    ''
  )
}

function orderLabel(order) {
  return String(order?.orderNumber || order?.id || '').trim() || 'your order'
}

function paymentLabel(order) {
  if (order?.paymentMethod === 'COD') return 'Cash on Delivery'
  if (order?.paymentMethod === 'RAZORPAY') return 'Online (Razorpay)'
  return String(order?.paymentMethod || 'Online')
}

function addressLine(order) {
  return [order?.shippingLine1, order?.shippingCity, order?.shippingPincode]
    .filter(Boolean)
    .join(', ')
    .slice(0, 200)
}

function trackUrl(order) {
  const waybill = String(order?.delhiveryWaybill || '').trim()
  if (waybill) {
    return `https://www.delhivery.com/track/package/${encodeURIComponent(waybill)}`
  }
  return `${SITE_URL.replace(/\/$/, '')}/profile`
}

async function sendSafe(to, template, params, callbackData) {
  if (!isWhatsAppConfigured()) {
    console.warn('[whatsapp] skipped — WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID missing')
    return { skipped: true, reason: 'not_configured' }
  }
  if (!to) {
    console.warn('[whatsapp] skipped — no phone on order')
    return { skipped: true, reason: 'invalid_phone' }
  }
  try {
    const result = await sendWhatsAppTemplate({
      to,
      template,
      components: buildTemplateComponents(template, params),
      callbackData,
    })
    console.info('[whatsapp] sent', template, to)
    return result
  } catch (err) {
    console.error('[whatsapp]', template, err.message || err)
    return { error: err.message || 'send_failed' }
  }
}

async function markSent(order, key) {
  if (!order || typeof order.save !== 'function') return
  const list = Array.isArray(order.whatsappSent) ? order.whatsappSent : []
  if (list.includes(key)) return false
  order.whatsappSent = [...list, key]
  try {
    await order.save()
  } catch (err) {
    console.error('[whatsapp] markSent', err.message || err)
  }
  return true
}

function alreadySent(order, key) {
  return Array.isArray(order?.whatsappSent) && order.whatsappSent.includes(key)
}

export async function notifyWhatsAppWelcome(user) {
  const to = normalizeWhatsappNumber(user?.phone)
  if (!to) return { skipped: true }
  return sendSafe(
    to,
    WA_TEMPLATES.welcome,
    { name: firstName(user?.name) },
    `welcome:${user?.id || ''}`
  )
}

export async function notifyWhatsAppOrderPlaced(order, customer = {}) {
  const to = orderPhone(order, customer)
  if (!to) return { skipped: true }

  const name = firstName(customer.name || order?.shippingName || order?.user?.name)
  const orderId = orderLabel(order)
  const amount = money(order?.total)
  const results = []

  const confirmKey = `confirm:${orderId}`
  if (!alreadySent(order, confirmKey)) {
    const result = await sendSafe(
      to,
      WA_TEMPLATES.orderConfirmation,
      {
        name,
        orderId,
        amount,
        paymentMethod: paymentLabel(order),
      },
      confirmKey
    )
    results.push(result)
    if (result?.ok) await markSent(order, confirmKey)
  }

  if (order?.paymentMethod === 'COD' && order?.paymentStatus !== 'PAID') {
    const codKey = `cod_verify:${orderId}`
    if (!alreadySent(order, codKey)) {
      const result = await sendSafe(
        to,
        WA_TEMPLATES.codVerification,
        {
          name,
          orderId,
          amount,
          address: addressLine(order) || 'your address',
        },
        codKey
      )
      results.push(result)
      if (result?.ok) await markSent(order, codKey)
    }
  }

  return { ok: true, results }
}

export async function notifyWhatsAppShipped(order, customer = {}) {
  const to = orderPhone(order, customer)
  if (!to) return { skipped: true }
  const orderId = orderLabel(order)
  const key = `shipped:${orderId}`
  if (alreadySent(order, key)) return { skipped: true, reason: 'already_sent' }

  const waybill = String(order?.delhiveryWaybill || '').trim() || 'Pending'
  const result = await sendSafe(
    to,
    WA_TEMPLATES.orderShipped,
    {
      name: firstName(customer.name || order?.shippingName || order?.user?.name),
      orderId,
      courier: 'Delhivery',
      trackingId: waybill,
      trackUrl: trackUrl(order),
    },
    key
  )
  if (result?.ok) await markSent(order, key)
  return result
}

/**
 * Send the WhatsApp template that matches an order status.
 * @param {object} [options]
 * @param {boolean} [options.force] — admin status change: send even if sent before
 */
export async function notifyWhatsAppOrderStatus(order, status, customer = {}, options = {}) {
  const force = Boolean(options.force)
  const to = orderPhone(order, customer)
  if (!to) {
    return {
      skipped: true,
      reason: 'invalid_phone',
      shippingPhone: order?.shippingPhone || '',
      customerPhone: customer?.phone || '',
    }
  }

  const name = firstName(customer.name || order?.shippingName || order?.user?.name)
  const orderId = orderLabel(order)
  const amount = money(order?.total)
  const next = String(status || order?.status || '').toUpperCase()

  if (next === 'PENDING') {
    return { skipped: true, reason: 'no_template', status: next }
  }

  if (next === 'CONFIRMED') {
    if (order?.paymentMethod === 'COD' && order?.paymentStatus !== 'PAID') {
      const key = `cod_confirmed:${orderId}`
      if (!force && alreadySent(order, key)) return { skipped: true, reason: 'already_sent', key }
      const result = await sendSafe(
        to,
        WA_TEMPLATES.codConfirmed,
        { name, orderId, amount },
        key
      )
      if (result?.ok) await markSent(order, key)
      return { ...result, status: next, template: WA_TEMPLATES.codConfirmed }
    }

    const key = `confirm:${orderId}`
    if (!force && alreadySent(order, key)) return { skipped: true, reason: 'already_sent', key }
    const result = await sendSafe(
      to,
      WA_TEMPLATES.orderConfirmation,
      {
        name,
        orderId,
        amount,
        paymentMethod: paymentLabel(order),
      },
      key
    )
    if (result?.ok) await markSent(order, key)
    return { ...result, status: next, template: WA_TEMPLATES.orderConfirmation }
  }

  if (next === 'SHIPPED') {
    const key = `shipped:${orderId}`
    if (!force && alreadySent(order, key)) return { skipped: true, reason: 'already_sent', key }
    const waybill = String(order?.delhiveryWaybill || '').trim() || 'Pending'
    const result = await sendSafe(
      to,
      WA_TEMPLATES.orderShipped,
      {
        name,
        orderId,
        courier: 'Delhivery',
        trackingId: waybill,
        trackUrl: trackUrl(order),
      },
      key
    )
    if (result?.ok) await markSent(order, key)
    return { ...result, status: next, template: WA_TEMPLATES.orderShipped }
  }

  if (next === 'DELIVERED') {
    const key = `delivered:${orderId}`
    if (!force && alreadySent(order, key)) return { skipped: true, reason: 'already_sent', key }
    const result = await sendSafe(
      to,
      WA_TEMPLATES.orderDelivered,
      { name, orderId },
      key
    )
    if (result?.ok) await markSent(order, key)
    return { ...result, status: next, template: WA_TEMPLATES.orderDelivered }
  }

  if (next === 'CANCELLED') {
    const key = `cancelled:${orderId}`
    if (!force && alreadySent(order, key)) return { skipped: true, reason: 'already_sent', key }
    const result = await sendSafe(
      to,
      WA_TEMPLATES.orderCancelled,
      { name, orderId },
      key
    )
    if (result?.ok) await markSent(order, key)
    return { ...result, status: next, template: WA_TEMPLATES.orderCancelled }
  }

  return { skipped: true, reason: 'no_template', status: next }
}

export async function notifyWhatsAppTrackingUpdate(order, tracking = {}, customer = {}) {
  const to = orderPhone(order, customer)
  if (!to) return { skipped: true }

  const status = String(tracking.status || order?.delhiveryStatus || '').toLowerCase()
  const name = firstName(customer.name || order?.shippingName || order?.user?.name)
  const orderId = orderLabel(order)
  const amount = money(order?.total)

  if (/out for delivery|ofd|out_for_delivery/.test(status)) {
    const key = `ofd:${orderId}`
    if (alreadySent(order, key)) return { skipped: true }
    const result = await sendSafe(
      to,
      WA_TEMPLATES.outForDelivery,
      { name, orderId, amount },
      key
    )
    if (result?.ok) await markSent(order, key)
    return result
  }

  if (/undel|failed|not.?deliver|rto|exception/.test(status)) {
    const key = `fail:${orderId}:${status.slice(0, 24)}`
    if (alreadySent(order, key)) return { skipped: true }
    const result = await sendSafe(
      to,
      WA_TEMPLATES.deliveryAttemptFailed,
      {
        name,
        orderId,
        reason: String(tracking.status || 'Delivery attempt failed').slice(0, 120),
        contact: CONTACT_EMAIL,
      },
      key
    )
    if (result?.ok) await markSent(order, key)
    return result
  }

  if (/deliver/.test(status) && !/undel|not.?deliver/.test(status)) {
    return notifyWhatsAppOrderStatus(order, 'DELIVERED', customer)
  }

  return { skipped: true, reason: 'no_match' }
}
