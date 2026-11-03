/** WhatsApp OTP login/signup UI — keep off until Meta approves sd_login_otp. */
export function isWhatsAppAuthEnabled() {
  const value = String(process.env.NEXT_PUBLIC_WHATSAPP_AUTH_ENABLED || '')
    .trim()
    .toLowerCase()
  return value === '1' || value === 'true' || value === 'yes' || value === 'on'
}
