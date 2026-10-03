function rewardINR(n) {
  return `₹${Math.round(Number(n) || 0)}`
}

function markerPercent(index, count) {
  return ((index + 0.5) / count) * 100
}

function fillPercent(spent, tiers) {
  const count = tiers.length
  if (spent <= 0) return 0
  if (spent >= tiers[count - 1].amount) return 100
  let prevAmount = 0
  let prevPos = 0
  for (let i = 0; i < count; i++) {
    const pos = markerPercent(i, count)
    if (spent < tiers[i].amount) {
      const span = tiers[i].amount - prevAmount
      const t = span > 0 ? (spent - prevAmount) / span : 1
      return prevPos + t * (pos - prevPos)
    }
    prevAmount = tiers[i].amount
    prevPos = pos
  }
  return 100
}

function RewardGlyph({ type }) {
  if (type === 'shipping') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M2.8 9h11v7.2h-11z" />
        <path d="M13.8 11.6h4.2L21 15v1.2h-7.2" />
        <circle cx="6.6" cy="18.2" r="1.45" />
        <circle cx="16.8" cy="18.2" r="1.45" />
      </svg>
    )
  }
  if (type === 'gift') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4.2 11h15.6v8.2H4.2z" />
        <path d="M3.2 8h17.6v3H3.2z" />
        <path d="M12 8v11.2" />
        <path d="M12 8.2c-1.7 0-3.1-1.5-2.3-2.8C10.6 4.1 12 6.4 12 8.2z" />
        <path d="M12 8.2c1.7 0 3.1-1.5 2.3-2.8C13.4 4.1 12 6.4 12 8.2z" />
      </svg>
    )
  }
  return <span className="cart-rewards__rupee">₹</span>
}

function RewardBadge({ type, active }) {
  return (
    <span className="cart-rewards__slot">
      <span className={`cart-rewards__badge${active ? ' is-on' : ''}`}>
        <svg className="cart-rewards__shield" viewBox="0 0 42 46" aria-hidden="true">
          <path d="M8 2.2h26c2.3 0 4 1.7 4 4v15.6c0 1.1-.4 2.1-1.3 2.9L22.4 42.4c-.7.8-2.1.8-2.8 0L5.3 24.7c-.9-.8-1.3-1.8-1.3-2.9V6.2c0-2.3 1.7-4 4-4z" />
        </svg>
        <span className="cart-rewards__glyph">
          <RewardGlyph type={type} />
        </span>
      </span>
    </span>
  )
}

export default function CartRewards({ subtotal, rewards }) {
  const tiers = Array.isArray(rewards) ? rewards : []
  if (!tiers.length) return null

  const spent = Math.max(0, Number(subtotal) || 0)
  const next = tiers.find((tier) => spent < tier.amount)
  const progress = fillPercent(spent, tiers)
  const message = next
    ? `Shop For ${rewardINR(next.amount - spent)} & Get ${next.label}`
    : `You've Unlocked ${tiers[tiers.length - 1].label}`

  return (
    <section className="cart-rewards" aria-label="Cart rewards">
      <p className="cart-rewards__title">{message}</p>
      <div className="cart-rewards__track">
        <div className="cart-rewards__amounts">
          {tiers.map((tier) => (
            <strong key={`amt-${tier.amount}-${tier.label}`}>{rewardINR(tier.amount)}</strong>
          ))}
        </div>
        <div className="cart-rewards__icons">
          <div className="cart-rewards__line" aria-hidden="true">
            <span className={spent > 0 ? 'is-on' : undefined} style={{ width: `${progress}%` }} />
          </div>
          {tiers.map((tier) => {
            const reached = spent >= tier.amount
            const current = next?.amount === tier.amount
            return (
              <RewardBadge
                key={`icon-${tier.amount}-${tier.label}`}
                type={tier.icon}
                active={reached || current}
              />
            )
          })}
        </div>
        <div className="cart-rewards__labels">
          {tiers.map((tier) => (
            <em key={`lbl-${tier.amount}-${tier.label}`}>{tier.label}</em>
          ))}
        </div>
      </div>
    </section>
  )
}
