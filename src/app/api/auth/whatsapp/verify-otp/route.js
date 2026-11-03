import { NextResponse } from 'next/server'
import { z } from 'zod'
import { dbConnect, signToken } from '@/lib/mongo/auth'
import { User } from '@/lib/mongo/User'
import {
  normalizeWhatsappNumber,
  notifyWhatsAppWelcome,
  verifyWhatsAppOtp,
} from '@/lib/whatsapp'
import { isWhatsAppAuthEnabled } from '@/lib/whatsapp/authEnabled'

function syntheticEmail(phone) {
  return `wa_${phone}@users.shreejidivine.co`
}

export async function POST(request) {
  try {
    if (!isWhatsAppAuthEnabled()) {
      return NextResponse.json(
        { error: 'WhatsApp login is not available yet.' },
        { status: 503 }
      )
    }
    const schema = z.object({
      phone: z.string().min(10),
      code: z.string().min(4),
      purpose: z.enum(['login', 'signup']).default('login'),
      name: z.string().optional().or(z.literal('')),
    })
    const data = schema.parse(await request.json())
    const verified = await verifyWhatsAppOtp({ phone: data.phone, code: data.code })
    const phone = verified.phone || normalizeWhatsappNumber(data.phone)

    await dbConnect()
    const local = phone.length > 10 ? phone.slice(-10) : phone
    let user = await User.findOne({
      $or: [{ phoneKey: phone }, { phone: local }, { phone }],
    })
    let isNew = false

    if (!user) {
      if (data.purpose === 'login') {
        return NextResponse.json(
          { error: 'No account found for this number. Create an account first.' },
          { status: 404 }
        )
      }
      const name = String(data.name || verified.name || '').trim()
      if (name.length < 2) {
        return NextResponse.json({ error: 'Enter your full name' }, { status: 400 })
      }
      user = await User.create({
        name,
        email: syntheticEmail(phone),
        phone: local,
        phoneKey: phone,
        passwordHash: '',
        authProvider: 'whatsapp',
        role: 'user',
      })
      isNew = true
      void notifyWhatsAppWelcome(user.toSafeJSON())
    } else {
      let dirty = false
      if (user.phoneKey !== phone) {
        user.phoneKey = phone
        dirty = true
      }
      if (!user.phone) {
        user.phone = local
        dirty = true
      }
      if (dirty) await user.save()
    }

    const token = await signToken(user)
    return NextResponse.json({
      user: user.toSafeJSON(),
      token,
      isNew,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    console.error('[whatsapp verify-otp]', err)
    return NextResponse.json(
      { error: err.message || 'Could not verify OTP' },
      { status: err.status || 500 }
    )
  }
}
