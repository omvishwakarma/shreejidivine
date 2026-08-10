/**
 * Instagram Graph API helpers.
 *
 * Required env:
 *   INSTAGRAM_ACCESS_TOKEN — long-lived token
 * Optional:
 *   INSTAGRAM_BUSINESS_ACCOUNT_ID — IG business user id (Facebook Graph).
 *   If omitted, uses graph.instagram.com/me/media (Instagram Login tokens).
 */

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

export async function fetchInstagramPosts(limit = 6) {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN
  if (!token) {
    return { configured: false, posts: [], error: null }
  }

  const userId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID
  const capped = Math.min(Math.max(Number(limit) || 6, 1), 12)

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
      return { configured: true, posts: [], error: message }
    }

    const posts = (data.data || [])
      .map(mapPost)
      .filter((p) => p.mediaUrl || p.thumbnailUrl)
      .slice(0, capped)

    return { configured: true, posts, error: null }
  } catch (err) {
    console.error('[instagram]', err)
    return {
      configured: true,
      posts: [],
      error: err.message || 'Failed to load Instagram',
    }
  }
}
