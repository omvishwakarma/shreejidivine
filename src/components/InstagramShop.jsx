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

export default function InstagramShop() {
  const [looks, setLooks] = useState([])
  const [loading, setLoading] = useState(true)
  const railRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/instagram/shop')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
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

  function scrollBy(dir) {
    const el = railRef.current
    if (!el) return
    const amount = Math.min(340, el.clientWidth * 0.75)
    el.scrollBy({ left: dir * amount, behavior: 'smooth' })
  }

  if (!loading && looks.length === 0) return null

  return (
    <section className="ig-shop" aria-labelledby="ig-shop-heading">
      <div className="ig-shop__banner">
        <div className="container">
          <p className="ig-shop__values">
            Smoke-Free · Handmade in India · Gift Ready · A Fragrance of Divinity
          </p>
          <h2 id="ig-shop-heading" className="ig-shop__title">
            Pure for Your Home.
          </h2>
          <p className="ig-shop__subtitle">
            <span className="ig-shop__flourish" aria-hidden="true" />
            Shop the look on Instagram
            <span className="ig-shop__flourish" aria-hidden="true" />
          </p>
        </div>
      </div>

      <div className="ig-shop__stage">
        <button
          type="button"
          className="ig-shop__nav ig-shop__nav--prev"
          aria-label="Previous"
          onClick={() => scrollBy(-1)}
        >
          ‹
        </button>
        <button
          type="button"
          className="ig-shop__nav ig-shop__nav--next"
          aria-label="Next"
          onClick={() => scrollBy(1)}
        >
          ›
        </button>

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
                    <a
                      href={look.permalink}
                      className="ig-shop__media"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                    >
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
                    </a>

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

      <div className="container ig-shop__foot">
        <a
          href={SOCIAL.instagram || 'https://www.instagram.com/'}
          className="btn btn-ink"
          target="_blank"
          rel="noopener noreferrer"
        >
          Follow {SOCIAL.instagramHandle || '@shreejidivinearoma'}
        </a>
      </div>
    </section>
  )
}
