'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import ProductCard from './ProductCard'
import { api } from '../lib/api'
import '../app/ecom.css'
import './BestSellers.css'

function Diya({ flip = false }) {
  return (
    <span className={`diwali-offer__diya${flip ? ' diwali-offer__diya--flip' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 48 48" fill="none">
        <path d="M10 28c0-6 6.2-10 14-10s14 4 14 10c0 5.2-6 9-14 9s-14-3.8-14-9Z" fill="#f4a03c" />
        <path
          d="M14 29.5c.4 3.2 4.4 5.5 10 5.5s9.6-2.3 10-5.5"
          stroke="#c45c1a"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M24 18c1.2-3.2 1-6.4-.2-9.2 2.6 1.2 4.4 3.6 4.8 6.4-1.2.6-2.8 1.6-4.6 2.8Z"
          fill="#ffb020"
        />
        <path d="M24 17.2c-.2-2.6.6-5.2 2-7.4" stroke="#fff4d6" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </span>
  )
}

export default function BestSellers({
  id = 'products',
  headingId = 'best-sellers-heading',
  endpoint = '/api/products?best=1',
  copyKey = 'bestSellers',
  ariaLabel = 'Best sellers products',
  sectionClass = '',
  festive = false,
  sortProducts,
  fallbackCopy = {
    label: 'Customer favourites',
    title: 'Best Sellers',
    lead: 'Most-loved aroma stones and oils — ready for home rituals and gifting.',
  },
}) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)
  const railRef = useRef(null)
  const [copy, setCopy] = useState(fallbackCopy)

  useEffect(() => {
    if (!copyKey) return undefined
    fetch('/api/homepage')
      .then((r) => r.json())
      .then((d) => {
        if (d?.[copyKey]) setCopy(d[copyKey])
      })
      .catch(() => {})
    return undefined
  }, [copyKey])

  useEffect(() => {
    api(endpoint)
      .then((d) => {
        const list = d.products || []
        setProducts(typeof sortProducts === 'function' ? sortProducts(list) : list)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [endpoint, sortProducts])

  useEffect(() => {
    const el = railRef.current
    if (!el) return undefined
    const sync = () => {
      const cards = el.querySelectorAll('.product-card')
      const rail = el.getBoundingClientRect()
      const first = cards[0]?.getBoundingClientRect()
      const last = cards[cards.length - 1]?.getBoundingClientRect()
      setCanPrev(Boolean(first && first.left < rail.left - 12))
      setCanNext(Boolean(last && last.right > rail.right + 12))
      const media = el.querySelector('.product-card__media')
      const stage = el.parentElement
      if (media && stage) {
        const center =
          media.getBoundingClientRect().top -
          stage.getBoundingClientRect().top +
          media.getBoundingClientRect().height / 2
        stage.style.setProperty('--bs-arrow-top', `${center}px`)
      }
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
  }, [products, loading])

  function scrollByDir(dir) {
    const el = railRef.current
    if (!el) return
    const card = el.querySelector('.product-card')
    const styles = getComputedStyle(el.querySelector('.best-sellers__grid') || el)
    const gap = parseFloat(styles.columnGap || styles.gap) || 0
    const amount = card ? card.getBoundingClientRect().width + gap : el.clientWidth * 0.8
    el.scrollBy({ left: dir * amount, behavior: 'smooth' })
  }

  return (
    <section
      className={`best-sellers${sectionClass ? ` ${sectionClass}` : ''}`}
      id={id}
      aria-labelledby={headingId}
    >
      <div className="container">
        <div className="best-sellers__head reveal">
          {copy.label ? <p className="section-label">{copy.label}</p> : null}
          <h2 id={headingId} className="section-title">
            {festive ? <Diya /> : null}
            {copy.title}
            {festive ? <Diya flip /> : null}
          </h2>
          {copy.lead ? <p className="section-lead">{copy.lead}</p> : null}
        </div>

        {error ? (
          <p className="best-sellers__error">Could not load products.</p>
        ) : loading || products.length > 0 ? (
          <div className="best-sellers__stage">
            <button
              type="button"
              className="best-sellers__nav best-sellers__nav--prev"
              aria-label="Previous"
              disabled={!canPrev}
              onClick={() => scrollByDir(-1)}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M10.2 3.2 5.4 8l4.8 4.8" />
              </svg>
            </button>
            <button
              type="button"
              className="best-sellers__nav best-sellers__nav--next"
              aria-label="Next"
              disabled={!canNext}
              onClick={() => scrollByDir(1)}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M5.8 3.2 10.6 8l-4.8 4.8" />
              </svg>
            </button>
            <div
              className="best-sellers__rail"
              ref={railRef}
              role="region"
              aria-label={ariaLabel}
            >
            <div className="best-sellers__grid">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <article key={i} className="product-card product-card--skel" aria-hidden="true">
                      <div className="product-card__media product-card__skel-block" />
                      <div className="product-card__body">
                        <span className="product-card__skel-line product-card__skel-line--name" />
                        <span className="product-card__skel-line product-card__skel-line--price" />
                        <span className="product-card__skel-line product-card__skel-line--btn" />
                      </div>
                    </article>
                  ))
                : products.map((p, i) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      heading="h3"
                      className={`reveal reveal-delay-${(i % 4) + 1}`}
                    />
                  ))}
            </div>
            </div>
          </div>
        ) : null}

        <div className="best-sellers__cta reveal">
          <Link href="/shop" className="btn">
            View all
          </Link>
        </div>
      </div>
    </section>
  )
}
