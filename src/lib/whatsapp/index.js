export { normalizeWhatsappNumber, whatsappHref } from './phone'
export { sendWhatsAppTemplate, isWhatsAppConfigured, whatsappConfigDebug } from './client'
export { WA_TEMPLATES, buildTemplateComponents } from './templates'
export {
  notifyWhatsAppWelcome,
  notifyWhatsAppFreeGift,
  notifyWhatsAppOrderPlaced,
  notifyWhatsAppOrderStatus,
  notifyWhatsAppShipped,
  notifyWhatsAppTrackingUpdate,
} from './notify'
export { createAndSendWhatsAppOtp, verifyWhatsAppOtp } from './otp'
export { scheduleWhatsApp } from './schedule'
