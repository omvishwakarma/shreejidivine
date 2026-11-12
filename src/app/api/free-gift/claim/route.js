import { NextResponse } from 'next/server'
import { z } from 'zod'
import { dbConnect, signToken } from '@/lib/mongo/auth'
import { FreeGiftClaim } from '@/lib/mongo/FreeGiftClaim'
import { User } from '@/lib/mongo/User'
import { SITE_URL } from '@/lib/site'
import { normalizeWhatsappNumber, notifyWhatsAppFreeGift } from '@/lib/whatsapp'

const FREE_GIFT_SLUG = 'is-diwali-har-ghar-lakshmi-3-divine-products-free'
const FREE_GIFT_PATH = `/shop/${FREE_GIFT_SLUG}`
const DAY_MS = 24 * 60 * 60 * 1000

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(10).max(20),
})

function syntheticEmail(phone) {
  return `wa_${phone}@users.shreejidivine.co`
}

function giftAbsoluteUrl() {
  return `${SITE_URL.replace(/\/$/, '')}${FREE_GIFT_PATH}`
}

async function findOrCreateGiftUser({ name, phone }) {
  const local = phone.length > 10 ? phone.slice(-10) : phone
  let user = await User.findOne({
    $or: [{ phoneKey: phone }, { phone: local }, { phone }],
  })
  let isNew = false

  if (!user) {
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
  } else {
    let dirty = false
    if (name && user.name !== name) {
      user.name = name
      dirty = true
    }
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
  return { user: user.toSafeJSON(), token, isNew }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Please enter your name and a valid WhatsApp number.' },
        { status: 400 }
      )
    }

    const phone = normalizeWhatsappNumber(parsed.data.phone)
    if (!phone) {
      return NextResponse.json(
        { error: 'Enter a valid WhatsApp number (10-digit Indian mobile).' },
        { status: 400 }
      )
    }

    const name = parsed.data.name.trim()
    await dbConnect()

    const giftUrl = giftAbsoluteUrl()
    const auth = await findOrCreateGiftUser({ name, phone })

    const recent = await FreeGiftClaim.findOne({
      phone,
      createdAt: { $gte: new Date(Date.now() - DAY_MS) },
    })
      .select('_id')
      .lean()

    let whatsappStatus = 'skipped'
    let whatsappError = ''

    if (!recent) {
      const wa = await notifyWhatsAppFreeGift({ name, phone, giftUrl })
      whatsappStatus = wa?.ok ? 'sent' : wa?.skipped ? 'skipped' : 'failed'
      whatsappError = wa?.error || (wa?.skipped ? wa.reason || '' : '')

      await FreeGiftClaim.create({
        name,
        phone,
        giftUrl,
        giftSlug: FREE_GIFT_SLUG,
        whatsappStatus,
        whatsappError: String(whatsappError || '').slice(0, 300),
      })
    }

    return NextResponse.json({
      ok: true,
      user: auth.user,
      token: auth.token,
      isNew: auth.isNew,
      giftUrl,
      redirectTo: FREE_GIFT_PATH,
      whatsappStatus,
      message: 'Account ready — opening your free gift.',
    })
  } catch (err) {
    console.error('[free-gift/claim]', err)
    if (err?.code === 11000) {
      return NextResponse.json(
        { error: 'This number is already linked to an account. Try again.' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: err.message || 'Could not claim gift' },
      { status: 500 }
    )
  }
}
