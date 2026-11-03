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
