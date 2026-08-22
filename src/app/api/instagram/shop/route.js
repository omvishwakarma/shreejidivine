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
import { fetchEmbedMedia } from '@/lib/instagramEmbed'

export const revalidate = 60

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
