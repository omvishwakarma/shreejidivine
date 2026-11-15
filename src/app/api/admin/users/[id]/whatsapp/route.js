import { NextResponse } from 'next/server'
import { dbConnect, requireAdmin } from '@/lib/mongo/auth'
import { User } from '@/lib/mongo/User'

/** Mark customer WhatsApp outreach as sent (admin clicked WhatsApp). */
export async function POST(request, { params }) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error

  try {
    await dbConnect()
    const { id } = await params
    const user = await User.findById(id)
    if (!user || user.role === 'admin') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    user.whatsappOutreachAt = new Date()
    await user.save()

    return NextResponse.json({
      ok: true,
      user: user.toSafeJSON(),
    })
  } catch (err) {
    console.error('[admin users whatsapp]', err)
    return NextResponse.json(
      { error: err.message || 'Could not mark WhatsApp sent' },
      { status: 500 }
    )
  }
}
