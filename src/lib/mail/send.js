import nodemailer from 'nodemailer'
import { CONTACT_EMAIL, SITE_NAME } from '../site'

let transporter

function isMailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  )
}

function getTransporter() {
  if (transporter) return transporter
  if (!isMailConfigured()) return null

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
  return transporter
}

export function getMailFrom() {
  return (
    process.env.EMAIL_FROM ||
    `"${SITE_NAME}" <${process.env.SMTP_USER || CONTACT_EMAIL}>`
  )
}

/**
 * Fire-and-forget safe send. Never throws to callers — logs failures instead.
 */
export async function sendMail({ to, subject, html, text }) {
  const tx = getTransporter()
  if (!tx) {
    console.warn(
      '[mail] SMTP not configured — skipped email:',
      subject,
      '→',
      to
    )
    return { skipped: true }
  }

  try {
    const info = await tx.sendMail({
      from: getMailFrom(),
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
      replyTo: CONTACT_EMAIL,
    })
    return { ok: true, messageId: info.messageId }
  } catch (err) {
    console.error('[mail] send failed:', err.message || err)
    return { ok: false, error: err.message }
  }
}
