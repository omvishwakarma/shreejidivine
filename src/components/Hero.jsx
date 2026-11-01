'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { SITE_NAME, SITE_TAGLINE } from '../lib/site'
import { isBlobSrc, storeImageSrc } from '../lib/storeImage'
import './Hero.css'

const FALLBACK = {
  poster: '/images/banners/royal-chandan.png',
  posterMobile: '/images/banners/royal-chandan.png',
  imagesDesktop: [],
  imagesMobile: [],
  headline: SITE_TAGLINE,
  ctaText: 'Shop Now',
  ctaHref: '/shop',
  brand: SITE_NAME,
}

const MOBILE_MQ = '(max-width: 860px)'

export default function Hero({ initialHero = null }) {
  const [hero, setHero] = useState(initialHero || FALLBACK)
  const [isMobile, setIsMobile] = useState(false)
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    if (initialHero) {
      setHero(initialHero)
      return undefined
    }
    let cancelled = false
    fetch('/api/hero')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data) {
          setHero({
            poster: data.poster || FALLBACK.poster,
            posterMobile: data.posterMobile || data.poster || FALLBACK.posterMobile,
            imagesDesktop: Array.isArray(data.imagesDesktop) ? data.imagesDesktop : [],
            imagesMobile: Array.isArray(data.imagesMobile) ? data.imagesMobile : [],
            headline: data.headline || FALLBACK.headline,
            ctaText: data.ctaText || FALLBACK.ctaText,
            ctaHref: data.ctaHref || FALLBACK.ctaHref,
            brand: data.brand || FALLBACK.brand,
          })
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [initialHero])

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ)
    const apply = () => setIsMobile(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  const slides = isMobile ? hero.imagesMobile : hero.imagesDesktop
  const poster = isMobile ? hero.posterMobile || hero.poster : hero.poster
  const banners = slides.length
    ? slides
    : poster
      ? [{ src: poster, headline: hero.headline }]
      : []
  const activeSlide = slides.length ? slides[slide % slides.length] : banners[0] || null
  const bannerWidth = isMobile ? 900 : 1920

  useEffect(() => {
    setSlide(0)
  }, [isMobile, slides])

  const bannerCount = banners.length

  useEffect(() => {
    if (bannerCount < 2) return undefined
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return undefined
    const timer = window.setInterval(() => {
      setSlide((current) => (current + 1) % bannerCount)
    }, 4500)
    return () => window.clearInterval(timer)
  }, [bannerCount])

  return (
    <section className="hero" id="top" aria-label={`${SITE_NAME} — ${SITE_TAGLINE}`}>
      <h1 className="sr-only">
        {SITE_NAME} — Rudraksha, rashi bracelets, and certified Rudraksha only
      </h1>

      <div className="hero__stage">
        {banners.map((image, index) => {
          const src = storeImageSrc(image.src, bannerWidth)
          return (
            <div
              key={`${image.src}-${index}`}
              className={`hero__slide${index === slide % banners.length ? ' is-active' : ''}`}
            >
              <Image
                src={src}
                alt={image.headline || image.eyebrow || `${SITE_NAME} — ${SITE_TAGLINE}`}
                fill
                priority={index === 0}
                sizes="100vw"
                unoptimized={isBlobSrc(image.src)}
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
            </div>
          )
        })}
        {banners.length > 1 ? (
          <div className="hero__dots" role="tablist" aria-label="Banner slides">
            {banners.map((image, index) => (
              <button
                key={`${image.src}-${index}`}
                type="button"
                className={index === slide % banners.length ? 'is-active' : ''}
                aria-label={`Slide ${index + 1}`}
                onClick={() => setSlide(index)}
              />
            ))}
          </div>
        ) : null}

        <div className="hero__overlay">
          <p className="hero__eyebrow">{activeSlide?.eyebrow || hero.brand}</p>
          <p className="hero__headline">{activeSlide?.headline || hero.headline}</p>
          <Link href={activeSlide?.ctaHref || hero.ctaHref || '/shop'} className="hero__cta">
            {activeSlide?.ctaText || hero.ctaText || 'Shop Now'}
          </Link>
        </div>
      </div>
    </section>
  )
}
