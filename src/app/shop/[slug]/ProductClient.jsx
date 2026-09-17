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
import {
  looksLikeHtml,
  plainTextToHtml,
  sanitizeProductHtml,
} from '../../../lib/productHtml'
import { resolveVariantImage, resolveVariantPrice } from '../../../lib/productVariants'
import '../../ecom.css'
import './product.css'

export default function ProductClient() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [error, setError] = useState('')
  const [activeKey, setActiveKey] = useState('img-0')
  const [colour, setColour] = useState('')
  const [fragrance, setFragrance] = useState('')

  useEffect(() => {
    if (!slug) return
    api(`/api/products/${slug}`)
      .then((d) => {
        setProduct(d.product)
        setActiveKey('img-0')
        const colours = d.product?.colours || []
        const fragrances = d.product?.fragrances || []
        setColour(colours[0]?.name || '')
        setFragrance(fragrances[0]?.name || '')
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

  const colours = product?.colours || []
  const fragrances = product?.fragrances || []
  const unitPrice = product ? resolveVariantPrice(product, fragrance) : 0
  const variantImage = product
    ? resolveVariantImage(product, colour, fragrance)
    : ''
  const mainImage = variantImage || active?.src || product?.image || ''
  const canAdd =
    (!colours.length || Boolean(colour)) && (!fragrances.length || Boolean(fragrance))
  const showingVariantImage = Boolean(
    variantImage && variantImage !== (gallery[0] || product?.image)
  )

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
                  {active?.type === 'video' && !showingVariantImage ? (
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
                      key={mainImage}
                      src={mainImage}
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
                <strong>{formatINR(unitPrice)}</strong>
                {product.compareAt && !fragrances.length ? (
                  <s>{formatINR(product.compareAt)}</s>
                ) : null}
              </div>

              {colours.length || fragrances.length ? (
                <div className="product-detail__variants">
                  {colours.length ? (
                    <div className="product-detail__options">
                      <p className="product-detail__options-label">
                        Choose colour
                        {colour ? <span> — {colour}</span> : null}
                      </p>
                      <div className="product-detail__swatches" role="list">
                        {colours.map((c) => (
                          <button
                            key={c.name}
                            type="button"
                            role="listitem"
                            className={`product-detail__swatch ${
                              colour === c.name ? 'is-active' : ''
                            } ${c.image ? 'has-image' : ''}`}
                            onClick={() => {
                              setColour(c.name)
                              setActiveKey('img-0')
                            }}
                            title={c.name}
                          >
                            {c.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={c.image} alt="" className="product-detail__swatch-img" />
                            ) : c.hex ? (
                              <span
                                className="product-detail__swatch-dot"
                                style={{ background: c.hex }}
                                aria-hidden="true"
                              />
                            ) : null}
                            <span>{c.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {fragrances.length ? (
                    <div className="product-detail__options">
                      <p className="product-detail__options-label">
                        Choose fragrance
                        {fragrance ? <span> — {fragrance}</span> : null}
                      </p>
                      <div className="product-detail__fragrances" role="list">
                        {fragrances.map((f) => (
                          <button
                            key={f.name}
                            type="button"
                            role="listitem"
                            className={`product-detail__fragrance ${
                              fragrance === f.name ? 'is-active' : ''
                            }`}
                            onClick={() => {
                              setFragrance(f.name)
                              setActiveKey('img-0')
                            }}
                          >
                            {f.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={f.image} alt="" className="product-detail__fragrance-img" />
                            ) : null}
                            <span className="product-detail__fragrance-meta">
                              <span>{f.name}</span>
                              <strong>{formatINR(f.price)}</strong>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div
                className="ecom-lead product-detail__description"
                style={{ marginTop: '1rem' }}
                dangerouslySetInnerHTML={{
                  __html: sanitizeProductHtml(
                    looksLikeHtml(product.description)
                      ? product.description
                      : plainTextToHtml(product.description)
                  ),
                }}
              />
              <ul className="product-detail__highlights">
                {(product.highlights || []).map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
              <div className="product-detail__cta">
                <AddToCartButton
                  product={product}
                  label="Add to Cart"
                  className="btn-full"
                  colour={colour}
                  fragrance={fragrance}
                  requireVariants={false}
                  disabled={!canAdd}
                />
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
