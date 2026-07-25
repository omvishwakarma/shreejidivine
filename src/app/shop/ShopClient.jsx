'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import ShopNav from '../../components/ShopNav'
import Footer from '../../components/Footer'
import AddToCartButton from '../../components/AddToCartButton'
import { api } from '../../lib/api'
import { formatINR } from '../../lib/products'
import '../ecom.css'

export default function ShopClient() {
  const [products, setProducts] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/api/products')
      .then((d) => setProducts(d.products || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="ecom-page">
      <ShopNav />
      <div className="ecom-wrap">
        <header className="ecom-hero">
          <p className="section-label">Shreeji Divine Collection</p>
          <h1 className="ecom-title">Shop Aroma Stones</h1>
          <p className="ecom-lead">
            Premium handcrafted stones &amp; fragrance oils — gift-ready, smoke-free, Made in India.
          </p>
          <div className="ecom-trust">
            <span>Free Shipping</span>
            <span>COD Available</span>
            <span>Handmade</span>
          </div>
        </header>

        {loading ? <div className="empty-state">Loading products…</div> : null}
        {error ? (
          <div className="empty-state">
            <p>Could not load products: {error}</p>
            <p>
              Check that the API is running (<code>npm run dev:api</code>) and that your IP is
              allowed in MongoDB Atlas → Network Access.
            </p>
          </div>
        ) : null}

        {!loading && !error ? (
          <div className="ecom-grid">
            {products.map((p) => (
              <article key={p.id} className="product-card">
                <Link href={`/shop/${p.slug}`} className="product-card__media">
                  {p.badge ? <span className="product-card__badge">{p.badge}</span> : null}
                  <Image
                    src={p.image}
                    alt={p.name}
                    width={700}
                    height={600}
                    sizes="(max-width:700px) 100vw, 360px"
                  />
                </Link>
                <div className="product-card__body">
                  <p className="product-card__tag">{p.tagline}</p>
                  <Link href={`/shop/${p.slug}`}>
                    <h2 className="product-card__name">{p.name}</h2>
                  </Link>
                  <div className="product-card__price">
                    <strong>{formatINR(p.price)}</strong>
                    {p.compareAt ? <s>{formatINR(p.compareAt)}</s> : null}
                  </div>
                  <div className="product-card__actions">
                    <AddToCartButton product={p} />
                    <Link href={`/shop/${p.slug}`} className="btn-sm btn-ghost">
                      Details
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
      <Footer />
    </div>
  )
}
