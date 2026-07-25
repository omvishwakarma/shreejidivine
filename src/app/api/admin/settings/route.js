import { NextResponse } from 'next/server'
import { z } from 'zod'
import { dbConnect, requireAdmin } from '@/lib/mongo/auth'
import { StoreSettings, STORE_SETTINGS_DEFAULTS } from '@/lib/mongo/StoreSettings'
import { shippingNote } from '@/lib/shipping'

export async function GET(request) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error
  await dbConnect()
  let doc = await StoreSettings.findOne({ key: 'default' })
  if (!doc) {
    doc = await StoreSettings.create({ key: 'default', ...STORE_SETTINGS_DEFAULTS })
  }
  const settings = doc.toJSONSafe()
  return NextResponse.json({ settings, note: shippingNote(settings) })
}

export async function PATCH(request) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error

  try {
    await dbConnect()
    const schema = z.object({
      shippingFee: z.number().min(0),
      freeShippingMinOrder: z.number().min(0),
    })
    const data = schema.parse(await request.json())

    const doc = await StoreSettings.findOneAndUpdate(
      { key: 'default' },
      {
        $set: {
          shippingFee: data.shippingFee,
          freeShippingMinOrder: data.freeShippingMinOrder,
        },
        $setOnInsert: { key: 'default' },
      },
      { new: true, upsert: true }
    )

    const settings = doc.toJSONSafe()
    return NextResponse.json({ settings, note: shippingNote(settings) })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors?.[0]?.message || err.issues?.[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    console.error(err)
    return NextResponse.json({ error: 'Could not update settings' }, { status: 500 })
  }
}
