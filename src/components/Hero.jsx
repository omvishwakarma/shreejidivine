import Image from 'next/image'
import BrandLogo from './BrandLogo'
import './Hero.css'

const usps = [
  {
    label: 'Long Lasting Fragrance',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
          d="M16 28c4.5-1.5 7-4.5 7-8.5 0-5-3.5-8-7-12-3.5 4-7 7-7 12 0 4 2.5 7 7 8.5z"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path d="M16 18v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Natural & Reusable',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
          d="M16 26V12M16 12c0-4 3-7 8-8-1 5-4 8-8 8zm0 0c0-4-3-7-8-8 1 5 4 8 8 8z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: 'Positive Energy',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="4.5" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M16 5v3M16 24v3M5 16h3M24 16h3M8.5 8.5l2 2M21.5 21.5l2 2M23.5 8.5l-2 2M10.5 21.5l-2 2"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: 'Premium Gift Pack',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect x="6" y="14" width="20" height="12" stroke="currentColor" strokeWidth="1.4" />
        <path d="M16 14v12M6 18h20" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M16 14c-2.5-4-6-4-6-1.5S13 14 16 14c2.5-4 6-4 6-1.5S19 14 16 14z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
]

const trust = [
  { label: 'Made with Natural Ingredients' },
  { label: 'Long Lasting Aroma' },
  { label: 'Premium Packaging' },
]

const assurances = [
  { label: 'Pan India Delivery' },
  { label: 'Safe & Secure Payment' },
  { label: 'Premium Quality Assured' },
]

export default function Hero() {
  return (
    <section className="hero" id="top" aria-label="Shreeji Divine Aroma Stone">
      <h1 className="sr-only">
        Shreeji Divine Aroma Stone — Ghar Par Mandir Ki Feeling | Premium Fragrance Stones &amp; Oils
      </h1>

      <div className="hero__banner">
        <Image
          src="/images/hero-banner.png"
          alt="Shreeji Divine Aroma Stone gift set with fragrance oils, carved stones, and premium packaging — Ghar Par Mandir Ki Feeling"
          width={1600}
          height={900}
          priority
          sizes="100vw"
          className="hero__banner-img"
        />
        <a href="#products" className="hero__banner-cta">
          Shop the Divine Experience
        </a>
      </div>

      <div className="hero__mobile">
        <div className="hero__mobile-photo">
          <Image
            src="/images/hero-banner.png"
            alt="Shreeji Divine Aroma Stone premium gift set with stones and oils"
            width={1200}
            height={800}
            priority
            sizes="100vw"
          />
        </div>

        <div className="hero__left">
          <div className="hero__brand">
            <BrandLogo height={110} />
          </div>

          <p className="hero__title">AROMA STONE</p>

          <p className="hero__tagline">
            <span className="hero__rule" aria-hidden="true" />
            Ghar Par Mandir Ki Feeling
            <span className="hero__rule" aria-hidden="true" />
          </p>

          <ul className="hero__usps">
            {usps.map((u) => (
              <li key={u.label}>
                <span className="hero__usp-icon">{u.icon}</span>
                <span>{u.label}</span>
              </li>
            ))}
          </ul>

          <a href="#products" className="hero__cta">
            Shop the Divine Experience
            <span aria-hidden="true">›</span>
          </a>
        </div>

        <div className="hero__bar">
          <div className="hero__bar-inner">
            <p className="hero__perfect">
              <strong>Perfect For:</strong> Home | Pooja Room | Office | Meditation
            </p>
            <ul className="hero__trust">
              {trust.map((t) => (
                <li key={t.label}>{t.label}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="hero__assure">
          <ul>
            {assurances.map((a) => (
              <li key={a.label}>{a.label}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
