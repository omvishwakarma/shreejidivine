'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import BrandLogo from './BrandLogo'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import './ShopNav.css'

export default function ShopNav({ variant = 'shop' }) {
  const pathname = usePathname()
  const { count } = useCart()
  const { user, loading, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const solid = variant === 'solid' || pathname !== '/'

  const links = [
    { href: '/shop', label: 'Shop' },
    { href: '/cart', label: 'Cart' },
    { href: user ? '/profile' : '/login', label: user ? 'Account' : 'Login' },
  ]

  return (
    <header className={`shop-nav ${solid ? 'shop-nav--solid' : ''}`}>
      <div className="shop-nav__inner container">
        <Link href="/" className="shop-nav__brand" aria-label="Shreeji Divine home">
          <BrandLogo height={56} priority />
        </Link>

        <nav className={`shop-nav__links ${open ? 'is-open' : ''}`} aria-label="Shop">
          <Link href="/" onClick={() => setOpen(false)}>
            Home
          </Link>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={pathname.startsWith(l.href) ? 'is-active' : undefined}
              onClick={() => setOpen(false)}
            >
              {l.label}
              {l.href === '/cart' && count > 0 ? (
                <span className="shop-nav__badge">{count}</span>
              ) : null}
            </Link>
          ))}
          {user && !loading ? (
            <button
              type="button"
              className="shop-nav__logout"
              onClick={async () => {
                await logout()
                setOpen(false)
              }}
            >
              Logout
            </button>
          ) : null}
        </nav>

        <button
          type="button"
          className={`shop-nav__toggle ${open ? 'is-open' : ''}`}
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
