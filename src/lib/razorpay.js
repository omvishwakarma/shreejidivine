import Razorpay from 'razorpay'
import crypto from 'crypto'

function env(name) {
  return (process.env[name] || '').trim()
}

export function getRazorpayClient() {
  const key_id = env('NEXT_PUBLIC_RAZORPAY_KEY_ID') || env('RAZORPAY_KEY_ID')
  const key_secret = env('RAZORPAY_KEY_SECRET')
  if (!key_id || !key_secret) {
    throw new Error('Razorpay keys are not configured')
  }
  return new Razorpay({ key_id, key_secret })
}

export function getRazorpayKeyId() {
  return env('NEXT_PUBLIC_RAZORPAY_KEY_ID') || env('RAZORPAY_KEY_ID')
}

export function verifyRazorpaySignature({ orderId, paymentId, signature }) {
  const secret = env('RAZORPAY_KEY_SECRET')
  if (!secret) return false
  const body = `${orderId}|${paymentId}`
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex')
  return expected === signature
}

/** Normalize Razorpay SDK / API errors for API responses. */
export function razorpayErrorMessage(err, fallback = 'Could not start Razorpay payment') {
  if (err?.statusCode === 401) {
    return 'Razorpay authentication failed. Regenerate test keys in the Razorpay dashboard, update .env, and restart the server.'
  }
  if (err?.error?.description) return err.error.description
  if (err?.message) return err.message
  return fallback
}
