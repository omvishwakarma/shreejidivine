import { SITE_NAME, SITE_TAGLINE } from '../lib/site'
import './Purpose.css'

export default function Purpose() {
  return (
    <section className="purpose" id="purpose" aria-labelledby="purpose-heading">
      <div className="container purpose__inner">
        <h2 id="purpose-heading" className="section-title reveal">
          Buy Premium Aroma Stones &amp; Fragrance Oils | {SITE_NAME}
        </h2>
        <p className="purpose__tag reveal">{SITE_TAGLINE}</p>
        <div className="purpose__copy reveal reveal-delay-1">
          <p>
            Aroma stones · fragrance oils · ritual kits — crafted for smoke-free sacred ambience at
            home, pooja room, office, and gifting. Handmade in India with devotion.
          </p>
          <p>
            At {SITE_NAME}, we bring stillness and spiritual connection into modern living. Every
            creation is designed to transform ordinary moments into meaningful rituals — inspired by
            Bharat&apos;s timeless traditions of purity and intention.
          </p>
        </div>
      </div>
    </section>
  )
}
