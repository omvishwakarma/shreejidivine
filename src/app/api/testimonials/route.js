import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/mongo/db'
import { StoreSettings, STORE_SETTINGS_DEFAULTS } from '@/lib/mongo/StoreSettings'
import { DEFAULT_TESTIMONIALS, normalizeTestimonials } from '@/lib/testimonials'

export const revalidate = 60

export async function GET() {
  try {
    await dbConnect()
    let doc = await StoreSettings.findOne({ key: 'default' })
    if (!doc) {
      doc = await StoreSettings.create({ key: 'default', ...STORE_SETTINGS_DEFAULTS })
    }

    const raw = Array.isArray(doc.testimonials) ? doc.testimonials : []
    if (!raw.length) {
      doc.testimonials = normalizeTestimonials(DEFAULT_TESTIMONIALS)
      doc.testimonialsEnabled = doc.testimonialsEnabled !== false
      await doc.save()
    }

    const settings = doc.toJSONSafe()
    if (settings.testimonialsEnabled === false) {
      return NextResponse.json(
        { enabled: false, reviews: [] },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          },
        }
      )
    }

    const reviews = (settings.testimonials || [])
      .filter((r) => r.active !== false)
      .map((r) => ({
        id: r.id,
        title: r.title,
        quote: r.quote,
        name: r.name,
        handle: r.handle,
        photo: r.photo,
        instagram: r.instagram,
      }))

    return NextResponse.json(
      { enabled: true, reviews },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    )
  } catch {
    return NextResponse.json({
      enabled: true,
      reviews: DEFAULT_TESTIMONIALS.filter((r) => r.active !== false),
    })
  }
}
