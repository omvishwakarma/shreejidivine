'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import ShopNav from '../../../components/ShopNav'
import Footer from '../../../components/Footer'
import AddToCartButton from '../../../components/AddToCartButton'
import { api } from '../../../lib/api'
import { formatINR } from '../../../lib/products'
import '../../ecom.css'
import './product.css'

export default function ProductClient() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!slug) return
    api(`/api/products/${slug}`)
      .then((d) => setProduct(d.product))
      .catch((err) => setError(err.message))
  }, [slug])

  return (
    <div className="ecom-page">
      <ShopNav />
      <div className="ecom-wrap product-detail">
        <p className="breadcrumb">
          <Link href="/shop">Shop</Link>
          <span aria-hidden="true"> / </span>
          {product?.name || 'Product'}
        </p>

        {error ? <div className="empty-state">{error}</div> : null}
        {!product && !error ? <div className="empty-state">Loading…</div> : null}

        {product ? (
          <div className="product-detail__grid">
            <div className="product-detail__media">
              {product.badge ? <span className="product-card__badge">{product.badge}</span> : null}
              <Image
                src={product.image}
                alt={product.name}
                width={900}
                height={900}
                priority
                sizes="(max-width:860px) 100vw, 540px"
              />
            </div>
            <div className="product-detail__info">
              <p className="product-card__tag">{product.tagline}</p>
              <h1 className="ecom-title">{product.name}</h1>
              <div className="product-detail__price">
                <strong>{formatINR(product.price)}</strong>
                {product.compareAt ? <s>{formatINR(product.compareAt)}</s> : null}
              </div>
              <p className="ecom-lead" style={{ marginTop: '1rem' }}>
                {product.description}
              </p>
              <ul className="product-detail__highlights">
                {(product.highlights || []).map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
              <div className="product-detail__cta">
                <AddToCartButton product={product} label="Add to Cart" className="btn-full" />
                <Link href="/cart" className="btn-sm btn-ghost btn-full">
                  Go to Cart
                </Link>
              </div>
              <p className="product-detail__note">
                Free pan-India shipping · Cash on delivery available
              </p>
            </div>
          </div>
        ) : null}
      </div>
      <Footer />
    </div>
  )
}
