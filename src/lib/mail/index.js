import { sendMail } from './send'
import { buildOrderEmail, buildPasswordResetEmail, buildWelcomeEmail } from './templates'

export async function sendWelcomeEmail(user) {
  if (!user?.email) return { skipped: true }
  const { subject, html } = buildWelcomeEmail({
    name: user.name,
    email: user.email,
  })
  return sendMail({ to: user.email, subject, html })
}

export async function sendPasswordResetEmail(user, resetUrl) {
  if (!user?.email) return { skipped: true }
  const { subject, html } = buildPasswordResetEmail({
    name: user.name,
    resetUrl,
  })
  return sendMail({ to: user.email, subject, html })
}

export async function sendOrderEmail(order, customer = {}) {
  const to = customer.email || order?.user?.email
  if (!to) return { skipped: true }

  const payload =
    typeof order.toJSONSafe === 'function' ? order.toJSONSafe() : order

  const { subject, html } = buildOrderEmail({
    order: payload,
    customer: { name: customer.name || payload.shippingName, email: to },
  })
  return sendMail({ to, subject, html })
}
