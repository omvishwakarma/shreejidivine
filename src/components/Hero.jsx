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
    <section className="hero" id="top">
      {/* Full designed banner — desktop */}
      <div className="hero__banner">
        <img
          src="/images/hero-banner.png"
          alt="Shreeji Divine Aroma Stone — Ghar Par Mandir Ki Feeling. Premium gift set with fragrance oils and carved stones."
        />
        <a href="#products" className="hero__banner-cta">
          Shop the Divine Experience
        </a>
      </div>

      {/* Matching layout — mobile / small screens */}
      <div className="hero__mobile">
        <div className="hero__mobile-photo">
          <img
            src="/images/hero-banner.png"
            alt="Shreeji Divine Aroma Stone gift set"
          />
        </div>

        <div className="hero__left">
          <div className="hero__brand">
            <div className="hero__logo" aria-hidden="true">
              <svg viewBox="0 0 72 72" className="hero__lotus-svg">
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#e4c878" />
                    <stop offset="50%" stopColor="#c9a84c" />
                    <stop offset="100%" stopColor="#9a7b2f" />
                  </linearGradient>
                </defs>
                <circle cx="36" cy="36" r="34" fill="none" stroke="url(#goldGrad)" strokeWidth="1.2" />
                <path
                  d="M36 14c-2.5 7-9 11-9 18a9 9 0 0018 0c0-7-6.5-11-9-18z"
                  fill="url(#goldGrad)"
                  opacity="0.9"
                />
                <ellipse cx="36" cy="52" rx="16" ry="5" fill="none" stroke="url(#goldGrad)" strokeWidth="1.1" />
              </svg>
            </div>
            <p className="hero__brand-name">
              SHREEJI
              <span>— DIVINE —</span>
            </p>
          </div>

          <h1 className="hero__title">AROMA STONE</h1>

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
