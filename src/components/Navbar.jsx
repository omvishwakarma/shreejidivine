'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import BrandLogo from './BrandLogo'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

const links = [
  { href: '/shop', label: 'Shop' },
  { href: '#products', label: 'Collection' },
  { href: '#inside', label: "What's Inside" },
  { href: '#how-to-use', label: 'How to Use' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { count } = useCart()
  const { user } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="nav__inner container">
        <a href="#top" className="nav__brand" aria-label="Shreeji Divine home">
          <BrandLogo height={scrolled ? 64 : 76} priority />
        </a>

        <nav
          className={`nav__links ${open ? 'nav__links--open' : ''}`}
          aria-label="Primary"
        >
          {links.map((l) =>
            l.href.startsWith('/') ? (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ) : (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </a>
            )
          )}
          <Link href="/cart" onClick={() => setOpen(false)}>
            Cart{count > 0 ? ` (${count})` : ''}
          </Link>
          <Link
            href={user ? '/profile' : '/login'}
            className="nav__cta"
            onClick={() => setOpen(false)}
          >
            {user ? 'Account' : 'Login'}
          </Link>
        </nav>

        <button
          className={`nav__toggle ${open ? 'nav__toggle--open' : ''}`}
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  )
}
