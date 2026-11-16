import { NextResponse } from 'next/server'
import { z } from 'zod'
import { dbConnect, verifyAuth } from '@/lib/mongo/auth'
import { User } from '@/lib/mongo/User'
import {
  markAbandonedCartRecovered,
  upsertAbandonedCart,
} from '@/lib/abandonedCart'
import { normalizeWhatsappNumber } from '@/lib/whatsapp/phone'

export const dynamic = 'force-dynamic'

const itemSchema = z.object({
  productId: z.string().optional(),
  slug: z.string().optional(),
  name: z.string().optional(),
  price: z.number().optional(),
  quantity: z.number().optional(),
  colour: z.string().optional(),
  fragrance: z.string().optional(),
  image: z.string().optional(),
})

export async function POST(request) {
  try {
    await dbConnect()
    const body = await request.json().catch(() => ({}))
    const schema = z.object({
      phone: z.string().optional(),
      name: z.string().optional(),
      items: z.array(itemSchema).optional(),
      subtotal: z.number().optional(),
      clear: z.boolean().optional(),
    })
    const data = schema.parse(body)

    const auth = await verifyAuth(request)
    let user = null
    if (auth?.sub) {
      user = await User.findById(auth.sub).select('name phone').lean()
    }

    const phone =
      normalizeWhatsappNumber(data.phone) ||
      normalizeWhatsappNumber(user?.phone) ||
      ''

    if (!phone) {
      return NextResponse.json({ ok: false, reason: 'phone_required' }, { status: 400 })
    }

    if (data.clear || !data.items?.length) {
      await markAbandonedCartRecovered({
        phone,
        userId: auth?.sub || null,
      })
      return NextResponse.json({ ok: true, cleared: true })
    }

    const cart = await upsertAbandonedCart({
      phone,
      name: data.name || user?.name || '',
      userId: auth?.sub || null,
      items: data.items,
      subtotal: data.subtotal,
    })

    return NextResponse.json({
      ok: true,
      phone,
      itemCount: cart?.items?.length || 0,
      subtotal: cart?.subtotal || 0,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid cart payload' }, { status: 400 })
    }
    console.error('[cart/abandoned]', err)
    return NextResponse.json({ error: 'Could not save cart' }, { status: 500 })
  }
}
