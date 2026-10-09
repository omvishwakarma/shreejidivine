'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import AddToCartButton from './AddToCartButton'
import { api } from '../lib/api'
import { formatINR, toTitleCase } from '../lib/products'
import { freeShippingGoal } from '../lib/cartRewards'

function pickOffers(products) {
  return (products || [])
    .filter((product) => {
      const price = Number(product?.price) || 0
      return product?.id && price > 0 && price < 300
    })
    .sort((a, b) => Number(a.price) - Number(b.price) || String(a.name).localeCompare(String(b.name)))
}

export default function CheckoutOffers({ subtotal, settings }) {
  const [products, setProducts] = useState([])
  const [focus, setFocus] = useState(false)
  const goal = freeShippingGoal(settings)
  const spent = Math.max(0, Math.round(Number(subtotal) || 0))
  const remaining = goal > 0 ? Math.max(0, goal - spent) : 0
  const unlocked = goal > 0 && remaining === 0
  const progress = goal > 0 ? Math.min(100, Math.round((spent / goal) * 100)) : 0

  const picks = useMemo(() => pickOffers(products), [products])
  const sectionTitle = 'Under ₹300'
  const fromPrice = picks.length ? Math.min(...picks.map((product) => Number(product.price) || 0)) : 0

  useEffect(() => {
    let cancelled = false
    api('/api/products')
      .then((data) => {
        if (!cancelled) setProducts(data.products || [])
      })
      .catch(() => {
        if (!cancelled) setProducts([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  function openOffers() {
    const el = document.getElementById('checkout-offers')
    if (!el) return
    setFocus(true)
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    window.setTimeout(() => setFocus(false), 1600)
  }

  if (!goal && picks.length === 0) return null

  return (
    <div className="ck-offers-wrap">
      {goal > 0 ? (
        <section
          className={`ck-ship-goal${unlocked ? ' is-done' : ''}`}
          aria-label="Free shipping progress"
        >
          <p className="ck-ship-goal__message">
            <span className="ck-ship-goal__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                {unlocked ? (
                  <path d="M5 12.5 9.2 17 19 7" />
                ) : (
                  <>
                    <path d="M3 8.5h11.2v7.2H3z" />
                    <path d="M14.2 11.2h3.6L20.5 15v.7h-6.3" />
                    <circle cx="6.4" cy="17.6" r="1.35" />
                    <circle cx="16.6" cy="17.6" r="1.35" />
                  </>
                )}
              </svg>
            </span>
            {unlocked
              ? 'Congratulations! You unlocked Free Shipping 🎉'
              : <>Add products worth <strong>{formatINR(remaining)}</strong> more to unlock FREE SHIPPING!</>}
          </p>
          <div
            className="ck-ship-goal__track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={goal}
            aria-valuenow={Math.min(spent, goal)}
            aria-label="Amount toward free shipping"
          >
            <span className="ck-ship-goal__fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="ck-ship-goal__meta">
            <span>
              {formatINR(Math.min(spent, goal))} / {formatINR(goal)}
            </span>
            <span>{unlocked ? 'Unlocked' : `${formatINR(remaining)} more to go`}</span>
          </div>
          {picks.length > 0 ? (
            <>
              <button type="button" className="ck-ship-goal__cta" onClick={openOffers}>
                Explore Offers →
              </button>
              {fromPrice > 0 ? (
                <p className="ck-ship-goal__note">Handpicked deals starting at {formatINR(fromPrice)}</p>
              ) : null}
            </>
          ) : null}
        </section>
      ) : null}

      {picks.length > 0 ? (
        <section
          id="checkout-offers"
          className={`ck-offers${focus ? ' is-focus' : ''}`}
          aria-label={sectionTitle}
        >
          <div className="ck-offers__head">
            <h3>{sectionTitle}</h3>
            <span>{picks.length} products</span>
          </div>
          <div className="ck-offers__grid">
            {picks.map((product) => (
              <article key={product.id} className="ck-offer">
                <Link href={`/shop/${product.slug}`} className="ck-offer__media">
                  <Image
                    src={product.image || '/images/aroma-variants.png'}
                    alt={product.name}
                    width={160}
                    height={160}
                  />
                </Link>
                <div className="ck-offer__body">
                  <Link href={`/shop/${product.slug}`}>
                    <h4>{toTitleCase(product.name)}</h4>
                  </Link>
                  <strong>{formatINR(product.price)}</strong>
                  <AddToCartButton product={product} label="ADD +" className="ck-offer__add" />
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
