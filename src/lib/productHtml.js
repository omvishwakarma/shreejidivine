/**
 * Minimal HTML allowlist for product descriptions from the admin editor.
 * Strips scripts/events; keeps basic formatting tags.
 */
const ALLOWED_TAGS = new Set([
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'h2',
  'h3',
  'ul',
  'ol',
  'li',
  'blockquote',
  'span',
])

export function looksLikeHtml(value) {
  return /<\/?[a-z][\s\S]*>/i.test(String(value || ''))
}

export function sanitizeProductHtml(input) {
  const raw = String(input || '')
  if (!raw.trim()) return ''

  // Server / non-DOM fallback: strip obvious dangerous bits
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return raw
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/on\w+\s*=\s*(['"]).*?\1/gi, '')
      .replace(/javascript:/gi, '')
  }

  const doc = new DOMParser().parseFromString(raw, 'text/html')
  const walk = (node) => {
    const children = [...node.childNodes]
    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const tag = child.tagName.toLowerCase()
        if (!ALLOWED_TAGS.has(tag)) {
          while (child.firstChild) node.insertBefore(child.firstChild, child)
          node.removeChild(child)
          continue
        }
        ;[...child.attributes].forEach((attr) => child.removeAttribute(attr.name))
        walk(child)
      }
    }
  }
  walk(doc.body)
  return doc.body.innerHTML
}

/** Plain text → simple HTML paragraphs for the editor / storefront. */
export function plainTextToHtml(text) {
  const value = String(text || '').trim()
  if (!value) return ''
  if (looksLikeHtml(value)) return value
  return value
    .split(/\n{2,}/)
    .map((block) => `<p>${block.replace(/\n/g, '<br>')}</p>`)
    .join('')
}
