'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import ShopNav from '../../../components/ShopNav'
import Footer from '../../../components/Footer'
import AddToCartButton from '../../../components/AddToCartButton'
import { api } from '../../../lib/api'
import { formatINR } from '../../../lib/products'
import { safePublicImage, safePublicMedia } from '../../../lib/media'
import '../../ecom.css'
import './product.css'

export default function ProductClient() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [error, setError] = useState('')
  const [activeKey, setActiveKey] = useState('img-0')

  useEffect(() => {
    if (!slug) return
    api(`/api/products/${slug}`)
      .then((d) => {
        setProduct(d.product)
        setActiveKey('img-0')
      })
      .catch((err) => setError(err.message))
  }, [slug])

  const gallery = useMemo(() => {
    if (!product) return []
    const imgs = Array.isArray(product.gallery) && product.gallery.length
      ? product.gallery
      : product.image
        ? [product.image]
        : []
    return [...new Set(imgs.map((src) => safePublicImage(src, '')).filter(Boolean))]
  }, [product])

  const video = product ? safePublicMedia(product.video, '') : ''

  const mediaItems = useMemo(() => {
    const items = gallery.map((src, index) => ({
      key: `img-${index}`,
      type: 'image',
      src,
      index,
    }))
    if (video) {
      items.push({
        key: 'video',
        type: 'video',
        src: video,
        poster: gallery[0] || product?.image || '',
      })
    }
    return items
  }, [gallery, video, product])

  const showThumbs = mediaItems.length > 1
  const active =
    mediaItems.find((item) => item.key === activeKey) || mediaItems[0] || null

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
            <div className="product-detail__gallery">
              <div className="product-detail__stage">
                <div className="product-detail__media">
                  {product.badge ? <span className="product-card__badge">{product.badge}</span> : null}
                  {active?.type === 'video' ? (
                    <video
                      key={active.src}
                      className="product-detail__video"
                      src={active.src}
                      controls
                      playsInline
                      preload="metadata"
                      poster={active.poster || undefined}
                    />
                  ) : (
                    <Image
                      src={active?.src || product.image}
                      alt={product.name}
                      width={900}
                      height={900}
                      priority
                      sizes="(max-width:860px) 100vw, 540px"
                    />
                  )}
                </div>

                {showThumbs ? (
                  <div className="product-detail__thumbs" role="list" aria-label="Product media">
                    {mediaItems.map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        role="listitem"
                        className={`product-detail__thumb ${
                          active?.key === item.key ? 'is-active' : ''
                        } ${item.type === 'video' ? 'product-detail__thumb--video' : ''}`}
                        onClick={() => setActiveKey(item.key)}
                        aria-label={
                          item.type === 'video'
                            ? 'Play product video'
                            : `View image ${(item.index ?? 0) + 1}`
                        }
                        aria-current={active?.key === item.key ? 'true' : undefined}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.type === 'video' ? item.poster || gallery[0] : item.src}
                          alt=""
                        />
                        {item.type === 'video' ? (
                          <span className="product-detail__thumb-play" aria-hidden="true">
                            ▶
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
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
