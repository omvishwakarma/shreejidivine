'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ShopNav from '../../components/ShopNav'
import Footer from '../../components/Footer'
import AddToCartButton from '../../components/AddToCartButton'
import { api } from '../../lib/api'
import { formatINR, toTitleCase } from '../../lib/products'
import { getRashiFromName, matchProductsForRashi } from '../../lib/rashi'
import '../ecom.css'
import './know-bracelet.css'

const empty = { name: '', dob: '', place: '' }

export default function KnowYourBraceletClient() {
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const canSubmit = useMemo(() => {
    return form.name.trim().length >= 2 && form.dob && form.place.trim().length >= 2
  }, [form])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setResult(null)

    const rashi = getRashiFromName(form.name)
    if (!rashi) {
      setError('Could not find Rashi for this name. Try the Hindi spelling or another form of your name.')
      return
    }

    setLoading(true)
    try {
      const data = await api('/api/products')
      const matches = matchProductsForRashi(data.products || [], rashi)
      setResult({
        name: form.name.trim(),
        place: form.place.trim(),
        dob: form.dob,
        rashi,
        products: matches,
      })
    } catch (err) {
      setError(err.message || 'Could not load bracelets')
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
          <span>Know Your Bracelet</span>
        </p>

        <header className="kyb__head">
          <p className="section-label">Rashi guide</p>
          <h1 className="ecom-title">Know Your Bracelet</h1>
          <p className="ecom-lead">
            Your Rashi is read from the first sound of your name (naam rashi), date of birth and place then we show the matching  bracelet.
          </p>
        </header>

        {!result ? (
          <form className="kyb-form" onSubmit={onSubmit}>
            <label className="kyb-field">
              <span>Name</span>
              <input
                required
                minLength={2}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Your full name"
                autoComplete="name"
              />
            </label>
            <label className="kyb-field">
              <span>Date of Birth</span>
              <input
                required
                type="date"
                value={form.dob}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))}
              />
            </label>
            <label className="kyb-field">
              <span>Place</span>
              <input
                required
                minLength={2}
                value={form.place}
                onChange={(e) => setForm((f) => ({ ...f, place: e.target.value }))}
                placeholder="City / town of birth"
                autoComplete="address-level2"
              />
            </label>

            {error ? <p className="kyb-error">{error}</p> : null}

            <button
              type="submit"
              className="btn-sm btn-primary btn-full"
              disabled={!canSubmit || loading}
            >
              {loading ? 'Finding your bracelet…' : 'Reveal my Rashi'}
            </button>
          </form>
        ) : (
          <div className="kyb-result">
            <div className="kyb-result__card">
              <p className="kyb-result__hello">
                Namaste, <strong>{toTitleCase(result.name)}</strong>
              </p>
              <p className="kyb-result__meta">
                Born in {toTitleCase(result.place)} ·{' '}
                {(() => {
                  const [y, m, d] = result.dob.split('-').map(Number)
                  return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                })()}
              </p>
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
                    From your name · Element: {result.rashi.element}. {result.rashi.traits}
                  </p>
                </div>
              </div>
            </div>

            <div className="kyb-result__products">
              <h3 className="kyb-result__products-title">Your matching bracelet</h3>
              {result.products.length === 0 ? (
                <div className="empty-state">
                  <p>No bracelet found for this Rashi yet.</p>
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
              Try another name
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
