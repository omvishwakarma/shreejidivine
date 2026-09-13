/**
 * Only allow web-safe image paths for next/image and <img>.
 * Rejects Windows/mac absolute paths pasted from desktop folders.
 */
export function isSafePublicImage(src) {
  const value = String(src || '').trim()
  if (!value) return false
  if (value.startsWith('/')) {
    // Public folder path — block drive letters / backslashes
    if (value.includes('\\') || /^\/[a-zA-Z]:/.test(value)) return false
    return true
  }
  if (/^https?:\/\//i.test(value)) return true
  return false
}

export function safePublicImage(src, fallback = '/images/aroma-collection.png') {
  return isSafePublicImage(src) ? String(src).trim() : fallback
}
