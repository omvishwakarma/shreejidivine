const REWARD_ICONS = new Set(['shipping', 'discount', 'gift', 'rupee'])

export const DEFAULT_CART_REWARDS = [
  { amount: 499, label: 'Free Shipping', icon: 'shipping' },
  { amount: 999, label: '₹99 off', icon: 'discount' },
  { amount: 1299, label: 'Free Attar', icon: 'gift' },
  { amount: 1999, label: '₹239 off', icon: 'rupee' },
]

export function normalizeCartRewards(list) {
  if (!Array.isArray(list)) return []
  return list
    .map((item) => {
      const amount = Math.round(Number(item?.amount) || 0)
      const label = String(item?.label || '').trim().slice(0, 40)
      const icon = REWARD_ICONS.has(item?.icon) ? item.icon : 'gift'
      if (amount <= 0 || !label) return null
      return { amount, label, icon }
    })
    .filter(Boolean)
    .sort((a, b) => a.amount - b.amount)
    .slice(0, 6)
}

export function resolveCartRewards(list) {
  const rewards = normalizeCartRewards(list)
  if (rewards.length) return rewards
  return DEFAULT_CART_REWARDS.map((item) => ({ ...item }))
}

function moneyOff(reward) {
  if (reward?.icon !== 'discount' && reward?.icon !== 'rupee') return 0
  const label = String(reward?.label || '')
  const match = label.match(/₹\s*([\d,]+)|(?:rs\.?|inr)\s*([\d,]+)|([\d,]+)\s*off/i)
  if (!match) return 0
  const raw = String(match[1] || match[2] || match[3] || '').replace(/,/g, '')
  return Math.max(0, Math.round(Number(raw) || 0))
}

export function applyCartRewards(subtotal, rewards, maxDiscount = Infinity) {
  const spent = Math.max(0, Math.round(Number(subtotal) || 0))
  const cap = Math.min(spent, Math.max(0, Number(maxDiscount) || 0))
  const tiers = Array.isArray(rewards) ? rewards : []
  const offers = []
  let room = cap
  let freeShipping = false

  for (const tier of tiers) {
    if (!tier || spent < Number(tier.amount)) continue
    if (tier.icon === 'shipping' || /free\s*shipping/i.test(String(tier.label || ''))) {
      freeShipping = true
    }
    const off = moneyOff(tier)
    if (off <= 0 || room <= 0) continue
    const applied = Math.min(off, room)
    room -= applied
    offers.push({ label: tier.label, off: applied })
  }

  const discount = offers.reduce((sum, offer) => sum + offer.off, 0)
  return {
    discount,
    freeShipping,
    offers,
    label: offers.map((offer) => offer.label).join(', '),
  }
}

export function shippingFeeFor(subtotal, settings) {
  const spent = Math.max(0, Number(subtotal) || 0)
  const fee = Math.max(0, Number(settings?.shippingFee) || 0)
  const minFree = Math.max(0, Number(settings?.freeShippingMinOrder) || 0)
  if (fee === 0) return 0
  if (minFree > 0 && spent >= minFree) return 0
  if (applyCartRewards(spent, settings?.cartRewards).freeShipping) return 0
  return fee
}
