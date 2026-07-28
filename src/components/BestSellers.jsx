'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import AddToCartButton from './AddToCartButton'
import { api } from '../lib/api'
import { formatINR } from '../lib/products'
import './BestSellers.css'

export default function BestSellers() {
  const [products, setProducts] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api('/api/products')
      .then((d) => setProducts((d.products || []).slice(0, 6)))
      .catch((err) => setError(err.message))
  }, [])

  return (
    <section className="best-sellers" id="products" aria-labelledby="best-sellers-heading">
      <div className="container">
        <div className="best-sellers__head reveal">
          <p className="section-label">Best Seller</p>
          <h2 id="best-sellers-heading" className="section-title">
            Shop sacred favourites
          </h2>
          <p className="section-lead">
            Handcrafted aroma stones and fragrance oils — smoke-free ritual for everyday stillness.
          </p>
        </div>

        {error ? (
          <p className="best-sellers__error">Could not load products.</p>
        ) : (
          <div className="best-sellers__grid">
            {products.map((p, i) => (
              <article
                key={p.id}
                className={`ss-card reveal reveal-delay-${(i % 3) + 1}`}
              >
                <Link href={`/shop/${p.slug}`} className="ss-card__media">
                  {p.badge || p.compareAt ? (
                    <span className="ss-card__badge">{p.badge || 'Offer'}</span>
                  ) : null}
                  <Image
                    src={p.image}
                    alt={p.name}
                    width={700}
                    height={700}
                    sizes="(max-width:700px) 100vw, 360px"
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
                    <AddToCartButton product={p} />
                  </div>
                </div>
              </article>
            ))}
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
