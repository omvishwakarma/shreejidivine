'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { SITE_NAME, SITE_TAGLINE } from '../lib/site'
import './Hero.css'

const FALLBACK = {
  desktop: '/videos/home.mp4',
  mobile: '/videos/home.mp4',
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

export default function Hero() {
  const [hero, setHero] = useState(FALLBACK)
  const [isMobile, setIsMobile] = useState(false)
  const [slide, setSlide] = useState(0)
  const videoRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/hero')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data) {
          setHero({
            desktop: data.desktop || FALLBACK.desktop,
            mobile: data.mobile || FALLBACK.mobile,
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
  }, [])

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ)
    const apply = () => setIsMobile(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  const src = isMobile ? hero.mobile : hero.desktop
  const poster = isMobile ? hero.posterMobile || hero.poster : hero.poster
  const slides = isMobile ? hero.imagesMobile : hero.imagesDesktop
  const activeSlide = slides.length ? slides[slide % slides.length] : null

  useEffect(() => {
    setSlide(0)
  }, [isMobile, slides])

  useEffect(() => {
    if (slides.length < 2) return undefined
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return undefined
    const timer = window.setInterval(() => {
      setSlide((current) => (current + 1) % slides.length)
    }, 4500)
    return () => window.clearInterval(timer)
  }, [slides])

  useEffect(() => {
    const el = videoRef.current
    if (!el || slides.length) return
    el.load()
    const play = el.play()
    if (play?.catch) play.catch(() => {})
  }, [src, poster, slides.length])

  return (
    <section className="hero" id="top" aria-label={`${SITE_NAME} — ${SITE_TAGLINE}`}>
      <h1 className="sr-only">
        {SITE_NAME} — Rudraksha, rashi bracelets, and certified Rudraksha only
      </h1>

      <div className="hero__stage">
        {slides.length ? (
          slides.map((image, index) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={image.src}
              src={image.src}
              alt={image.headline || image.eyebrow || `${SITE_NAME} — ${SITE_TAGLINE}`}
              className={`hero__slide${index === slide % slides.length ? ' is-active' : ''}`}
            />
          ))
        ) : (
          <video
            key={`${src}-${poster}`}
            ref={videoRef}
            className="hero__video"
            src={src}
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        )}
        {slides.length > 1 ? (
          <div className="hero__dots" role="tablist" aria-label="Banner slides">
            {slides.map((image, index) => (
              <button
                key={image.src}
                type="button"
                className={index === slide % slides.length ? 'is-active' : ''}
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
