/**
 * Instagram Graph API helpers + curated feed fallback.
 *
 * Required env (optional if curated feed is enough):
 *   INSTAGRAM_ACCESS_TOKEN — long-lived token
 * Optional:
 *   INSTAGRAM_BUSINESS_ACCOUNT_ID — IG business user id (Facebook Graph).
 *   If omitted, uses graph.instagram.com/me/media (Instagram Login tokens).
 */

import { CURATED_INSTAGRAM_FEED } from '@/lib/instagramFeed'
import { fetchEmbedMedia } from '@/lib/instagramEmbed'
import { instagramShortcode } from '@/lib/instagramShop'

const FIELDS =
  'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp'

function mapPost(item) {
  const type = item.media_type || 'IMAGE'
  const mediaUrl = item.media_url || item.thumbnail_url || ''
  const thumbnailUrl =
    item.thumbnail_url || (type === 'VIDEO' ? '' : item.media_url) || ''

  return {
    id: item.id,
    type,
    mediaUrl,
    thumbnailUrl: thumbnailUrl || mediaUrl,
    permalink: item.permalink || '',
    caption: item.caption || '',
    timestamp: item.timestamp || '',
  }
}

export function isInstagramConfigured() {
  return Boolean(process.env.INSTAGRAM_ACCESS_TOKEN)
}

export async function fetchCuratedInstagramPosts(limit = 6) {
  const capped = Math.min(Math.max(Number(limit) || 6, 1), 12)
  const items = CURATED_INSTAGRAM_FEED.slice(0, capped)

  const posts = await Promise.all(
    items.map(async (item) => {
      const code = item.id || instagramShortcode(item.permalink)
      const embed = await fetchEmbedMedia(item.permalink)
      const mediaUrl = embed.videoUrl || embed.thumbnail || ''
      const thumbnailUrl = embed.thumbnail || embed.videoUrl || ''
      return {
        id: code,
        type: embed.videoUrl ? 'VIDEO' : 'IMAGE',
        mediaUrl,
        thumbnailUrl,
        permalink: item.permalink,
        caption: '',
        timestamp: '',
      }
    })
  )

  return posts.filter((p) => p.mediaUrl || p.thumbnailUrl)
}

export async function fetchInstagramPosts(limit = 6) {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN
  const capped = Math.min(Math.max(Number(limit) || 6, 1), 12)

  if (!token) {
    const posts = await fetchCuratedInstagramPosts(capped)
    return { configured: true, posts, error: null, source: 'curated' }
  }

  const userId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID

  const url = userId
    ? `https://graph.facebook.com/v21.0/${userId}/media?fields=${FIELDS}&limit=${capped}&access_token=${encodeURIComponent(token)}`
    : `https://graph.instagram.com/v21.0/me/media?fields=${FIELDS}&limit=${capped}&access_token=${encodeURIComponent(token)}`

  try {
    const res = await fetch(url, {
      next: { revalidate: 1800 },
      headers: { Accept: 'application/json' },
    })
    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      const message =
        data?.error?.message || `Instagram API error (${res.status})`
      console.error('[instagram]', message)
      const posts = await fetchCuratedInstagramPosts(capped)
      return {
        configured: true,
        posts,
        error: posts.length ? null : message,
        source: posts.length ? 'curated' : 'graph',
      }
    }

    const posts = (data.data || [])
      .map(mapPost)
      .filter((p) => p.mediaUrl || p.thumbnailUrl)
      .slice(0, capped)

    if (!posts.length) {
      const curated = await fetchCuratedInstagramPosts(capped)
      return { configured: true, posts: curated, error: null, source: 'curated' }
    }

    return { configured: true, posts, error: null, source: 'graph' }
  } catch (err) {
    console.error('[instagram]', err)
    const posts = await fetchCuratedInstagramPosts(capped)
    return {
      configured: true,
      posts,
      error: posts.length ? null : err.message || 'Failed to load Instagram',
      source: posts.length ? 'curated' : 'graph',
    }
  }
}
