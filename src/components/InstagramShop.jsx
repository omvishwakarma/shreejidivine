'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { SITE_NAME, SOCIAL } from '../lib/site'
import { formatINR } from '../lib/products'
import './InstagramShop.css'

function ShopVideo({ src, poster, label }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !src) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const play = el.play()
          if (play?.catch) play.catch(() => {})
        } else {
          el.pause()
        }
      },
      { threshold: 0.35 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [src])

  return (
    <video
      ref={ref}
      className="ig-shop__video"
      src={src}
      poster={poster || undefined}
      muted
      loop
      playsInline
      autoPlay
      preload="metadata"
      aria-label={label}
    />
  )
}

const DEFAULT_COPY = {
  eyebrow: 'Smoke-Free · Handmade in India · Gift Ready · A Fragrance of Divinity',
  title: 'Pure for Your Home.',
  subtitle: 'Shop the look on Instagram',
}

export default function InstagramShop({ compact = false }) {
  const [looks, setLooks] = useState([])
  const [copy, setCopy] = useState(DEFAULT_COPY)
  const [loading, setLoading] = useState(true)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)
  const railRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/instagram/shop')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        setCopy({
          eyebrow: data.eyebrow ?? DEFAULT_COPY.eyebrow,
          title: data.title ?? DEFAULT_COPY.title,
          subtitle: data.subtitle ?? DEFAULT_COPY.subtitle,
        })
        if (data.enabled === false) {
          setLooks([])
          return
        }
        setLooks(Array.isArray(data.looks) ? data.looks : [])
      })
      .catch(() => {
        if (!cancelled) setLooks([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const el = railRef.current
    if (!el) return undefined
    const sync = () => {
      const cards = el.querySelectorAll('.ig-shop__card')
      const rail = el.getBoundingClientRect()
      const first = cards[0]?.getBoundingClientRect()
      const last = cards[cards.length - 1]?.getBoundingClientRect()
      setCanPrev(Boolean(first && first.left < rail.left - 12))
      setCanNext(Boolean(last && last.right > rail.right + 12))
    }
    sync()
    const frame = requestAnimationFrame(sync)
    const observer = new ResizeObserver(sync)
    observer.observe(el)
    el.addEventListener('scroll', sync, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      el.removeEventListener('scroll', sync)
    }
  }, [looks, loading])

  function scrollBy(dir) {
    const el = railRef.current
    if (!el) return
    const card = el.querySelector('.ig-shop__card')
    const gap = parseFloat(getComputedStyle(el).columnGap || getComputedStyle(el).gap) || 0
    const amount = card ? card.getBoundingClientRect().width + gap : el.clientWidth * 0.8
    el.scrollBy({ left: dir * amount, behavior: 'smooth' })
  }

  if (!loading && looks.length === 0) return null

  const eyebrow = String(copy.eyebrow || '').trim()
  const title = String(copy.title || '').trim()
  const subtitle = String(copy.subtitle || '').trim()
  const hasBanner = Boolean(eyebrow || title || subtitle)
  const headingId = compact ? 'ig-shop-heading-compact' : 'ig-shop-heading'

  return (
    <section
      className={`ig-shop${compact ? ' ig-shop--compact' : ''}${hasBanner ? '' : ' ig-shop--plain'}`}
      aria-labelledby={(compact ? subtitle : title) ? headingId : undefined}
      aria-label={(compact ? subtitle : title) ? undefined : 'Shop the look on Instagram'}
    >
      {compact ? (
        subtitle || looks.length > 2 || loading ? (
          <div className="ig-shop__compact-head">
            {subtitle ? (
              <h2 id={headingId} className="ig-shop__compact-title">
                {subtitle}
              </h2>
            ) : null}
            {canPrev || canNext ? (
            <div className="ig-shop__compact-nav">
              <button
                type="button"
                className="ig-shop__compact-arrow"
                aria-label="Previous"
                disabled={!canPrev}
                onClick={() => scrollBy(-1)}
              >
                ‹
              </button>
              <button
                type="button"
                className="ig-shop__compact-arrow"
                aria-label="Next"
                disabled={!canNext}
                onClick={() => scrollBy(1)}
              >
                ›
              </button>
            </div>
          ) : null}
          </div>
        ) : null
      ) : hasBanner ? (
        <div className="ig-shop__banner">
          <div className="container">
            {eyebrow ? <p className="ig-shop__values">{eyebrow}</p> : null}
            {title ? (
              <h2 id={headingId} className="ig-shop__title">
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className="ig-shop__subtitle">
                <span className="ig-shop__flourish" aria-hidden="true" />
                {subtitle}
                <span className="ig-shop__flourish" aria-hidden="true" />
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="ig-shop__stage">
        {!compact ? (
          <>
            <button
              type="button"
              className="ig-shop__nav ig-shop__nav--prev"
              aria-label="Previous"
              disabled={!canPrev}
              onClick={() => scrollBy(-1)}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M10.2 3.2 5.4 8l4.8 4.8" />
              </svg>
            </button>
            <button
              type="button"
              className="ig-shop__nav ig-shop__nav--next"
              aria-label="Next"
              disabled={!canNext}
              onClick={() => scrollBy(1)}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M5.8 3.2 10.6 8l-4.8 4.8" />
              </svg>
            </button>
          </>
        ) : null}

        <div className="ig-shop__rail" ref={railRef}>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="ig-shop__card ig-shop__card--skel" aria-hidden="true" />
              ))
            : looks.map((look) => {
                const product = look.product
                const label = `Instagram look featuring ${product?.name || SITE_NAME}`
                return (
                  <article key={look.id} className="ig-shop__card">
                    {product?.slug ? (
                      <Link href={`/shop/${product.slug}`} className="ig-shop__media" aria-label={label}>
                        {look.badge ? <span className="ig-shop__badge">{look.badge}</span> : null}
                        {look.videoUrl ? (
                          <ShopVideo
                            src={look.videoUrl}
                            poster={look.thumbnail || product?.image}
                            label={label}
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={look.thumbnail || product?.image || '/images/aroma-variants.png'}
                            alt=""
                            loading="lazy"
                          />
                        )}
                      </Link>
                    ) : (
                      <div className="ig-shop__media">
                        {look.badge ? <span className="ig-shop__badge">{look.badge}</span> : null}
                        {look.videoUrl ? (
                          <ShopVideo
                            src={look.videoUrl}
                            poster={look.thumbnail || product?.image}
                            label={label}
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={look.thumbnail || product?.image || '/images/aroma-variants.png'}
                            alt=""
                            loading="lazy"
                          />
                        )}
                      </div>
                    )}

                    {product ? (
                      <Link href={`/shop/${product.slug}`} className="ig-shop__product">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={product.image} alt="" className="ig-shop__product-thumb" />
                        <span className="ig-shop__product-body">
                          <span className="ig-shop__product-name">{product.name}</span>
                          <span className="ig-shop__product-brand">
                            {SITE_NAME} <span aria-hidden="true">→</span>
                          </span>
                          <span className="ig-shop__product-price">
                            {product.compareAt ? <s>{formatINR(product.compareAt)}</s> : null}
                            <strong>{formatINR(product.price)}</strong>
                          </span>
                        </span>
                      </Link>
                    ) : null}
                  </article>
                )
              })}
        </div>
      </div>

      <div className={`ig-shop__foot${compact ? '' : ' container'}`}>
        <a
          href={SOCIAL.instagram || 'https://www.instagram.com/'}
          className="btn btn-ink"
          target="_blank"
          rel="noopener noreferrer"
        >
          Follow {SOCIAL.instagramHandle || '@shreejidivine.co'}
        </a>
      </div>
    </section>
  )
}
