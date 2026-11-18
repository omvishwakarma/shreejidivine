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
async function postTemplateOnce({ phone, name, language, components, callbackData }) {
  const body = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: phone,
    type: 'template',
    template: {
      name,
      language: { code: language },
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
    data?.error?.error_user_msg ||
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
    err.language = language
    throw err
  }

  return { ok: true, data, to: phone, template: name, language }
}

export async function sendWhatsAppTemplate({
  to,
  template,
  language,
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

  const preferred = language || env('WHATSAPP_TEMPLATE_LANGUAGE') || 'en_US'
  // Meta UI "English" is usually en_US; also try en / en_GB.
  const languages = [...new Set([preferred, 'en_US', 'en', 'en_GB'].filter(Boolean))]

  let lastError = null
  for (const code of languages) {
    try {
      const result = await postTemplateOnce({
        phone,
        name,
        language: code,
        components,
        callbackData,
      })
      console.info('[whatsapp] sent', {
        template: name,
        to: phone,
        language: code,
        id: result.data?.messages?.[0]?.id,
      })
      return result
    } catch (err) {
      lastError = err
      const msg = String(err?.message || '').toLowerCase()
      const retryLang =
        msg.includes('language') ||
        msg.includes('translation') ||
        msg.includes('template') ||
        msg.includes('not found') ||
        msg.includes('does not exist')
      console.error('[whatsapp] send failed', {
        template: name,
        to: phone,
        language: code,
        message: err?.message,
        data: err?.payload,
      })
      if (!retryLang) break
    }
  }

  throw lastError || new Error('WhatsApp send failed')
}
