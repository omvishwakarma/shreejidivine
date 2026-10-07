import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/mongo/db'
import { StoreSettings, STORE_SETTINGS_DEFAULTS } from '@/lib/mongo/StoreSettings'
import { DEFAULT_TESTIMONIALS, normalizeTestimonials } from '@/lib/testimonials'
import { fetchEmbedMedia } from '@/lib/instagramEmbed'
import { instagramShortcode } from '@/lib/instagramShop'

function directVideo(url) {
  return /^(https?:\/\/|\/)/.test(url) && /\.(mp4|webm|mov)(\?|$)/i.test(url)
}

async function withPlayback(reviews) {
  return Promise.all(
    reviews.map(async (review) => {
      const video = String(review.video || '').trim()
      if (!video) return { ...review, playback: '', poster: '', embed: '' }
      if (directVideo(video) || video.startsWith('/')) {
        return { ...review, playback: video, poster: '', embed: '' }
      }
      const code = instagramShortcode(video)
      if (!code) return { ...review, playback: '', poster: '', embed: '' }
      const media = await fetchEmbedMedia(video).catch(() => ({ thumbnail: '', videoUrl: '' }))
      return {
        ...review,
        playback: media.videoUrl || '',
        poster: media.thumbnail || '',
        embed: media.videoUrl ? '' : `https://www.instagram.com/reel/${code}/embed/`,
      }
    })
  )
}

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

    const reviews = await withPlayback(
      (settings.testimonials || [])
        .filter((r) => r.active !== false)
        .map((r) => ({
          id: r.id,
          name: r.name,
          handle: r.handle,
          photo: r.photo,
          video: r.video || '',
          instagram: r.instagram,
        }))
    )

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
