import { NextResponse } from 'next/server'
import { z } from 'zod'
import { dbConnect, requireAdmin } from '@/lib/mongo/auth'
import { StoreSettings, STORE_SETTINGS_DEFAULTS } from '@/lib/mongo/StoreSettings'
import { Product } from '@/lib/mongo/Product'
import {
  normalizeInstagramShopLooks,
  instagramShortcode,
} from '@/lib/instagramShop'

const lookSchema = z.object({
  id: z.string().max(80).optional(),
  permalink: z.string().min(8).max(400),
  productSlug: z.string().max(120).optional().default(''),
  badge: z.string().max(40).optional().default('NEW'),
  videoUrl: z.string().max(500).optional().default(''),
  poster: z.string().max(500).optional().default(''),
  active: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).max(999).optional(),
})

export async function GET(request) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error

  await dbConnect()
  let doc = await StoreSettings.findOne({ key: 'default' })
  if (!doc) {
    doc = await StoreSettings.create({ key: 'default', ...STORE_SETTINGS_DEFAULTS })
  }

  const settings = doc.toJSONSafe()
  const products = await Product.find({ active: { $ne: false } })
    .sort({ name: 1 })
    .select('name slug image price')
    .lean()

  return NextResponse.json({
    enabled: settings.instagramShopEnabled,
    looks: settings.instagramShopLooks,
    products: products.map((p) => ({
      slug: p.slug,
      name: p.name,
      image: p.image,
      price: p.price,
    })),
  })
}

export async function PUT(request) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error

  try {
    await dbConnect()
    const schema = z.object({
      enabled: z.boolean().optional(),
      looks: z.array(lookSchema).max(24),
    })
    const data = schema.parse(await request.json())

    const looks = normalizeInstagramShopLooks(
      data.looks.map((look, index) => ({
        ...look,
        id: look.id || instagramShortcode(look.permalink) || `look-${index}`,
        sortOrder: look.sortOrder ?? index,
      }))
    )

    const $set = { instagramShopLooks: looks }
    if (data.enabled !== undefined) $set.instagramShopEnabled = data.enabled

    const doc = await StoreSettings.findOneAndUpdate(
      { key: 'default' },
      {
        $set,
        $setOnInsert: { key: 'default' },
      },
      { new: true, upsert: true }
    )

    const settings = doc.toJSONSafe()
    return NextResponse.json({
      enabled: settings.instagramShopEnabled,
      looks: settings.instagramShopLooks,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors?.[0]?.message || err.issues?.[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    console.error(err)
    return NextResponse.json({ error: 'Could not save Instagram shop' }, { status: 500 })
  }
}
