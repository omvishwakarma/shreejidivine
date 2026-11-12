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
}

function textParams(values) {
  return (values || []).map((value) => ({
    type: 'text',
    text: String(value ?? '').trim() || '-',
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

  if (Array.isArray(params.body)) {
    return [{ type: 'body', parameters: textParams(params.body) }]
  }

  return []
}
