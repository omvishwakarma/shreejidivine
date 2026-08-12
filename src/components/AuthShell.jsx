import Image from 'next/image'
import Link from 'next/link'
import { SITE_NAME, SITE_TAGLINE } from '../lib/site'
import '../app/auth.css'

export default function AuthShell({ mode = 'signup', next = '/profile', children }) {
  const nextQuery = next && next !== '/profile' ? `?next=${encodeURIComponent(next)}` : ''

  return (
    <div className="auth-split">
      <aside className="auth-visual" aria-hidden={false}>
        <div className="auth-visual__media">
          <Image
            src="/images/hero-banner.png"
            alt=""
            fill
            priority
            sizes="(max-width: 960px) 100vw, 55vw"
          />
        </div>
        <div className="auth-visual__shade" />
        <div className="auth-visual__content">
          <p className="auth-visual__brand">
            {SITE_NAME}
            <span>{SITE_TAGLINE}</span>
          </p>
          <p className="auth-visual__lead">
            Bring the calm of a temple home — smoke-free aroma stones for prayer, gifting, and
            everyday ritual.
          </p>
        </div>
        <div className="auth-visual__curve" aria-hidden="true">
          <svg viewBox="0 0 80 1000" preserveAspectRatio="none">
            <path
              d="M80 0 C 28 180, 28 420, 80 500 C 132 580, 132 820, 80 1000 L 80 1000 L 80 0 Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </aside>

      <section className="auth-panel">
        <div className="auth-panel__top">
          <div className="auth-panel__nav">
            <Link href="/" className="auth-icon-btn auth-icon-btn--circle" aria-label="Back to home">
              ←
            </Link>
            <Link href="/shop" className="auth-icon-btn">
              <span>Shop</span>
            </Link>
          </div>
          <Link href="/" className="auth-panel__home">
            {SITE_NAME}
          </Link>
        </div>

        <div className="auth-panel__body">
          <Image
            src="/images/logo-transparent.png"
            alt={SITE_NAME}
            width={958}
            height={605}
            className="auth-logo"
            priority
          />
          <h1>{mode === 'login' ? 'Welcome back' : 'Join Shreeji'}</h1>
          <p className="auth-panel__sub">
            {mode === 'login'
              ? 'Sign in to checkout, track orders, and manage addresses.'
              : 'Create an account to save addresses and follow every order.'}
          </p>

          <div className="auth-toggle" role="tablist" aria-label="Account mode">
            <Link
              href={`/signup${nextQuery}`}
              className={mode === 'signup' ? 'is-active' : undefined}
              role="tab"
              aria-selected={mode === 'signup'}
            >
              Register
            </Link>
            <Link
              href={`/login${nextQuery}`}
              className={mode === 'login' ? 'is-active' : undefined}
              role="tab"
              aria-selected={mode === 'login'}
            >
              Login
            </Link>
          </div>

          {children}
        </div>
      </section>
    </div>
  )
}
