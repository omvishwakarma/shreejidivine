export function isBlobSrc(src) {
  return String(src || '').includes('/api/blob')
}

/** Resize private blob images at the proxy so cards, hero, and thumbs stay light. */
export function storeImageSrc(src, width) {
  const value = String(src || '').trim()
  if (!value || !isBlobSrc(value)) return value
  const [path, query = ''] = value.split('?')
  const params = new URLSearchParams(query)
  if (width) params.set('w', String(width))
  if (!params.has('fm')) params.set('fm', 'webp')
  const search = params.toString()
  return search ? `${path}?${search}` : path
}
