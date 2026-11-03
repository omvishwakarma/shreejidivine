export { normalizeWhatsappNumber, whatsappHref } from './phone'
export { sendWhatsAppTemplate, isWhatsAppConfigured } from './client'
export { WA_TEMPLATES, buildTemplateComponents } from './templates'
export {
  notifyWhatsAppWelcome,
  notifyWhatsAppOrderPlaced,
  notifyWhatsAppOrderStatus,
  notifyWhatsAppShipped,
  notifyWhatsAppTrackingUpdate,
} from './notify'
export { createAndSendWhatsAppOtp, verifyWhatsAppOtp } from './otp'
