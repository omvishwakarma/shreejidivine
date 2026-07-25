'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { SITE_NAME, SITE_TAGLINE } from '../lib/site'
import { HERO_BANNERS } from '../lib/campaign'
import './Hero.css'

export default function Hero() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const slide = HERO_BANNERS[active]

  useEffect(() => {
    if (paused) return undefined
    const id = setInterval(() => {
      setActive((i) => (i + 1) % HERO_BANNERS.length)
    }, 5500)
    return () => clearInterval(id)
  }, [paused])

  return (
    <section
      className="hero"
      id="top"
      aria-label={`${SITE_NAME} fragrance oils`}
      style={{ '--hero-tone': slide.tone }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <h1 className="sr-only">
        {SITE_NAME} — {SITE_TAGLINE} | Premium Fragrance Oils &amp; Aroma Stones
      </h1>

      <div className="hero__stage">
        {HERO_BANNERS.map((banner, i) => (
          <div
            key={banner.id}
            className={`hero__slide ${i === active ? 'is-active' : ''}`}
            aria-hidden={i !== active}
          >
            <Image
              src={banner.image}
              alt={`${banner.name} — ${banner.headline}`}
              width={1024}
              height={576}
              priority={i === 0}
              sizes="100vw"
              className="hero__slide-img"
            />
          </div>
        ))}
      </div>

      <Link href="/shop" className="hero__cta">
        Shop the collection
      </Link>

      <div className="hero__dots" role="tablist" aria-label="Hero banners">
        {HERO_BANNERS.map((banner, i) => (
          <button
            key={banner.id}
            type="button"
            role="tab"
            aria-label={banner.name}
            aria-selected={i === active}
            className={i === active ? 'is-active' : undefined}
            onClick={() => setActive(i)}
          />
        ))}
      </div>
    </section>
  )
}
