export const TRUST_ICONS = ['flame', 'smoke', 'leaf', 'diya']

export const DEFAULT_TRUST_ITEMS = [
  {
    id: 'flame-free',
    icon: 'flame',
    title: 'Flame-Free',
    text: 'Pure fragrance, no flame',
    active: true,
  },
  {
    id: 'smoke-free',
    icon: 'smoke',
    title: 'Smoke-Free',
    text: 'Clean aroma, no ash',
    active: true,
  },
  {
    id: 'handcrafted',
    icon: 'leaf',
    title: 'Handcrafted',
    text: 'Made in India',
    active: true,
  },
  {
    id: 'reusable',
    icon: 'diya',
    title: 'Reusable',
    text: 'Refresh with fragrance oil',
    active: true,
  },
]

export function normalizeTrustItems(list) {
  const arr = Array.isArray(list) ? list : []
  return arr
    .map((item, index) => {
      const icon = TRUST_ICONS.includes(item?.icon) ? item.icon : 'flame'
      const title = String(item?.title || '').trim().slice(0, 40)
      return {
        id: String(item?.id || `trust-${index}`).trim() || `trust-${index}`,
        icon,
        title,
        text: String(item?.text || '').trim().slice(0, 80),
        active: item?.active !== false,
      }
    })
    .filter((item) => item.title)
    .slice(0, 8)
}

export function trustItemsFromSettings(value) {
  if (!Array.isArray(value)) return normalizeTrustItems(DEFAULT_TRUST_ITEMS)
  return normalizeTrustItems(value)
}
