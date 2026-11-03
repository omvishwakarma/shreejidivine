import crypto from 'crypto'
import { dbConnect } from '../mongo/db'
import { WhatsAppOtp } from '../mongo/WhatsAppOtp'
import { sendWhatsAppTemplate } from './client'
import { buildTemplateComponents, WA_TEMPLATES } from './templates'
import { normalizeWhatsappNumber } from './phone'

const OTP_TTL_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 5

function hashCode(code) {
  return crypto.createHash('sha256').update(String(code)).digest('hex')
}

function generateCode() {
  return String(crypto.randomInt(100000, 999999))
}

export async function createAndSendWhatsAppOtp({ phone, purpose = 'login', name = '' }) {
  const normalized = normalizeWhatsappNumber(phone)
  if (!normalized) {
    const err = new Error('Enter a valid WhatsApp number')
    err.status = 400
    throw err
  }

  await dbConnect()
  const code = generateCode()
  const expiresAt = new Date(Date.now() + OTP_TTL_MS)

  await WhatsAppOtp.deleteMany({ phone: normalized })
  await WhatsAppOtp.create({
    phone: normalized,
    codeHash: hashCode(code),
    purpose,
    name: String(name || '').trim(),
    expiresAt,
  })

  const template = WA_TEMPLATES.otp
  await sendWhatsAppTemplate({
    to: normalized,
    template,
    components: buildTemplateComponents(template, { code }),
    callbackData: `otp:${purpose}:${normalized.slice(-4)}`,
  })

  return {
    ok: true,
    phone: normalized,
    expiresInSec: Math.round(OTP_TTL_MS / 1000),
  }
}

export async function verifyWhatsAppOtp({ phone, code }) {
  const normalized = normalizeWhatsappNumber(phone)
  if (!normalized) {
    const err = new Error('Enter a valid WhatsApp number')
    err.status = 400
    throw err
  }

  const otp = String(code || '').replace(/\D/g, '')
  if (otp.length < 4) {
    const err = new Error('Enter the OTP sent on WhatsApp')
    err.status = 400
    throw err
  }

  await dbConnect()
  const row = await WhatsAppOtp.findOne({ phone: normalized }).sort({ createdAt: -1 })
  if (!row || row.expiresAt.getTime() < Date.now()) {
    const err = new Error('OTP expired. Request a new code.')
    err.status = 400
    throw err
  }
  if (row.attempts >= MAX_ATTEMPTS) {
    await WhatsAppOtp.deleteMany({ phone: normalized })
    const err = new Error('Too many attempts. Request a new code.')
    err.status = 429
    throw err
  }

  if (row.codeHash !== hashCode(otp)) {
    row.attempts += 1
    await row.save()
    const err = new Error('Incorrect OTP')
    err.status = 400
    throw err
  }

  const meta = {
    phone: normalized,
    purpose: row.purpose,
    name: row.name || '',
  }
  await WhatsAppOtp.deleteMany({ phone: normalized })
  return meta
}
