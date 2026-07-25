'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CONTACT_EMAIL, SITE_URL } from '../lib/site'
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
            src="/images/logo.png"
            alt="Shreeji Divine"
            width={516}
            height={358}
            className="footer__logo"
            sizes="220px"
          />
          <p>Fragrance that brings divine presence home.</p>
          <p className="footer__url">
            <a href={SITE_URL}>shreejidivinearoma.com</a>
          </p>
        </div>

        <nav className="footer__links" aria-label="Footer">
          <h2 id="contact-heading" className="footer__nav-title">
            Shop
          </h2>
          <Link href="/shop">All Products</Link>
          <Link href="/shop/divine-ritual-kit">Divine Ritual Kit</Link>
          <Link href="/cart">Cart</Link>
          <Link href="/profile">My Account</Link>
          <a href="/#how-to-use">How to Use</a>
        </nav>

        <div className="footer__contact">
          <h2 className="footer__nav-title">Connect</h2>
          <p>For orders, wholesale &amp; gifting enquiries</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="footer__email">
            {CONTACT_EMAIL}
          </a>
          <Link href="/shop" className="btn btn-gold footer__btn">
            Shop Now
          </Link>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>© {year} Shreeji Divine. Made in India. All rights reserved.</p>
          <p className="footer__meta">
            <span className="footer__tag">Ghar Par Mandir Ki Feeling</span>
            <span className="footer__version" title="Deploy version">
              {version}
            </span>
          </p>
        </div>
      </div>
    </footer>
  )
}
