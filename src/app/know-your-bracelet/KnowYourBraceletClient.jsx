'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ShopNav from '../../components/ShopNav'
import Footer from '../../components/Footer'
import AddToCartButton from '../../components/AddToCartButton'
import { api } from '../../lib/api'
import { formatINR, toTitleCase } from '../../lib/products'
import { RASHIS, matchProductsForRashi } from '../../lib/rashi'
import '../ecom.css'
import './know-bracelet.css'

const INTENTS = [
  {
    id: 'health',
    emoji: '🌿',
    title: 'Health & Vitality',
    detail: 'Body, energy, healing',
  },
  {
    id: 'wealth',
    emoji: '💰',
    title: 'Wealth & Abundance',
    detail: 'Money, career, growth',
  },
  {
    id: 'love',
    emoji: '❤️',
    title: 'Love & Relationships',
    detail: 'Bond, harmony, soulmate',
  },
  {
    id: 'protection',
    emoji: '🛡️',
    title: 'Protection & Peace',
    detail: 'Negativity, anxiety, stress',
  },
  {
    id: 'spiritual',
    emoji: '🕉️',
    title: 'Spiritual Growth',
    detail: 'Meditation, clarity, awakening',
  },
  {
    id: 'confidence',
    emoji: '🔥',
    title: 'Confidence & Power',
    detail: 'Self-worth, leadership',
  },
]

export default function KnowYourBraceletClient() {
  const [rashiKey, setRashiKey] = useState('')
  const [intentId, setIntentId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const canSubmit = useMemo(() => Boolean(rashiKey && intentId), [rashiKey, intentId])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setResult(null)

    const rashi = RASHIS.find((r) => r.key === rashiKey)
    const intent = INTENTS.find((item) => item.id === intentId)
    if (!rashi || !intent) {
      setError('Select your Rashi and what is on your mind.')
      return
    }

    setLoading(true)
    try {
      const data = await api('/api/products')
      const matches = matchProductsForRashi(data.products || [], rashi)
      setResult({ rashi, intent, products: matches })
    } catch (err) {
      setError(err.message || 'Could not load products')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setResult(null)
    setError('')
  }

  return (
    <div className="ecom-page">
      <ShopNav />
      <div className="ecom-wrap ecom-wrap--shop kyb">
        <p className="breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true"> / </span>
          <span>Know Your Product</span>
        </p>

        <header className="kyb__head">
          <p className="section-label">Rashi guide</p>
          <h1 className="ecom-title">Know Your Product</h1>
          <p className="ecom-lead">
            Select your Rashi and what is on your mind. We show the product that matches your Rashi and your mind.
          </p>
        </header>

        {!result ? (
          <form className="kyb-form" onSubmit={onSubmit}>
            <div className="kyb-field">
              <span id="kyb-rashi-label">Your Rashi</span>
              <RashiSelect value={rashiKey} onChange={setRashiKey} />
            </div>

            <fieldset className="kyb-intent">
              <legend>
                <span className="kyb-intent__title">
                  What is your <em>mann</em> seeking?
                </span>
                <span className="kyb-intent__lead">
                  Choose the wish that feels closest today. We match a product to this and your Rashi.
                </span>
              </legend>
              <div className="kyb-intent__grid">
                {INTENTS.map((item) => (
                  <label
                    key={item.id}
                    className={`kyb-intent__card${intentId === item.id ? ' is-on' : ''}`}
                  >
                    <input
                      type="radio"
                      name="intent"
                      value={item.id}
                      checked={intentId === item.id}
                      onChange={() => setIntentId(item.id)}
                    />
                    <span className="kyb-intent__radio" aria-hidden="true" />
                    <span className="kyb-intent__emoji" aria-hidden="true">
                      {item.emoji}
                    </span>
                    <span className="kyb-intent__copy">
                      <strong>{item.title}</strong>
                      <span>{item.detail}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {error ? <p className="kyb-error">{error}</p> : null}

            <button
              type="submit"
              className="btn-sm btn-primary btn-full"
              disabled={!canSubmit || loading}
            >
              {loading ? 'Finding your product…' : 'Find my product'}
            </button>
          </form>
        ) : (
          <div className="kyb-result">
            <div className="kyb-result__card">
              <div className="kyb-result__rashi">
                <span className="kyb-result__symbol" aria-hidden="true">
                  {result.rashi.symbol}
                </span>
                <div>
                  <h2>
                    {result.rashi.name} Rashi
                    <span> · {result.rashi.english}</span>
                  </h2>
                  <p>
                    For {result.intent.title}. Element: {result.rashi.element}. {result.rashi.traits}
                  </p>
                </div>
              </div>
            </div>

            <div className="kyb-result__products">
              <h3 className="kyb-result__products-title">Your matching product</h3>
              {result.products.length === 0 ? (
                <div className="empty-state">
                  <p>No product found for this Rashi yet.</p>
                  <Link href="/shop" className="btn-sm btn-primary">
                    Browse shop
                  </Link>
                </div>
              ) : (
                <div className="ecom-grid kyb-grid">
                  {result.products.map((p) => (
                    <article key={p.id} className="product-card">
                      <Link href={`/shop/${p.slug}`} className="product-card__media">
                        {p.badge ? <span className="product-card__badge">{p.badge}</span> : null}
                        <Image
                          src={p.image}
                          alt={p.name}
                          width={700}
                          height={875}
                          sizes="(max-width:560px) 50vw, 360px"
                        />
                      </Link>
                      <div className="product-card__body">
                        <Link href={`/shop/${p.slug}`}>
                          <h2 className="product-card__name">{toTitleCase(p.name)}</h2>
                        </Link>
                        <div className="product-card__price">
                          <strong>{formatINR(p.price)}</strong>
                          {p.compareAt ? <s>{formatINR(p.compareAt)}</s> : null}
                        </div>
                        <div className="product-card__actions">
                          <AddToCartButton product={p} />
                          <Link href={`/shop/${p.slug}`} className="btn-sm btn-ghost btn-full">
                            View
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <button type="button" className="btn-sm btn-ghost kyb-again" onClick={reset}>
              Choose again
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

function RashiSelect({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const selected = RASHIS.find((r) => r.key === value)

  useEffect(() => {
    if (!open) return undefined
    function onDoc(e) {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className={`kyb-select${open ? ' is-open' : ''}`} ref={rootRef}>
      <button
        type="button"
        className="kyb-select__btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby="kyb-rashi-label"
        onClick={() => setOpen((current) => !current)}
      >
        {selected ? (
          <>
            <span className="kyb-select__icon" aria-hidden="true">
              {selected.symbol}
            </span>
            <span className="kyb-select__label">
              {selected.name}
              <em>{selected.english}</em>
            </span>
          </>
        ) : (
          <span className="kyb-select__placeholder">Select your Rashi</span>
        )}
        <span className="kyb-select__chev" aria-hidden="true" />
      </button>
      {open ? (
        <ul className="kyb-select__list" role="listbox" aria-labelledby="kyb-rashi-label">
          {RASHIS.map((rashi) => (
            <li key={rashi.key}>
              <button
                type="button"
                role="option"
                aria-selected={value === rashi.key}
                className={value === rashi.key ? 'is-on' : undefined}
                onClick={() => {
                  onChange(rashi.key)
                  setOpen(false)
                }}
              >
                <span className="kyb-select__icon" aria-hidden="true">
                  {rashi.symbol}
                </span>
                <span className="kyb-select__label">
                  {rashi.name}
                  <em>{rashi.english}</em>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
