import webpush from 'web-push'

const DEFAULT_SUBJECT = 'mailto:hello@shreejidivine.co'

function cleanKey(value) {
  return String(value || '')
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/\s+/g, '')
    .replace(/=+$/g, '')
}

function cleanSubject(value) {
  const subject = String(value || '')
    .trim()
    .replace(/^['"]|['"]$/g, '')
  if (!subject) return DEFAULT_SUBJECT
  if (subject.startsWith('mailto:') || subject.startsWith('https://')) return subject
  if (subject.includes('@') && !subject.includes(' ')) return `mailto:${subject}`
  if (subject.startsWith('http://')) return `https://${subject.slice('http://'.length)}`
  return subject
}

export function vapidPublicKey() {
  return cleanKey(process.env.VAPID_PUBLIC_KEY)
}

export function configureWebPush() {
  const publicKey = vapidPublicKey()
  const privateKey = cleanKey(process.env.VAPID_PRIVATE_KEY)
  const subject = cleanSubject(process.env.VAPID_SUBJECT)
  if (!publicKey || !privateKey) {
    return {
      ok: false,
      error: 'Push keys are missing. Add VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY on the server, then redeploy.',
    }
  }
  try {
    webpush.setVapidDetails(subject, publicKey, privateKey)
    return { ok: true }
  } catch (err) {
    console.error('VAPID setup failed', err?.message || err)
    return {
      ok: false,
      error:
        'Push keys on the server are invalid. Check VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, and VAPID_SUBJECT, then redeploy.',
    }
  }
}

export function pushReady() {
  return configureWebPush().ok
}

export async function sendWebPush(subscription, payload) {
  return webpush.sendNotification(subscription, JSON.stringify(payload), {
    TTL: 60 * 60,
    timeout: 8000,
  })
}
