'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { SITE_NAME, SITE_TAGLINE } from '../lib/site'
import './Hero.css'

const FALLBACK = {
  desktop: '/videos/home.mp4',
  mobile: '/videos/home.mp4',
  poster: '/images/banners/royal-chandan.png',
  headline: SITE_TAGLINE,
  ctaText: 'Shop Now',
  ctaHref: '/shop',
  brand: SITE_NAME,
}

const MOBILE_MQ = '(max-width: 860px)'

export default function Hero() {
  const [hero, setHero] = useState(FALLBACK)
  const [isMobile, setIsMobile] = useState(false)
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

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    el.load()
    const play = el.play()
    if (play?.catch) play.catch(() => {})
  }, [src])

  return (
    <section className="hero" id="top" aria-label={`${SITE_NAME} fragrance oils`}>
      <h1 className="sr-only">
        {SITE_NAME} — {SITE_TAGLINE} | Premium Fragrance Oils &amp; Aroma Stones
      </h1>

      <div className="hero__stage">
        <video
          key={src}
          ref={videoRef}
          className="hero__video"
          src={src}
          poster={hero.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />

        <div className="hero__overlay">
          <p className="hero__eyebrow">{hero.brand}</p>
          <p className="hero__headline">{hero.headline}</p>
          <Link href={hero.ctaHref || '/shop'} className="hero__cta">
            {hero.ctaText || 'Shop Now'}
          </Link>
        </div>
      </div>
    </section>
  )
}
