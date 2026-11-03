import { normalizeWhatsappNumber } from './phone'

function env(name) {
  return String(process.env[name] || '').trim().replace(/^["']|["']$/g, '')
}

export function isWhatsAppConfigured() {
  return Boolean(env('WHATSAPP_ACCESS_TOKEN') && env('WHATSAPP_PHONE_NUMBER_ID'))
}

export function whatsappConfigDebug() {
  return {
    configured: isWhatsAppConfigured(),
    hasToken: Boolean(env('WHATSAPP_ACCESS_TOKEN')),
    hasPhoneId: Boolean(env('WHATSAPP_PHONE_NUMBER_ID')),
    apiBase: env('WHATSAPP_API_BASE') || 'https://omni.yourbulksms.com/V23.0',
    language: env('WHATSAPP_TEMPLATE_LANGUAGE') || 'en',
  }
}

function messagesUrl() {
  const base = (env('WHATSAPP_API_BASE') || 'https://omni.yourbulksms.com/V23.0').replace(/\/$/, '')
  const phoneId = env('WHATSAPP_PHONE_NUMBER_ID')
  return `${base}/${phoneId}/messages`
}

/**
 * Send a WhatsApp Cloud API template message via YourBulkSMS Omni.
 */
export async function sendWhatsAppTemplate({
  to,
  template,
  language = 'en',
  components = [],
  callbackData = '',
}) {
  if (!isWhatsAppConfigured()) {
    return { skipped: true, reason: 'not_configured' }
  }

  const phone = normalizeWhatsappNumber(to)
  if (!phone) {
    return { skipped: true, reason: 'invalid_phone' }
  }

  const name = String(template || '').trim()
  if (!name) {
    return { skipped: true, reason: 'missing_template' }
  }

  const body = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: phone,
    type: 'template',
    template: {
      name,
      language: { code: language || env('WHATSAPP_TEMPLATE_LANGUAGE') || 'en' },
      ...(components.length ? { components } : {}),
    },
  }
  if (callbackData) body.biz_opaque_callback_data = String(callbackData).slice(0, 512)

  const url = messagesUrl()
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env('WHATSAPP_ACCESS_TOKEN')}`,
    },
    body: JSON.stringify(body),
  })

  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { raw: text }
  }

  const omniInvalid = data?.isValid === false
  const omniMessage =
    data?.response?.[0]?.message ||
    data?.response?.[0]?.status ||
    data?.error?.message ||
    data?.message ||
    ''

  if (!res.ok || omniInvalid) {
    const message =
      omniMessage ||
      (typeof data?.raw === 'string' ? data.raw.slice(0, 200) : '') ||
      `WhatsApp send failed (${res.status})`
    const err = new Error(message)
    err.status = res.status || 400
    err.payload = data
    console.error('[whatsapp] send failed', { url, template: name, to: phone, message, data })
    throw err
  }

  console.info('[whatsapp] sent', { template: name, to: phone, id: data?.messages?.[0]?.id })
  return { ok: true, data, to: phone, template: name }
}
