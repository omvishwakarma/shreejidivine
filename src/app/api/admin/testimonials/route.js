import { NextResponse } from 'next/server'
import { z } from 'zod'
import { dbConnect, requireAdmin } from '@/lib/mongo/auth'
import { StoreSettings, STORE_SETTINGS_DEFAULTS } from '@/lib/mongo/StoreSettings'
import {
  DEFAULT_TESTIMONIALS,
  normalizeTestimonials,
  instagramHandleFromUrl,
} from '@/lib/testimonials'

const reviewSchema = z.object({
  id: z.string().max(80).optional(),
  title: z.string().max(120).optional().default(''),
  quote: z.string().min(8).max(1200),
  name: z.string().min(2).max(120),
  handle: z.string().max(80).optional().default(''),
  photo: z.string().max(500).optional().default(''),
  instagram: z.string().max(400).optional().default(''),
  active: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).max(999).optional(),
})

async function getOrCreateSettings() {
  let doc = await StoreSettings.findOne({ key: 'default' })
  if (!doc) {
    doc = await StoreSettings.create({ key: 'default', ...STORE_SETTINGS_DEFAULTS })
  }
  return doc
}

/** Persist homepage defaults into DB once so admin can edit them. */
async function ensureTestimonialsSeeded(doc) {
  const raw = Array.isArray(doc.testimonials) ? doc.testimonials : []
  if (raw.length > 0) return doc

  doc.testimonials = normalizeTestimonials(DEFAULT_TESTIMONIALS)
  if (doc.testimonialsEnabled === undefined || doc.testimonialsEnabled === null) {
    doc.testimonialsEnabled = true
  }
  await doc.save()
  return doc
}

export async function GET(request) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error

  await dbConnect()
  let doc = await getOrCreateSettings()
  doc = await ensureTestimonialsSeeded(doc)

  const settings = doc.toJSONSafe()
  return NextResponse.json({
    enabled: settings.testimonialsEnabled,
    reviews: settings.testimonials,
  })
}

export async function PUT(request) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error

  try {
    await dbConnect()
    const schema = z.object({
      enabled: z.boolean().optional(),
      reviews: z.array(reviewSchema).max(40),
    })
    const data = schema.parse(await request.json())

    const reviews = normalizeTestimonials(
      data.reviews.map((review, index) => {
        const instagram = String(review.instagram || '').trim()
        const handle =
          String(review.handle || '').trim() ||
          instagramHandleFromUrl(instagram) ||
          ''
        return {
          ...review,
          id: review.id || handle.replace(/^@/, '') || `review-${index}`,
          handle,
          instagram,
          sortOrder: review.sortOrder ?? index,
        }
      })
    )

    const $set = { testimonials: reviews }
    if (data.enabled !== undefined) $set.testimonialsEnabled = data.enabled

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
      enabled: settings.testimonialsEnabled,
      reviews: settings.testimonials,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors?.[0]?.message || err.issues?.[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    console.error(err)
    return NextResponse.json({ error: 'Could not save testimonials' }, { status: 500 })
  }
}
