import { WHATSAPP_MESSAGE, WHATSAPP_NUMBER } from '../site'

export function normalizeWhatsappNumber(value) {
  let digits = String(value || '').replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  // 08882301900 / 091XXXXXXXXXX
  while (digits.length > 10 && digits.startsWith('0')) digits = digits.slice(1)
  if (digits.length === 10) digits = `91${digits}`
  if (digits.length === 12 && digits.startsWith('91')) return digits
  if (digits.length < 11 || digits.length > 15) return ''
  return digits
}

export function whatsappHref(number) {
  const digits = normalizeWhatsappNumber(number || WHATSAPP_NUMBER)
  if (!digits) return ''
  return `https://wa.me/${digits}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`
}

/** Prefill chat to a customer number (opens phone WhatsApp / WhatsApp Business). */
export function customerWhatsAppHref({ phone, name } = {}) {
  const digits = normalizeWhatsappNumber(phone)
  if (!digits) return ''
  const first = String(name || '')
    .trim()
    .split(/\s+/)[0]
  const displayName = first || 'Ji'
  const text = `🙏 Namaste ${displayName}!

Welcome to *Shreeji Divine* 🕉️

Discover divine spiritual products for your home, पूजा & devotion.

🎁 Explore our special offers and exclusive gifts!

✨ Your spiritual journey starts here.

🛍️ Visit Now:
https://www.shreejidivine.co/`
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}
