'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import BrandLogo from './BrandLogo'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { SITE_TAGLINE } from '../lib/site'
import './StoreHeader.css'

const LINKS = [
  { href: '/', label: 'Home', end: true },
  { href: '/shop', label: 'Shop' },
  { href: '/#purpose', label: 'Our Story' },
  { href: '/#collections', label: 'Collections' },
]

export default function StoreHeader({ promo = true }) {
  const pathname = usePathname()
  const { count } = useCart()
  const { user, loading, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [shipNote, setShipNote] = useState('Free shipping on orders ₹1,000+')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    fetch('/api/shipping')
      .then((r) => r.json())
      .then((d) => {
        if (d?.note) setShipNote(d.note)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  function isActive(href, end) {
    if (end) return pathname === href
    if (href.startsWith('/#')) return false
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <div className={`store-chrome ${scrolled ? 'is-scrolled' : ''}`}>
      {promo ? (
        <div className="store-promo" role="note">
          <p>{shipNote} · {SITE_TAGLINE}</p>
        </div>
      ) : null}

      <header className="store-header">
        <div className="store-header__inner">
          <button
            type="button"
            className={`store-header__toggle ${open ? 'is-open' : ''}`}
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>

          <nav
            className={`store-header__nav store-header__nav--left ${open ? 'is-open' : ''}`}
            aria-label="Primary"
          >
            {LINKS.map((l) =>
              l.href.startsWith('/#') ? (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.href}
                  href={l.href}
                  className={isActive(l.href, l.end) ? 'is-active' : undefined}
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              )
            )}
            <Link
              href={user ? '/profile' : '/login'}
              className="store-header__mobile-only"
              onClick={() => setOpen(false)}
            >
              {user ? 'Account' : 'Log in'}
            </Link>
            {user && !loading ? (
              <button
                type="button"
                className="store-header__mobile-only store-header__logout"
                onClick={async () => {
                  await logout()
                  setOpen(false)
                }}
              >
                Logout
              </button>
            ) : null}
          </nav>

          <Link href="/" className="store-header__brand" aria-label="Shreeji Divine home">
            <BrandLogo height={scrolled ? 48 : 56} priority />
          </Link>

          <div className="store-header__actions">
            <Link
              href={user ? '/profile' : '/login'}
              className="store-header__desk-only"
            >
              {user ? 'Account' : 'Log in'}
            </Link>
            <Link href="/cart" className="store-header__cart" aria-label={`Cart${count ? `, ${count} items` : ''}`}>
              Cart
              {count > 0 ? <span className="store-header__badge">{count}</span> : null}
            </Link>
          </div>
        </div>
      </header>
    </div>
  )
}
