import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/mongo/db'
import { Product } from '@/lib/mongo/Product'
import { FALLBACK_PRODUCTS } from '@/lib/products'
import { getStoreSettings } from '@/lib/shipping'
import {
  DEFAULT_INSTAGRAM_SHOP_LOOKS,
  instagramEmbedUrl,
  instagramShortcode,
} from '@/lib/instagramShop'
import { fetchInstagramPosts, isInstagramConfigured } from '@/lib/instagram'

export const revalidate = 60

function unescapeIgUrl(raw) {
  return String(raw || '')
    .replace(/\\u0026/gi, '&')
    .replace(/\\+\//g, '/')
    .replace(/\\\//g, '/')
}

/** Pull thumbnail + video mp4 from Instagram embed HTML (same source IG uses). */
async function fetchEmbedMedia(permalink) {
  const code = instagramShortcode(permalink)
  if (!code) return { thumbnail: '', videoUrl: '' }

  // Mobile UA returns classic embed HTML that includes video_url; desktop often does not.
  const urls = [
    `https://www.instagram.com/reel/${code}/embed/`,
    `https://www.instagram.com/p/${code}/embed/`,
    `https://www.instagram.com/p/${code}/embed/captioned/`,
  ]

  const headers = {
    'User-Agent':
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    Accept: 'text/html,application/xhtml+xml',
    'Accept-Language': 'en-US,en;q=0.9',
  }

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers,
        next: { revalidate: 3600 },
      })
      if (!res.ok) continue
      const html = await res.text()

      let videoUrl = ''
      const videoIdx = html.indexOf('video_url')
      if (videoIdx !== -1) {
        const slice = html.slice(videoIdx, videoIdx + 2500)
        const httpsIdx = slice.indexOf('https:')
        if (httpsIdx !== -1) {
          let raw = ''
          for (let i = httpsIdx; i < slice.length; i++) {
            const c = slice[i]
            if (c === '\\' && i + 1 < slice.length) {
              const n = slice[i + 1]
              if (n === '/') {
                raw += '/'
                i++
                continue
              }
              if (n === 'u' && slice.slice(i + 2, i + 6) === '0026') {
                raw += '&'
                i += 5
                continue
              }
              if (n === '"') break
              raw += n
              i++
              continue
            }
            if (c === '"') break
            raw += c
          }
          videoUrl = unescapeIgUrl(raw)
          if (!videoUrl.includes('.mp4')) videoUrl = ''
        }
      }

      let thumbnail = ''
      const thumbPatterns = [
        /display_url\\":\\"(https:[^"\\]+)\\"/i,
        /class="EmbeddedMediaImage"[^>]*src="([^"]+)"/i,
        /property="og:image"\s+content="([^"]+)"/i,
        /content="([^"]+)"\s+property="og:image"/i,
        /"(https:\/\/scontent[^"]+\.(?:jpg|jpeg|webp)[^"]*)"/i,
      ]
      for (const re of thumbPatterns) {
        const m = html.match(re)
        if (m?.[1]) {
          thumbnail = unescapeIgUrl(m[1].replace(/&amp;/g, '&'))
          break
        }
      }

      if (videoUrl || thumbnail) return { thumbnail, videoUrl }
    } catch {
      /* try next */
    }
  }
  return { thumbnail: '', videoUrl: '' }
}

function productSafe(p) {
  if (!p) return null
  return {
    id: p.id || p._id?.toString?.() || p.slug,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline || '',
    price: p.price,
    compareAt: p.compareAt || null,
    image: p.image,
  }
}

function matchGraphMedia(posts, permalink) {
  const code = instagramShortcode(permalink)
  if (!code || !posts?.length) return null
  return (
    posts.find((p) => instagramShortcode(p.permalink) === code) ||
    posts.find((p) => (p.permalink || '').includes(code)) ||
    null
  )
}

export async function GET() {
  let catalog = []
  let shopLooks = DEFAULT_INSTAGRAM_SHOP_LOOKS
  let enabled = true

  try {
    await dbConnect()
    const settings = await getStoreSettings()
    enabled = settings.instagramShopEnabled !== false
    shopLooks = Array.isArray(settings.instagramShopLooks)
      ? settings.instagramShopLooks.filter((l) => l.active !== false)
      : DEFAULT_INSTAGRAM_SHOP_LOOKS

    const docs = await Product.find({ active: { $ne: false } })
      .sort({ createdAt: -1 })
      .lean()
    catalog = docs.map((d) => ({
      id: d._id.toString(),
      slug: d.slug,
      name: d.name,
      tagline: d.tagline || '',
      price: d.price,
      compareAt: d.compareAt || null,
      image: d.image,
    }))
  } catch {
    catalog = FALLBACK_PRODUCTS
  }

  if (!catalog.length) catalog = FALLBACK_PRODUCTS

  if (!enabled) {
    return NextResponse.json(
      { enabled: false, looks: [] },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    )
  }

  let graphPosts = []
  if (isInstagramConfigured()) {
    try {
      const result = await fetchInstagramPosts(24)
      graphPosts = result.posts || []
    } catch {
      graphPosts = []
    }
  }

  const looks = await Promise.all(
    shopLooks.map(async (look, index) => {
      const bySlug = catalog.find((p) => p.slug === look.productSlug)
      const product = productSafe(bySlug || catalog[index % catalog.length])

      const graph = matchGraphMedia(graphPosts, look.permalink)
      const needEmbed = !look.videoUrl || !look.poster
      const embed = needEmbed
        ? await fetchEmbedMedia(look.permalink)
        : { thumbnail: '', videoUrl: '' }

      const videoUrl =
        look.videoUrl ||
        (graph?.type === 'VIDEO' ? graph.mediaUrl : '') ||
        embed.videoUrl ||
        ''

      const thumbnail =
        look.poster ||
        graph?.thumbnailUrl ||
        embed.thumbnail ||
        product?.image ||
        ''

      return {
        id: look.id,
        permalink: look.permalink,
        embedUrl: instagramEmbedUrl(look.permalink),
        badge: look.badge || 'NEW',
        thumbnail,
        videoUrl,
        product,
      }
    })
  )

  return NextResponse.json(
    { enabled: true, looks },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    }
  )
}
