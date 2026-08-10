import Link from 'next/link'
import { SITE_NAME, SITE_TAGLINE } from '../lib/site'
import './BrandBanner.css'

export default function BrandBanner() {
  return (
    <section className="brand-banner" aria-labelledby="brand-banner-heading">
      <div className="brand-banner__content reveal">
        <p className="brand-banner__eyebrow">Bringing stillness home</p>
        <h2 id="brand-banner-heading">{SITE_NAME}</h2>
        <p className="brand-banner__tag">{SITE_TAGLINE}</p>
        <Link href="/shop" className="btn btn-light">
          Shop Now
        </Link>
      </div>
    </section>
  )
}
