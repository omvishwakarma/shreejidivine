import { SOCIAL } from '@/lib/site'

export const INSTAGRAM_STRIP_DEFAULTS = {
  label: 'Follow us on Instagram',
  handle: SOCIAL.instagramHandle || '@shreeji.divine',
  url: SOCIAL.instagram || 'https://www.instagram.com/shreeji.divine',
  cta: 'Visit Instagram',
}

export function normalizeInstagramStripPost(raw, index = 0) {
  return {
    id: String(raw?.id || `strip-${index}`).trim() || `strip-${index}`,
    image: String(raw?.image || '').trim(),
    video: String(raw?.video || '').trim(),
    permalink: String(raw?.permalink || '').trim(),
    active: raw?.active !== false,
    sortOrder: Number.isFinite(Number(raw?.sortOrder)) ? Number(raw.sortOrder) : index,
  }
}

export function normalizeInstagramStripPosts(list) {
  const arr = Array.isArray(list) ? list : []
  return arr
    .map((item, index) => normalizeInstagramStripPost(item, index))
    .filter((item) => /instagram\.com\/(?:[\w.-]+\/)?(?:p|reel|tv)\//i.test(item.permalink))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item, index) => ({ ...item, sortOrder: index }))
}

export function instagramStripCopy(settings) {
  const d = INSTAGRAM_STRIP_DEFAULTS
  return {
    label: settings?.instagramStripLabel || d.label,
    handle: settings?.instagramStripHandle || d.handle,
    url: settings?.instagramStripUrl || d.url,
    cta: settings?.instagramStripCta || d.cta,
  }
}
