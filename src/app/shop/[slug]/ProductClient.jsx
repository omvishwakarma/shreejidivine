'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import ShopNav from '../../../components/ShopNav'
import Footer from '../../../components/Footer'
import AddToCartButton from '../../../components/AddToCartButton'
import BuyNowButton from '../../../components/BuyNowButton'
import InstagramShop from '../../../components/InstagramShop'
import { api, getToken } from '../../../lib/api'
import { useAuth } from '../../../context/AuthContext'
import { formatINR, toTitleCase } from '../../../lib/products'
import { safePublicImage, safePublicMedia } from '../../../lib/media'
import {
  looksLikeHtml,
  plainTextToHtml,
  sanitizeProductHtml,
} from '../../../lib/productHtml'
import { resolveVariantImage, resolveVariantPrice } from '../../../lib/productVariants'
import '../../ecom.css'
import './product.css'

function reviewAverage(reviews) {
  if (!reviews?.length) return 0
  const total = reviews.reduce((sum, review) => sum + (Number(review.stars) || 0), 0)
  return total / reviews.length
}

function Stars({ value }) {
  const filled = Math.round(Number(value) || 0)
  return (
    <span className="product-reviews__stars" aria-label={`${filled} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= filled ? 'is-on' : undefined} aria-hidden="true">
          ★
        </span>
      ))}
    </span>
  )
}

export default function ProductClient() {
  const { slug } = useParams()
  const { user } = useAuth()
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewSending, setReviewSending] = useState(false)
  const [reviewNote, setReviewNote] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [reviewDraft, setReviewDraft] = useState({
    name: '',
    stars: 5,
    text: '',
    instagram: '',
    images: [],
    video: null,
  })
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [error, setError] = useState('')
  const [activeKey, setActiveKey] = useState('img-0')
  const [colour, setColour] = useState('')
  const [fragrance, setFragrance] = useState('')
  /** When true, gallery thumb wins over variant image */
  const [galleryFocus, setGalleryFocus] = useState(true)
  const touchStartX = useRef(null)
  const relatedRailRef = useRef(null)

  useEffect(() => {
    if (!slug) return
    setRelated([])
    api(`/api/products/${slug}`)
      .then((d) => {
        setProduct(d.product)
        setActiveKey('img-0')
        setGalleryFocus(true)
        const colours = d.product?.colours || []
        const fragrances = d.product?.fragrances || []
        setColour(colours[0]?.name || '')
        setFragrance(fragrances[0]?.name || '')
      })
      .catch((err) => setError(err.message))
  }, [slug])

  useEffect(() => {
    if (!product?.id) return
    const category = product.categorySlug || product.subcategorySlug || ''
    if (!category) {
      setRelated([])
      return
    }

    let cancelled = false
    api(`/api/products?category=${encodeURIComponent(category)}`)
      .then((d) => {
        if (cancelled) return
        const list = (d.products || [])
          .filter((p) => p.id !== product.id && p.slug !== product.slug)
          .slice(0, 12)
        setRelated(list)
      })
      .catch(() => {
        if (!cancelled) setRelated([])
      })

    return () => {
      cancelled = true
    }
  }, [product])

  function scrollRelated(dir) {
    const el = relatedRailRef.current
    if (!el) return
    const step = Math.min(320, el.clientWidth * 0.75)
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  async function submitReview(e) {
    e.preventDefault()
    if (!slug) return
    setReviewError('')
    setReviewNote('')
    setReviewSending(true)
    try {
      const body = new FormData()
      body.append('name', reviewDraft.name || user?.name || '')
      body.append('stars', String(reviewDraft.stars || 5))
      body.append('text', reviewDraft.text || '')
      body.append('instagram', reviewDraft.instagram || '')
      for (const file of reviewDraft.images || []) body.append('images', file)
      if (reviewDraft.video) body.append('video', reviewDraft.video)
      const headers = {}
      const token = getToken()
      if (token) headers.Authorization = `Bearer ${token}`
      const res = await fetch(`/api/products/${slug}/reviews`, { method: 'POST', headers, body })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not save review')
      setReviewNote('Thanks. Your review will show on the site after we approve it.')
      setReviewDraft({
        name: user?.name || '',
        stars: 5,
        text: '',
        instagram: '',
        images: [],
        video: null,
      })
    } catch (err) {
      setReviewError(err.message || 'Could not save review')
    } finally {
      setReviewSending(false)
    }
  }

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
  const activeIndex = Math.max(
    0,
    mediaItems.findIndex((item) => item.key === activeKey)
  )
  const active = mediaItems[activeIndex] || mediaItems[0] || null

  const colours = product?.colours || []
  const fragrances = product?.fragrances || []
  const unitPrice = product ? resolveVariantPrice(product, fragrance) : 0
  const variantImage = product ? resolveVariantImage(product, colour, fragrance) : ''
  const canAdd =
    (!colours.length || Boolean(colour)) && (!fragrances.length || Boolean(fragrance))

  const showVideo = active?.type === 'video' && galleryFocus
  const mainImage = showVideo
    ? ''
    : galleryFocus && active?.type === 'image' && active?.src
      ? active.src
      : variantImage || active?.src || product?.image || ''

  function selectGalleryItem(key) {
    setActiveKey(key)
    setGalleryFocus(true)
  }

  function slideBy(delta) {
    if (mediaItems.length < 2) return
    const next = (activeIndex + delta + mediaItems.length) % mediaItems.length
    selectGalleryItem(mediaItems[next].key)
  }

  function onMediaTouchStart(e) {
    touchStartX.current = e.changedTouches?.[0]?.clientX ?? null
  }

  function onMediaTouchEnd(e) {
    if (touchStartX.current == null || mediaItems.length < 2) return
    const endX = e.changedTouches?.[0]?.clientX
    if (endX == null) return
    const diff = endX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(diff) < 40) return
    slideBy(diff < 0 ? 1 : -1)
  }

  function selectColour(name) {
    setColour(name)
    const next = colours.find((c) => c.name === name)
    if (next?.image) {
      setGalleryFocus(false)
      setActiveKey('img-0')
    }
  }

  function selectFragrance(name) {
    setFragrance(name)
    const next = fragrances.find((f) => f.name === name)
    if (next?.image) {
      setGalleryFocus(false)
      setActiveKey('img-0')
    }
  }

  return (
    <div className="ecom-page">
      <ShopNav />
      <div className="ecom-wrap product-detail">
        <p className="breadcrumb">
          <Link href="/shop">Shop</Link>
          <span aria-hidden="true"> / </span>
          {product?.name ? toTitleCase(product.name) : 'Product'}
        </p>

        {error ? <div className="empty-state">{error}</div> : null}
        {!product && !error ? (
          <div className="product-detail__grid product-detail__skel" aria-busy="true" aria-label="Loading product">
            <div className="product-detail__gallery">
              <div className="skel product-detail__skel-media" />
              <div className="product-detail__skel-thumbs">
                <span className="skel" />
                <span className="skel" />
                <span className="skel" />
                <span className="skel" />
              </div>
            </div>
            <div className="product-detail__info product-detail__skel-copy">
              <span className="skel product-detail__skel-line product-detail__skel-line--title" />
              <span className="skel product-detail__skel-line product-detail__skel-line--price" />
              <span className="skel product-detail__skel-line" />
              <span className="skel product-detail__skel-line product-detail__skel-line--short" />
              <span className="skel product-detail__skel-btn" />
              <span className="skel product-detail__skel-btn" />
            </div>
          </div>
        ) : null}

        {product ? (
          <div className="product-detail__grid">
            <div className="product-detail__gallery">
              <div className="product-detail__stage">
                <div
                  className="product-detail__media"
                  onTouchStart={onMediaTouchStart}
                  onTouchEnd={onMediaTouchEnd}
                >
                  {product.badge ? <span className="product-card__badge">{product.badge}</span> : null}
                  {showVideo ? (
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

                  {showThumbs ? (
                    <>
                      <div className="product-detail__dots" role="tablist" aria-label="Gallery slides">
                        {mediaItems.map((item, index) => (
                          <button
                            key={item.key}
                            type="button"
                            role="tab"
                            aria-selected={galleryFocus && activeIndex === index}
                            className={`product-detail__dot ${
                              galleryFocus && activeIndex === index ? 'is-active' : ''
                            }`}
                            onClick={() => selectGalleryItem(item.key)}
                            aria-label={`Go to media ${index + 1}`}
                          />
                        ))}
                      </div>
                      <p className="product-detail__counter">
                        {activeIndex + 1} / {mediaItems.length}
                      </p>
                    </>
                  ) : null}
                </div>

                {showThumbs ? (
                  <div className="product-detail__thumbs" role="list" aria-label="Product media">
                    {mediaItems.map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        role="listitem"
                        className={`product-detail__thumb ${
                          galleryFocus && active?.key === item.key ? 'is-active' : ''
                        } ${item.type === 'video' ? 'product-detail__thumb--video' : ''}`}
                        onClick={() => selectGalleryItem(item.key)}
                        aria-label={
                          item.type === 'video'
                            ? 'Play product video'
                            : `View image ${(item.index ?? 0) + 1}`
                        }
                        aria-current={
                          galleryFocus && active?.key === item.key ? 'true' : undefined
                        }
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
              <h1 className="ecom-title">{toTitleCase(product.name)}</h1>
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
                            onClick={() => selectColour(c.name)}
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
                            onClick={() => selectFragrance(f.name)}
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
              <section className="product-reviews" aria-label="Reviews">
                <div className="product-reviews__head">
                  <h2>Reviews</h2>
                  {(product.reviews || []).length ? (
                    <p>
                      <Stars value={reviewAverage(product.reviews)} />
                      <span>
                        {reviewAverage(product.reviews).toFixed(1)} · {product.reviews.length}{' '}
                        {product.reviews.length === 1 ? 'review' : 'reviews'}
                      </span>
                    </p>
                  ) : (
                    <p>No reviews yet.</p>
                  )}
                  {user ? (
                    <button
                      type="button"
                      className="btn-sm btn-primary product-reviews__write"
                      onClick={() => {
                        setReviewOpen((open) => !open)
                        setReviewDraft((draft) => ({
                          ...draft,
                          name: draft.name || user.name || '',
                        }))
                        setReviewNote('')
                        setReviewError('')
                      }}
                    >
                      Write a review
                    </button>
                  ) : (
                    <Link
                      href={`/login?next=${encodeURIComponent(`/shop/${slug}`)}`}
                      className="btn-sm btn-primary product-reviews__write"
                    >
                      Write a review
                    </Link>
                  )}
                </div>
                {reviewOpen && user ? (
                  <form className="product-reviews__form" onSubmit={submitReview}>
                    <label>
                      <span>Name</span>
                      <input
                        value={reviewDraft.name}
                        onChange={(e) => setReviewDraft((draft) => ({ ...draft, name: e.target.value }))}
                      />
                    </label>
                    <div className="product-reviews__pick">
                      <span>Stars</span>
                      <span className="product-reviews__stars">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            className={n <= reviewDraft.stars ? 'is-on' : undefined}
                            onClick={() => setReviewDraft((draft) => ({ ...draft, stars: n }))}
                            aria-label={`${n} stars`}
                          >
                            ★
                          </button>
                        ))}
                      </span>
                    </div>
                    <label>
                      <span>Review</span>
                      <textarea
                        rows={4}
                        value={reviewDraft.text}
                        onChange={(e) => setReviewDraft((draft) => ({ ...draft, text: e.target.value }))}
                        placeholder="How was the bracelet?"
                      />
                    </label>
                    <label>
                      <span>Instagram link</span>
                      <input
                        value={reviewDraft.instagram}
                        onChange={(e) => setReviewDraft((draft) => ({ ...draft, instagram: e.target.value }))}
                        placeholder="https://www.instagram.com/reel/..."
                      />
                    </label>
                    <label>
                      <span>Photos</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        multiple
                        onChange={(e) =>
                          setReviewDraft((draft) => ({
                            ...draft,
                            images: Array.from(e.target.files || []).slice(0, 4),
                          }))
                        }
                      />
                    </label>
                    <label>
                      <span>Video</span>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        onChange={(e) =>
                          setReviewDraft((draft) => ({ ...draft, video: e.target.files?.[0] || null }))
                        }
                      />
                    </label>
                    {reviewError ? <p className="product-reviews__error">{reviewError}</p> : null}
                    {reviewNote ? <p className="product-reviews__note">{reviewNote}</p> : null}
                    <button type="submit" className="btn-sm btn-primary" disabled={reviewSending}>
                      {reviewSending ? 'Sending…' : 'Submit review'}
                    </button>
                  </form>
                ) : null}
                {(product.reviews || []).length ? (
                  <ul className="product-reviews__list">
                    {product.reviews.map((review, index) => (
                      <li key={review.id || `${review.name}-${index}`}>
                        <div className="product-reviews__top">
                          <strong>{review.name || 'Customer'}</strong>
                          <Stars value={review.stars} />
                        </div>
                        {review.text ? <p>{review.text}</p> : null}
                        {review.images?.length ? (
                          <div className="product-reviews__photos">
                            {review.images.map((src) => (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img key={src} src={src} alt="" />
                            ))}
                          </div>
                        ) : null}
                        {review.video ? (
                          <video className="product-reviews__video" src={review.video} controls playsInline />
                        ) : null}
                        {review.instagram ? (
                          <a
                            className="product-reviews__ig"
                            href={review.instagram}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View on Instagram
                          </a>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
              <p className="product-detail__note">
                Free pan-India shipping · Cash on delivery available
              </p>
            </div>
          </div>
        ) : null}

        {related.length > 0 ? (
          <section className="related-products" aria-labelledby="related-products-heading">
            <div className="related-products__head">
              <h2 id="related-products-heading" className="related-products__title">
                Related products
              </h2>
              {related.length > 2 ? (
                <div className="related-products__nav">
                  <button
                    type="button"
                    className="related-products__arrow"
                    onClick={() => scrollRelated(-1)}
                    aria-label="Previous related products"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="related-products__arrow"
                    onClick={() => scrollRelated(1)}
                    aria-label="Next related products"
                  >
                    ›
                  </button>
                </div>
              ) : null}
            </div>
            <div
              className="related-products__rail"
              ref={relatedRailRef}
              role="region"
              aria-label="Related products"
            >
              <div className="related-products__track">
                {related.map((p) => (
                  <article key={p.id} className="product-card related-products__card">
                    <Link href={`/shop/${p.slug}`} className="product-card__media">
                      {p.badge ? <span className="product-card__badge">{p.badge}</span> : null}
                      <Image
                        src={p.image}
                        alt={p.name}
                        width={700}
                        height={875}
                        sizes="(max-width:560px) 42vw, 220px"
                      />
                    </Link>
                    <div className="product-card__body">
                      <Link href={`/shop/${p.slug}`}>
                        <h3 className="product-card__name">{toTitleCase(p.name)}</h3>
                      </Link>
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
            </div>
          </section>
        ) : null}

        {product ? <InstagramShop compact /> : null}
      </div>

      {product ? (
        <div className="product-detail__bar">
          <div className="product-detail__bar-info">
            <span className="product-detail__bar-name">{toTitleCase(product.name)}</span>
            <strong className="product-detail__bar-price">{formatINR(unitPrice)}</strong>
          </div>
          <div className="product-detail__bar-actions">
            <AddToCartButton
              product={product}
              label="Add to Cart"
              className="product-detail__bar-cart-btn"
              colour={colour}
              fragrance={fragrance}
              requireVariants={false}
              disabled={!canAdd}
            />
            <BuyNowButton
              product={product}
              colour={colour}
              fragrance={fragrance}
              disabled={!canAdd}
            />
          </div>
        </div>
      ) : null}

      <Footer />
    </div>
  )
}
