import webpush from 'web-push'

export function vapidPublicKey() {
  return process.env.VAPID_PUBLIC_KEY || ''
}

export function pushReady() {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY)
}

export function configureWebPush() {
  if (!pushReady()) return false
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:hello@shreejidivine.co',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
  return true
}

export async function sendWebPush(subscription, payload) {
  return webpush.sendNotification(subscription, JSON.stringify(payload))
}
