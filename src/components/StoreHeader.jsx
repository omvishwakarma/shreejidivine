'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import BrandLogo from './BrandLogo'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { SITE_TAGLINE, SOCIAL } from '../lib/site'
import './StoreHeader.css'

const PROMO_LINES = [
  'Free Shipping on Eligible Orders',
  'Smoke-Free Aroma Stones · Handmade in India',
  `4.9★ Rated · ${SITE_TAGLINE}`,
]

const ArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="menu-drawer__arrow" fill="none" viewBox="0 0 14 10">
    <path fillRule="evenodd" clipRule="evenodd" d="M8.537.808a.5.5 0 01.817-.162l4 4a.5.5 0 010 .708l-4 4a.5.5 0 11-.708-.708L11.793 5.5H1.5a.5.5 0 010-1h10.293L8.646 1.354a.5.5 0 01-.109-.546z" fill="currentColor" />
  </svg>
)

export default function StoreHeader({ promo = true }) {
  const pathname = usePathname()
  const { count } = useCart()
  const { user, loading, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [opening, setOpening] = useState(false)
  const [submenu, setSubmenu] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const [promoIndex, setPromoIndex] = useState(0)
  const [shipNote, setShipNote] = useState('')
  const [categories, setCategories] = useState([])
  const [deskOpen, setDeskOpen] = useState(null)

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
    fetch('/api/categories?nav=1')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const id = setInterval(() => setPromoIndex((i) => (i + 1) % 3), 4200)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    closeDrawer()
    setDeskOpen(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    document.body.classList.toggle('menu-mobile--open', open)
    return () => document.body.classList.remove('menu-mobile--open')
  }, [open])

  function openDrawer() {
    setOpen(true)
    setOpening(true)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setOpening(false))
    })
  }

  function closeDrawer() {
    setOpen(false)
    setOpening(false)
    setSubmenu(null)
  }

  function toggleDrawer() {
    if (open) closeDrawer()
    else openDrawer()
  }

  const lines = [shipNote || PROMO_LINES[0], PROMO_LINES[1], PROMO_LINES[2]]

  return (
    <div className={`store-chrome ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-drawer-open' : ''} ${opening ? 'is-drawer-opening' : ''}`}>
      {promo ? (
        <div className="store-promo" role="note">
          {lines.map((line, i) => (
            <p key={line} className={i === promoIndex ? 'is-active' : ''} aria-hidden={i !== promoIndex}>
              {line}
            </p>
          ))}
        </div>
      ) : null}

      <header className="store-header">
        <div className="store-header__inner">
          <button
            type="button"
            className={`store-header__toggle ${open ? 'is-open' : ''}`}
            aria-label="Menu"
            aria-expanded={open}
            onClick={toggleDrawer}
          >
            <span />
            <span />
            <span />
          </button>

          <nav className="store-header__nav store-header__nav--desk" aria-label="Primary">
            <Link href="/" className={pathname === '/' ? 'is-active' : undefined}>
              Home
            </Link>
            <Link href="/shop" className={pathname.startsWith('/shop') ? 'is-active' : undefined}>
              Shop
            </Link>
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={`store-header__drop ${deskOpen === cat.id ? 'is-open' : ''}`}
                onMouseEnter={() => setDeskOpen(cat.id)}
                onMouseLeave={() => setDeskOpen(null)}
              >
                <Link href={`/shop?category=${cat.slug}`}>{cat.name}</Link>
                {cat.children?.length ? (
                  <div className="store-header__mega">
                    <Link href={`/shop?category=${cat.slug}`} className="store-header__mega-all">
                      All {cat.name}
                    </Link>
                    {cat.children.map((child) => (
                      <Link key={child.id} href={`/shop?category=${cat.slug}&subcategory=${child.slug}`}>
                        {child.name}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            <Link href="/#products">Best Sellers</Link>
            <Link href="/#purpose">About us</Link>
          </nav>

          <Link href="/" className="store-header__brand" aria-label="Shreeji Divine home">
            <BrandLogo height={scrolled ? 52 : 64} priority />
          </Link>

          <div className="store-header__actions">
            {SOCIAL.instagram ? (
              <a
                href={SOCIAL.instagram}
                className="store-header__desk-only"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                Instagram
              </a>
            ) : null}
            <Link href={user ? '/profile' : '/login'} className="store-header__desk-only">
              {user ? 'Account' : 'Log in'}
            </Link>
            <Link
              href="/cart"
              className="store-header__cart"
              aria-label={`Cart${count ? `, ${count} items` : ''}`}
            >
              Cart
              {count > 0 ? <span className="store-header__badge">{count}</span> : null}
            </Link>
          </div>
        </div>
      </header>

      {/* Gulessence-style mobile drawer */}
      <div
        className={`menu-drawer-backdrop ${open ? 'is-visible' : ''}`}
        onClick={closeDrawer}
        aria-hidden={!open}
      />
      <div
        id="menu-drawer"
        className={`menu-drawer ${open ? 'is-open' : ''} ${opening ? 'is-opening' : ''}`}
        aria-hidden={!open}
      >
        <div className="menu-drawer__inner">
          <div className={`menu-drawer__panel ${submenu ? 'is-pushed' : ''}`}>
            <button type="button" className="menu-drawer__close-x" onClick={closeDrawer} aria-label="Close menu">
              ×
            </button>
            <nav className="menu-drawer__nav" aria-label="Mobile">
              <ul className="menu-drawer__list">
                <li>
                  <Link href="/" className="menu-drawer__item" onClick={closeDrawer}>
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="menu-drawer__item" onClick={closeDrawer}>
                    Shop All
                  </Link>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    {cat.children?.length ? (
                      <button
                        type="button"
                        className="menu-drawer__item menu-drawer__item--parent"
                        onClick={() => setSubmenu(cat)}
                      >
                        <span>{cat.name}</span>
                        <ArrowIcon />
                      </button>
                    ) : (
                      <Link
                        href={`/shop?category=${cat.slug}`}
                        className="menu-drawer__item"
                        onClick={closeDrawer}
                      >
                        {cat.name}
                      </Link>
                    )}
                  </li>
                ))}
                <li>
                  <Link href="/#products" className="menu-drawer__item" onClick={closeDrawer}>
                    Best Sellers
                  </Link>
                </li>
                <li>
                  <Link href="/#purpose" className="menu-drawer__item" onClick={closeDrawer}>
                    About us
                  </Link>
                </li>
              </ul>
            </nav>
            <div className="menu-drawer__utils">
              <Link href={user ? '/profile' : '/login'} onClick={closeDrawer}>
                {user ? 'Account' : 'Log in'}
              </Link>
              {SOCIAL.instagram ? (
                <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" onClick={closeDrawer}>
                  Instagram
                </a>
              ) : null}
              {user && !loading ? (
                <button
                  type="button"
                  onClick={async () => {
                    await logout()
                    closeDrawer()
                  }}
                >
                  Logout
                </button>
              ) : null}
            </div>
          </div>

          <div className={`menu-drawer__submenu ${submenu ? 'is-open' : ''}`}>
            {submenu ? (
              <>
                <div className="menu-drawer__topbar">
                  <button
                    type="button"
                    className="menu-drawer__back"
                    aria-label="Back"
                    onClick={() => setSubmenu(null)}
                  >
                    <ArrowIcon />
                  </button>
                  <Link
                    href={`/shop?category=${submenu.slug}`}
                    className="menu-drawer__topbar-title"
                    onClick={closeDrawer}
                  >
                    {submenu.name}
                  </Link>
                </div>
                <ul className="menu-drawer__list">
                  <li>
                    <Link
                      href={`/shop?category=${submenu.slug}`}
                      className="menu-drawer__item"
                      onClick={closeDrawer}
                    >
                      All {submenu.name}
                    </Link>
                  </li>
                  {(submenu.children || []).map((child) => (
                    <li key={child.id}>
                      <Link
                        href={`/shop?category=${submenu.slug}&subcategory=${child.slug}`}
                        className="menu-drawer__item"
                        onClick={closeDrawer}
                      >
                        {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
