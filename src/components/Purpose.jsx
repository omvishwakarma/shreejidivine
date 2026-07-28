import { SITE_NAME, SITE_TAGLINE } from '../lib/site'
import './Purpose.css'

export default function Purpose() {
  return (
    <section className="purpose" id="purpose" aria-labelledby="purpose-heading">
      <div className="container purpose__inner">
        <p className="section-label reveal">Our Purpose</p>
        <h2 id="purpose-heading" className="section-title reveal">
          {SITE_NAME}
        </h2>
        <p className="purpose__tag reveal">{SITE_TAGLINE}</p>
        <div className="purpose__copy reveal reveal-delay-1">
          <p>
            At {SITE_NAME}, we bring stillness, warmth, and spiritual connection into modern living.
            Every aroma stone and fragrance oil is crafted to turn ordinary moments into meaningful
            rituals — inspired by Bharat&apos;s timeless traditions of purity and devotion.
          </p>
          <p>
            Spirituality is not only found in temples. It lives in lighting fragrance after a long day,
            sitting in silence, or creating a peaceful corner at home. We exist to bring that feeling
            home — through scent, ritual, and mindful design.
          </p>
        </div>
      </div>
    </section>
  )
}
