import { safePublicImage, safePublicMedia } from '@/lib/media'

function instagramUrl(value) {
  const raw = String(value || '').trim()
  if (!raw) return ''
  try {
    const url = new URL(raw)
    if (!/(^|\.)instagram\.com$/i.test(url.hostname)) return ''
    return url.toString()
  } catch {
    return ''
  }
}

function reviewStatus(review, fallback = 'approved') {
  if (review?.status === 'pending' || review?.status === 'approved') return review.status
  return fallback
}

export function normalizeReviews(list, { defaultStatus = 'approved' } = {}) {
  if (!Array.isArray(list)) return []
  return list
    .map((review) => {
      const stars = Math.round(Number(review?.stars))
      const images = [...new Set((review?.images || []).map((src) => safePublicMedia(src, '')).filter(Boolean))].slice(0, 8)
      const id = String(review?.id || review?._id || '').trim()
      const item = {
        id,
        name: String(review?.name || '').trim().slice(0, 80),
        stars: stars >= 1 && stars <= 5 ? stars : 5,
        text: String(review?.text || '').trim().slice(0, 1200),
        images,
        video: safePublicMedia(review?.video || '', ''),
        instagram: instagramUrl(review?.instagram),
        status: reviewStatus(review, defaultStatus),
        userId: String(review?.userId || review?.user || '').trim(),
      }
      const hasContent = item.text || item.images.length || item.video || item.instagram
      return hasContent ? item : null
    })
    .filter(Boolean)
    .slice(0, 40)
}

export function reviewsForStorage(list) {
  return normalizeReviews(list).map((review) => {
    const stored = {
      name: review.name,
      stars: review.stars,
      text: review.text,
      images: review.images,
      video: review.video,
      instagram: review.instagram,
      status: review.status,
      userId: review.userId,
    }
    if (/^[a-f0-9]{24}$/i.test(review.id)) stored._id = review.id
    return stored
  })
}

export function publicReviews(list) {
  return normalizeReviews(list)
    .filter((review) => review.status === 'approved')
    .map((review) => ({
      id: review.id,
      name: review.name,
      stars: review.stars,
      text: review.text,
      images: review.images.map((src) => safePublicImage(src, '')).filter(Boolean),
      video: review.video,
      instagram: review.instagram,
    }))
}

export function adminReviews(list) {
  return normalizeReviews(list).map((review) => ({
    ...review,
    images: review.images.map((src) => safePublicImage(src, '')).filter(Boolean),
  }))
}
