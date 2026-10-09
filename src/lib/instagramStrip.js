import { SOCIAL } from '@/lib/site'

export const INSTAGRAM_STRIP_DEFAULTS = {
  label: 'Follow us on Instagram',
  handle: SOCIAL.instagramHandle || '@shreejidivine.co',
  url: SOCIAL.instagram || 'https://www.instagram.com/shreejidivine.co',
  cta: 'Visit Instagram',
}

const PREVIOUS_HANDLES = new Set(['@shreeji.divine', 'shreeji.divine', '@shreejidivinearoma'])
const PREVIOUS_URLS = new Set([
  'https://www.instagram.com/shreeji.divine',
  'https://instagram.com/shreeji.divine',
  'https://www.instagram.com/shreejidivinearoma',
  'https://instagram.com/shreejidivinearoma',
])

export function currentInstagramHandle(value) {
  const handle = String(value || '').trim()
  if (!handle || PREVIOUS_HANDLES.has(handle.toLowerCase())) return INSTAGRAM_STRIP_DEFAULTS.handle
  return handle
}

export function currentInstagramUrl(value) {
  const url = String(value || '').trim().replace(/\/+$/, '')
  if (!url || PREVIOUS_URLS.has(url.toLowerCase())) return INSTAGRAM_STRIP_DEFAULTS.url
  return String(value || '').trim()
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
    handle: currentInstagramHandle(settings?.instagramStripHandle) || d.handle,
    url: currentInstagramUrl(settings?.instagramStripUrl) || d.url,
    cta: settings?.instagramStripCta || d.cta,
  }
}
