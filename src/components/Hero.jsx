'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { SITE_NAME, SITE_TAGLINE } from '../lib/site'
import { HERO_BANNERS } from '../lib/campaign'
import './Hero.css'

const HERO_VIDEO = '/videos/home.mp4'
const HERO_POSTER = '/images/banners/royal-chandan.png'

const SLIDES = [
  {
    id: 'video',
    type: 'video',
    name: SITE_NAME,
    headline: SITE_TAGLINE,
    cta: 'Shop Now',
    href: '/shop',
  },
  ...HERO_BANNERS.map((b) => ({
    id: b.id,
    type: 'image',
    name: b.name,
    headline: b.headline,
    image: b.image,
    cta: 'Shop Now',
    href: '/shop',
  })),
]

export default function Hero() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const slide = SLIDES[active]

  useEffect(() => {
    if (paused) return undefined
    const id = setInterval(() => {
      setActive((i) => (i + 1) % SLIDES.length)
    }, 6000)
    return () => clearInterval(id)
  }, [paused])

  return (
    <section
      className="hero"
      id="top"
      aria-label={`${SITE_NAME} fragrance oils`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <h1 className="sr-only">
        {SITE_NAME} — {SITE_TAGLINE} | Premium Fragrance Oils &amp; Aroma Stones
      </h1>

      <div className="hero__stage">
        {SLIDES.map((s, i) => (
          <div
            key={s.id}
            className={`hero__slide ${i === active ? 'is-active' : ''}`}
            aria-hidden={i !== active}
          >
            {s.type === 'video' ? (
              <video
                className="hero__video"
                src={HERO_VIDEO}
                poster={HERO_POSTER}
                autoPlay
                muted
                loop
                playsInline
                preload={i === 0 ? 'auto' : 'none'}
              />
            ) : (
              <Image
                src={s.image}
                alt={`${s.name} — ${s.headline}`}
                width={1600}
                height={900}
                priority={i === 1}
                sizes="100vw"
                className="hero__slide-img"
              />
            )}
          </div>
        ))}

        <div className="hero__overlay">
          <p className="hero__eyebrow">{slide.name}</p>
          <p className="hero__headline">{slide.headline}</p>
          <Link href={slide.href || '/shop'} className="hero__cta">
            {slide.cta || 'Shop Now'}
          </Link>
        </div>
      </div>

      <div className="hero__dots" role="tablist" aria-label="Hero banners">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-label={s.name}
            aria-selected={i === active}
            className={i === active ? 'is-active' : undefined}
            onClick={() => setActive(i)}
          />
        ))}
      </div>
    </section>
  )
}
