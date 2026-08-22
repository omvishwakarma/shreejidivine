'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CONTACT_EMAIL, SITE_NAME, SITE_TAGLINE, SITE_URL, SOCIAL } from '../lib/site'
import { APP_VERSION } from '../lib/appVersion'
import './Footer.css'

export default function Footer() {
  const year = new Date().getFullYear()
  const [version, setVersion] = useState(`v${APP_VERSION}`)

  useEffect(() => {
    const sha =
      process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
      process.env.VERCEL_GIT_COMMIT_SHA ||
      ''
    if (sha) setVersion(`v${APP_VERSION} · ${sha.slice(0, 7)}`)
  }, [])

  return (
    <footer className="footer" id="contact" aria-labelledby="contact-heading">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Image
            src="/images/logo-transparent.png"
            alt={SITE_NAME}
            width={969}
            height={747}
            className="footer__logo"
            sizes="200px"
          />
          <p>{SITE_TAGLINE}</p>
          <p className="footer__url">
            <a href={SITE_URL}>shreejidivinearoma.com</a>
          </p>
        </div>

        <nav className="footer__links" aria-label="Quick links">
          <h2 id="contact-heading" className="footer__nav-title">
            Quick links
          </h2>
          <Link href="/shop">Shop</Link>
          <Link href="/#testimonials">Our Story</Link>
          <Link href="/#how-to-use">How to Use</Link>
          <Link href="/cart">Cart</Link>
          <Link href="/profile">My Account</Link>
        </nav>

        <nav className="footer__links" aria-label="Policies">
          <h2 className="footer__nav-title">Shop</h2>
          <Link href="/shop/divine-ritual-kit">Divine Ritual Kit</Link>
          <Link href="/shop/mogra-royale">Mogra Royale</Link>
          <Link href="/shop/rose-majesty">Rose Majesty</Link>
          <Link href="/shop/lavender-bliss">Lavender Bliss</Link>
          <Link href="/shop/royal-chandan">Royal Chandan</Link>
        </nav>

        <div className="footer__contact">
          <h2 className="footer__nav-title">Connect</h2>
          <p>Orders, wholesale &amp; gifting</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="footer__email">
            {CONTACT_EMAIL}
          </a>
          {SOCIAL.instagram ? (
            <a
              href={SOCIAL.instagram}
              className="footer__social"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram {SOCIAL.instagramHandle}
            </a>
          ) : null}
          <Link href="/shop" className="btn btn-ink footer__btn">
            Shop Now
          </Link>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>
            © {year} {SITE_NAME}. Made in India.
          </p>
          <p className="footer__meta">
            <span className="footer__tag">{SITE_TAGLINE}</span>
            <span className="footer__version" title="Deploy version">
              {version}
            </span>
          </p>
        </div>
      </div>
    </footer>
  )
}
