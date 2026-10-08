import { Resend } from 'resend'
import nodemailer from 'nodemailer'
import { MAIL_FROM_EMAIL, SITE_NAME } from '../site'

let transporter
let resend

function resendKey() {
  const key = String(process.env.RESEND_API_KEY || '').trim()
  if (!key || key === 're_xxxxxxxxx') return ''
  return key
}

function getResend() {
  const key = resendKey()
  if (!key) return null
  if (!resend) resend = new Resend(key)
  return resend
}

export function isMailConfigured() {
  if (resendKey()) return true
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
  return `${SITE_NAME} <${MAIL_FROM_EMAIL}>`
}

/**
 * Fire-and-forget safe send. Never throws to callers — logs failures instead.
 */
export async function sendMail({ to, subject, html, text }) {
  const client = getResend()
  if (client) {
    try {
      const { data, error } = await client.emails.send({
        from: getMailFrom(),
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
        replyTo: MAIL_FROM_EMAIL,
      })
      if (error) {
        console.error('[mail] Resend send failed:', error.message || error)
        return { ok: false, error: error.message || 'Resend send failed' }
      }
      return { ok: true, messageId: data?.id }
    } catch (err) {
      console.error('[mail] Resend send failed:', err.message || err)
      return { ok: false, error: err.message }
    }
  }

  const tx = getTransporter()
  if (!tx) {
    console.warn(
      '[mail] Email not configured — skipped email:',
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
      replyTo: MAIL_FROM_EMAIL,
    })
    return { ok: true, messageId: info.messageId }
  } catch (err) {
    console.error('[mail] send failed:', err.message || err)
    return { ok: false, error: err.message }
  }
}
