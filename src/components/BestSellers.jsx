'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import AddToCartButton from './AddToCartButton'
import { api } from '../lib/api'
import { formatINR } from '../lib/products'
import './BestSellers.css'

function discountPct(price, compareAt) {
  if (!compareAt || compareAt <= price) return 0
  return Math.round(((compareAt - price) / compareAt) * 100)
}

export default function BestSellers() {
  const [products, setProducts] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api('/api/products')
      .then((d) => setProducts((d.products || []).slice(0, 4)))
      .catch((err) => setError(err.message))
  }, [])

  return (
    <section className="best-sellers" id="products" aria-labelledby="best-sellers-heading">
      <div className="container">
        <div className="best-sellers__head reveal">
          <p className="section-label">Customer favourites</p>
          <h2 id="best-sellers-heading" className="section-title">
            Best Sellers
          </h2>
          <p className="section-lead">
            Most-loved aroma stones and oils — ready for home rituals and gifting.
          </p>
        </div>

        {error ? (
          <p className="best-sellers__error">Could not load products.</p>
        ) : (
          <div className="best-sellers__grid">
            {products.map((p, i) => {
              const off = discountPct(p.price, p.compareAt)
              return (
                <article
                  key={p.id}
                  className={`ss-card reveal reveal-delay-${(i % 4) + 1}`}
                >
                  <Link href={`/shop/${p.slug}`} className="ss-card__media">
                    {p.badge ? <span className="ss-card__badge">{p.badge}</span> : null}
                    {off > 0 ? <span className="ss-card__off">−{off}%</span> : null}
                    <Image
                      src={p.image}
                      alt={p.name}
                      width={700}
                      height={700}
                      sizes="(max-width:700px) 100vw, 280px"
                    />
                  </Link>
                  <div className="ss-card__body">
                    <Link href={`/shop/${p.slug}`}>
                      <h3 className="ss-card__name">{p.name}</h3>
                    </Link>
                    {p.tagline ? <p className="ss-card__tag">{p.tagline}</p> : null}
                    <div className="ss-card__price">
                      <strong>{formatINR(p.price)}</strong>
                      {p.compareAt ? <s>{formatINR(p.compareAt)}</s> : null}
                    </div>
                    <div className="ss-card__actions">
                      <AddToCartButton product={p} className="ss-card__btn" />
                      <Link href={`/shop/${p.slug}`} className="ss-card__link">
                        Quick view
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        <div className="best-sellers__cta reveal">
          <Link href="/shop" className="btn btn-ink">
            View all products
          </Link>
        </div>
      </div>
    </section>
  )
}
