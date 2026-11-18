/** Approved Shreeji Divine WhatsApp templates (from WATemplates CSV). */
export const WA_TEMPLATES = {
  welcome: 'sd_welcome_message',
  welcomeOffer: 'sd_welcome_offer',
  /** Free-gift popup; override if Meta template name differs. */
  freeGift: process.env.WHATSAPP_FREE_GIFT_TEMPLATE || 'sd_welcome_offer',
  thankYou: 'sd_customer_thankyou',
  orderConfirmation: 'sd_order_confirmation',
  codVerification: 'sd_cod_verification',
  codConfirmed: 'sd_cod_confirmed',
  orderCancelled: 'sd_order_cancelled',
  orderShipped: 'sd_order_shipped',
  outForDelivery: 'sd_out_for_delivery',
  orderDelivered: 'sd_order_delivered',
  deliveryAttemptFailed: 'sd_delivery_attempt_failed',
  /** Authentication template (created as sd_login_otp). Override with WHATSAPP_OTP_TEMPLATE. */
  otp: process.env.WHATSAPP_OTP_TEMPLATE || 'sd_login_otp',
  /** Abandoned cart recovery (Meta template sd_abandoned_cart_1). */
  abandonedCart:
    process.env.WHATSAPP_ABANDONED_CART_TEMPLATE || 'sd_abandoned_cart_1',
}

/** WhatsApp body params cannot contain newlines / tabs / 4+ spaces. */
function sanitizeWaText(value, max = 120) {
  const text = String(value ?? '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/ {4,}/g, '   ')
    .trim()
    .slice(0, max)
  return text || '-'
}

function textParams(values) {
  return (values || []).map((value) => ({
    type: 'text',
    text: sanitizeWaText(value),
  }))
}

export function buildTemplateComponents(templateName, params = {}) {
  const name = String(templateName || '')

  if (name === WA_TEMPLATES.otp || name === process.env.WHATSAPP_OTP_TEMPLATE) {
    const code = String(params.code || '').trim()
    return [
      {
        type: 'body',
        parameters: textParams([code]),
      },
      {
        type: 'button',
        sub_type: 'url',
        index: '0',
        parameters: textParams([code]),
      },
    ]
  }

  if (name === WA_TEMPLATES.welcome || name === WA_TEMPLATES.thankYou) {
    return [{ type: 'body', parameters: textParams([params.name]) }]
  }

  if (name === WA_TEMPLATES.welcomeOffer || name === WA_TEMPLATES.freeGift) {
    const components = [{ type: 'body', parameters: textParams([params.name]) }]
    const urlPath = String(params.urlPath || '').replace(/^\/+/, '').trim()
    if (urlPath) {
      components.push({
        type: 'button',
        sub_type: 'url',
        index: '0',
        parameters: textParams([urlPath]),
      })
    }
    return components
  }

  if (name === WA_TEMPLATES.orderConfirmation) {
    return [
      {
        type: 'body',
        parameters: textParams([
          params.name,
          params.orderId,
          params.amount,
          params.paymentMethod,
        ]),
      },
    ]
  }

  if (name === WA_TEMPLATES.codVerification) {
    return [
      {
        type: 'body',
        parameters: textParams([
          params.name,
          params.orderId,
          params.amount,
          params.address,
        ]),
      },
    ]
  }

  if (name === WA_TEMPLATES.codConfirmed) {
    return [
      {
        type: 'body',
        parameters: textParams([params.name, params.orderId, params.amount]),
      },
    ]
  }

  if (name === WA_TEMPLATES.orderCancelled) {
    return [
      {
        type: 'body',
        parameters: textParams([params.name, params.orderId]),
      },
    ]
  }

  if (name === WA_TEMPLATES.orderShipped) {
    return [
      {
        type: 'body',
        parameters: textParams([
          params.name,
          params.orderId,
          params.courier,
          params.trackingId,
          params.trackUrl,
        ]),
      },
    ]
  }

  if (name === WA_TEMPLATES.outForDelivery) {
    return [
      {
        type: 'body',
        parameters: textParams([params.name, params.orderId, params.amount]),
      },
    ]
  }

  if (name === WA_TEMPLATES.orderDelivered) {
    return [
      {
        type: 'body',
        parameters: textParams([params.name, params.orderId]),
      },
    ]
  }

  if (name === WA_TEMPLATES.deliveryAttemptFailed) {
    return [
      {
        type: 'body',
        parameters: textParams([
          params.name,
          params.orderId,
          params.reason,
          params.contact,
        ]),
      },
    ]
  }

  if (name === WA_TEMPLATES.abandonedCart) {
    // Meta template: IMAGE header (dynamic) + body {{1}} name, {{2}} product, {{3}} amount
    const imageLink = String(params.imageLink || params.image || '').trim()
    const components = []
    if (imageLink) {
      components.push({
        type: 'header',
        parameters: [
          {
            type: 'image',
            image: { link: imageLink },
          },
        ],
      })
    }
    components.push({
      type: 'body',
      parameters: textParams([params.name, params.product, params.amount]),
    })
    return components
  }

  if (Array.isArray(params.body)) {
    return [{ type: 'body', parameters: textParams(params.body) }]
  }

  return []
}
