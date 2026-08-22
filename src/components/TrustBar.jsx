import './TrustBar.css'

function IconFlameFree() {
  return (
    <svg viewBox="0 0 72 72" fill="none" aria-hidden="true">
      <circle cx="36" cy="36" r="33" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M36 18c-1.4 5-7 9-7 15.5a7 7 0 0 0 14 0C43 27 37.4 23 36 18Z"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinejoin="round"
      />
      <path
        d="M36 26c-.7 2.5-2.8 4.4-2.8 7.2a2.8 2.8 0 0 0 5.6 0c0-2.8-2.1-4.7-2.8-7.2Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path d="M20 20l32 32" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
      <path
        d="M36 54.5c-.55 1.5-2 2.45-2 4.1a2 2 0 0 0 4 0c0-1.65-1.45-2.6-2-4.1Z"
        fill="currentColor"
      />
    </svg>
  )
}

function IconSmokeFree() {
  return (
    <svg viewBox="0 0 72 72" fill="none" aria-hidden="true">
      <circle cx="36" cy="36" r="33" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M26 42c2.2-4.5 3.2-8 2-11.5 4.5 1.2 8 4.5 9 9 1.2-4.5 4.5-7.8 9-9-.8 4.5.5 8 3.2 11.5"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M31 28c1.2-3.5 1.8-6.5 1-9.5M41 28c-1.2-3.5-1.8-6.5-1-9.5"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <path d="M20 20l32 32" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
      <path
        d="M36 54.5c-.55 1.5-2 2.45-2 4.1a2 2 0 0 0 4 0c0-1.65-1.45-2.6-2-4.1Z"
        fill="currentColor"
      />
    </svg>
  )
}

function IconHandcrafted() {
  return (
    <svg viewBox="0 0 72 72" fill="none" aria-hidden="true">
      <circle cx="36" cy="36" r="33" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M37 16.5c2 1.4 3.4 4 3 6.8 1.2 1.4 3 2.4 3.8 4.6.7 2-.2 4.2-1.5 5.4 1.2 1 2.2 2.8 1.8 4.6-.5 2.4-2.5 3.6-4 4.8-.7 2.4-2.2 5.2-3.9 6.4-1.2-1-2-3-2.2-5-1-.5-2.6-1.8-3.2-3.5-.8-2 .2-4 1.3-5-1.5-1.2-2.6-3.2-2-5.2.5-2 2.3-3.2 3.3-4.5.3-2.2 1.5-5 4.4-6.8Z"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinejoin="round"
      />
      <path
        d="M34.2 33.2c.5-1.1 1.5-1.7 1.8-1.7s1.3.6 1.8 1.7c.25.55.15 1.05-.3 1.4L36 37.2l-1.5-2.6c-.45-.35-.55-.85-.3-1.4Z"
        fill="currentColor"
      />
      <path
        d="M36 54.5c-.55 1.5-2 2.45-2 4.1a2 2 0 0 0 4 0c0-1.65-1.45-2.6-2-4.1Z"
        fill="currentColor"
      />
    </svg>
  )
}

function IconReusable() {
  return (
    <svg viewBox="0 0 72 72" fill="none" aria-hidden="true">
      <circle cx="36" cy="36" r="33" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M36 16c-1.4 4.2-5.2 7.2-5.2 11.8A5.2 5.2 0 0 0 36 33a5.2 5.2 0 0 0 5.2-5.2C41.2 23.2 37.4 20.2 36 16Z"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinejoin="round"
      />
      <ellipse cx="36" cy="40" rx="11" ry="3.4" stroke="currentColor" strokeWidth="1.35" />
      <ellipse cx="36" cy="45.5" rx="15.5" ry="4.4" stroke="currentColor" strokeWidth="1.35" />
      <path
        d="M36 54.5c-.55 1.5-2 2.45-2 4.1a2 2 0 0 0 4 0c0-1.65-1.45-2.6-2-4.1Z"
        fill="currentColor"
      />
    </svg>
  )
}

const ITEMS = [
  {
    id: 'flame-free',
    title: 'Flame-Free',
    text: 'Pure fragrance, no flame',
    Icon: IconFlameFree,
  },
  {
    id: 'smoke-free',
    title: 'Smoke-Free',
    text: 'Clean aroma, no ash',
    Icon: IconSmokeFree,
  },
  {
    id: 'handcrafted',
    title: 'Handcrafted',
    text: 'Made in India',
    Icon: IconHandcrafted,
  },
  {
    id: 'reusable',
    title: 'Reusable',
    text: 'Refresh with fragrance oil',
    Icon: IconReusable,
  },
]

export default function TrustBar() {
  return (
    <section className="trust-bar" aria-label="Brand highlights">
      <div className="container trust-bar__inner">
        {ITEMS.map(({ id, title, text, Icon }) => (
          <article key={id} className="trust-bar__item">
            <span className="trust-bar__icon">
              <Icon />
            </span>
            <h3 className="trust-bar__title">{title}</h3>
            <span className="trust-bar__rule" aria-hidden="true" />
            <p className="trust-bar__text">{text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
