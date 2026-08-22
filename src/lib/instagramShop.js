/**
 * Instagram “Shop the look” — defaults + helpers.
 * Live looks are stored in StoreSettings (admin-managed).
 */

export const DEFAULT_INSTAGRAM_SHOP_LOOKS = [
  {
    id: 'DcAlPKBoXi4',
    permalink: 'https://www.instagram.com/p/DcAlPKBoXi4/',
    productSlug: 'mogra-royale',
    badge: 'NEW',
    videoUrl: '',
    poster: '',
    active: true,
    sortOrder: 0,
  },
  {
    id: 'Dbimnl4prMs',
    permalink: 'https://www.instagram.com/p/Dbimnl4prMs/',
    productSlug: 'rose-majesty',
    badge: 'NEW',
    videoUrl: '',
    poster: '',
    active: true,
    sortOrder: 1,
  },
  {
    id: 'DbQk6SfJyuA',
    permalink: 'https://www.instagram.com/p/DbQk6SfJyuA/',
    productSlug: 'lavender-bliss',
    badge: 'NEW',
    videoUrl: '',
    poster: '',
    active: true,
    sortOrder: 2,
  },
  {
    id: 'DbGJo5vIOYb',
    permalink: 'https://www.instagram.com/p/DbGJo5vIOYb/',
    productSlug: 'royal-chandan',
    badge: 'NEW',
    videoUrl: '',
    poster: '',
    active: true,
    sortOrder: 3,
  },
]

/** @deprecated use DEFAULT_INSTAGRAM_SHOP_LOOKS */
export const INSTAGRAM_SHOP_LOOKS = DEFAULT_INSTAGRAM_SHOP_LOOKS

export function instagramShortcode(permalink) {
  const m = String(permalink || '').match(/instagram\.com\/(?:p|reel|tv)\/([^/?#]+)/i)
  return m?.[1] || ''
}

export function instagramEmbedUrl(permalink) {
  const code = instagramShortcode(permalink)
  return code ? `https://www.instagram.com/p/${code}/embed` : permalink
}

export function normalizeInstagramShopLook(raw, index = 0) {
  const permalink = String(raw?.permalink || '').trim()
  const code = instagramShortcode(permalink) || String(raw?.id || '').trim()
  return {
    id: code || `look-${index}`,
    permalink,
    productSlug: String(raw?.productSlug || '').trim(),
    badge: String(raw?.badge || 'NEW').trim() || 'NEW',
    videoUrl: String(raw?.videoUrl || '').trim(),
    poster: String(raw?.poster || '').trim(),
    active: raw?.active !== false,
    sortOrder: Number.isFinite(Number(raw?.sortOrder)) ? Number(raw.sortOrder) : index,
  }
}

export function normalizeInstagramShopLooks(list) {
  const arr = Array.isArray(list) ? list : []
  const source = arr.length ? arr : DEFAULT_INSTAGRAM_SHOP_LOOKS
  return source
    .map((look, i) => normalizeInstagramShopLook(look, i))
    .filter((look) => look.permalink)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id))
}
