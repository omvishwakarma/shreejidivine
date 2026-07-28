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
          <p className="section-label">Shop</p>
          <h1 className="ecom-title">All Products</h1>
          <p className="ecom-lead">
            Premium aroma stones &amp; fragrance oils — smoke-free ritual for home.
          </p>
        </header>

        {loading ? <div className="empty-state">Loading products…</div> : null}
        {error ? (
          <div className="empty-state">
            <p>Could not load products: {error}</p>
            <p>
              Could not reach the products API. On Vercel, set{' '}
              <code>MONGODB_URI</code> and <code>JWT_SECRET</code> in project
              Environment Variables, then redeploy.
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
                  <Link href={`/shop/${p.slug}`}>
                    <h2 className="product-card__name">{p.name}</h2>
                  </Link>
                  <p className="product-card__tag">{p.tagline}</p>
                  <div className="product-card__price">
                    <strong>{formatINR(p.price)}</strong>
                    {p.compareAt ? <s>{formatINR(p.compareAt)}</s> : null}
                  </div>
                  <div className="product-card__actions">
                    <AddToCartButton product={p} />
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
