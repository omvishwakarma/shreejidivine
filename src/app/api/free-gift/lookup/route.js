import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/mongo/auth'
import { User } from '@/lib/mongo/User'
import { normalizeWhatsappNumber } from '@/lib/whatsapp'

export async function GET(request) {
  try {
    const phoneRaw = String(new URL(request.url).searchParams.get('phone') || '').trim()
    const phone = normalizeWhatsappNumber(phoneRaw)
    if (!phone) {
      return NextResponse.json({ found: false, name: '' })
    }

    await dbConnect()
    const local = phone.length > 10 ? phone.slice(-10) : phone
    const user = await User.findOne({
      $or: [{ phoneKey: phone }, { phone: local }, { phone }],
    })
      .select('name phone')
      .lean()

    if (!user) {
      return NextResponse.json({ found: false, name: '' })
    }

    return NextResponse.json({
      found: true,
      name: String(user.name || '').trim(),
    })
  } catch (err) {
    console.error('[free-gift/lookup]', err)
    return NextResponse.json({ found: false, name: '' })
  }
}
