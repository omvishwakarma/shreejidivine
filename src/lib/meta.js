export function trackMeta(event, params = {}) {
  if (typeof window === 'undefined') return
  if (typeof window.fbq === 'function') {
    window.fbq('track', event, params)
    return
  }
  window.__sjMetaQueue = window.__sjMetaQueue || []
  window.__sjMetaQueue.push([event, params])
}

export function flushMetaQueue() {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return
  const queued = window.__sjMetaQueue || []
  window.__sjMetaQueue = []
  queued.forEach(([event, params]) => window.fbq('track', event, params))
}

export function purchaseMeta(items, total) {
  const lines = Array.isArray(items) ? items : []
  return {
    content_ids: lines.map((item) => String(item.productId)),
    content_type: 'product',
    contents: lines.map((item) => ({
      id: String(item.productId),
      quantity: item.quantity,
    })),
    value: Number(total) || 0,
    currency: 'INR',
    num_items: lines.reduce((sum, item) => sum + item.quantity, 0),
  }
}
