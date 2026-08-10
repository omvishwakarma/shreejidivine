'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import ShopNav from '../../components/ShopNav'
import Footer from '../../components/Footer'
import AddToCartButton from '../../components/AddToCartButton'
import { api } from '../../lib/api'
import { formatINR } from '../../lib/products'
import '../ecom.css'

export default function ShopClient() {
  const searchParams = useSearchParams()
  const category = searchParams.get('category') || ''
  const subcategory = searchParams.get('subcategory') || ''

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const qs = new URLSearchParams()
    if (subcategory) qs.set('subcategory', subcategory)
    else if (category) qs.set('category', category)
    const path = qs.toString() ? `/api/products?${qs}` : '/api/products'

    Promise.all([api(path), fetch('/api/categories?nav=1').then((r) => r.json())])
      .then(([prod, cats]) => {
        setProducts(prod.products || [])
        setCategories(cats.categories || [])
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [category, subcategory])

  const title = useMemo(() => {
    if (!category && !subcategory) return 'All Products'
    const parent = categories.find((c) => c.slug === category)
    if (subcategory && parent) {
      const child = (parent.children || []).find((c) => c.slug === subcategory)
      return child?.name || parent.name
    }
    return parent?.name || 'Shop'
  }, [categories, category, subcategory])

  const activeParent = categories.find((c) => c.slug === category)

  return (
    <div className="ecom-page">
      <ShopNav />
      <div className="ecom-wrap">
        <header className="ecom-hero">
          <p className="section-label">Shop</p>
          <h1 className="ecom-title">{title}</h1>
          <p className="ecom-lead">
            Premium aroma stones &amp; fragrance oils — smoke-free ritual for home.
          </p>
        </header>

        <div className="shop-filters">
          <Link href="/shop" className={!category ? 'is-active' : undefined}>
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/shop?category=${c.slug}`}
              className={category === c.slug && !subcategory ? 'is-active' : undefined}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {activeParent?.children?.length ? (
          <div className="shop-filters shop-filters--sub">
            <Link
              href={`/shop?category=${activeParent.slug}`}
              className={!subcategory ? 'is-active' : undefined}
            >
              All {activeParent.name}
            </Link>
            {activeParent.children.map((c) => (
              <Link
                key={c.id}
                href={`/shop?category=${activeParent.slug}&subcategory=${c.slug}`}
                className={subcategory === c.slug ? 'is-active' : undefined}
              >
                {c.name}
              </Link>
            ))}
          </div>
        ) : null}

        {loading ? <div className="empty-state">Loading products…</div> : null}
        {error ? (
          <div className="empty-state">
            <p>Could not load products: {error}</p>
          </div>
        ) : null}

        {!loading && !error ? (
          products.length === 0 ? (
            <div className="empty-state">
              <p>No products in this category yet.</p>
              <Link href="/shop" className="btn-sm btn-primary">
                View all
              </Link>
            </div>
          ) : (
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
          )
        ) : null}
      </div>
      <Footer />
    </div>
  )
}
