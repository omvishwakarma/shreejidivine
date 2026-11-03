import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  createAndSendWhatsAppOtp,
  isWhatsAppConfigured,
  normalizeWhatsappNumber,
} from '@/lib/whatsapp'
import { dbConnect } from '@/lib/mongo/auth'
import { User } from '@/lib/mongo/User'

async function findUserByPhone(phone) {
  const local = phone.length > 10 ? phone.slice(-10) : phone
  return User.findOne({
    $or: [{ phoneKey: phone }, { phone: local }, { phone }],
  })
}

export async function POST(request) {
  try {
    if (!isWhatsAppConfigured()) {
      return NextResponse.json(
        { error: 'WhatsApp login is not configured yet.' },
        { status: 503 }
      )
    }

    const schema = z.object({
      phone: z.string().min(10),
      purpose: z.enum(['login', 'signup']).default('login'),
      name: z.string().optional().or(z.literal('')),
    })
    const data = schema.parse(await request.json())
    const phone = normalizeWhatsappNumber(data.phone)
    if (!phone) {
      return NextResponse.json({ error: 'Enter a valid WhatsApp number' }, { status: 400 })
    }

    await dbConnect()
    const existing = await findUserByPhone(phone)

    if (data.purpose === 'login' && !existing) {
      return NextResponse.json(
        { error: 'No account found for this number. Create an account first.' },
        { status: 404 }
      )
    }

    if (data.purpose === 'signup') {
      const name = String(data.name || '').trim()
      if (name.length < 2) {
        return NextResponse.json({ error: 'Enter your full name' }, { status: 400 })
      }
      if (existing) {
        return NextResponse.json(
          { error: 'This WhatsApp number is already registered. Sign in instead.' },
          { status: 409 }
        )
      }
    }

    const result = await createAndSendWhatsAppOtp({
      phone,
      purpose: data.purpose,
      name: data.name || existing?.name || '',
    })

    return NextResponse.json({
      ok: true,
      phone: result.phone,
      expiresInSec: result.expiresInSec,
      message: 'OTP sent on WhatsApp',
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    console.error('[whatsapp send-otp]', err)
    return NextResponse.json(
      { error: err.message || 'Could not send OTP' },
      { status: err.status || 500 }
    )
  }
}
