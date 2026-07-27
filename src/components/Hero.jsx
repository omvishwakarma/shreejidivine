'use client'

import Link from 'next/link'
import { SITE_NAME, SITE_TAGLINE } from '../lib/site'
import './Hero.css'

const HERO_VIDEO = '/videos/home.mp4'
const HERO_POSTER = '/images/banners/royal-chandan.png'

export default function Hero() {
  return (
    <section
      className="hero"
      id="top"
      aria-label={`${SITE_NAME} fragrance oils`}
    >
      <h1 className="sr-only">
        {SITE_NAME} — {SITE_TAGLINE} | Premium Fragrance Oils &amp; Aroma Stones
      </h1>

      <div className="hero__stage">
        <video
          className="hero__video"
          src={HERO_VIDEO}
          poster={HERO_POSTER}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        />
      </div>

      <Link href="/shop" className="hero__cta">
        Shop the collection
      </Link>
    </section>
  )
}
