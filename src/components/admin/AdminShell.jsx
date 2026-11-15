'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { clearAdminAuth, getAdminUser } from '../../lib/adminApi'
import { AdminToastHost } from './adminToast'
import { APP_VERSION } from '../../lib/appVersion'

const links = [
  { href: '/admin', label: 'Dashboard', end: true },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/coupons', label: 'Coupons' },
  { href: '/admin/expenses', label: 'Expenses' },
  { href: '/admin/instagram-shop', label: 'Instagram Shop' },
  { href: '/admin/instagram-feed', label: 'Instagram Feed' },
  { href: '/admin/testimonials', label: 'Testimonials' },
  { href: '/admin/users', label: 'Customers' },
  { href: '/admin/notifications', label: 'Notifications' },
  { href: '/admin/settings', label: 'Settings' },
]

export default function AdminShell({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const user = getAdminUser()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  return (
    <div className={`admin-shell${menuOpen ? ' admin-shell--menu-open' : ''}`}>
      <header className="admin-topbar">
        <button
          type="button"
          className="admin-burger"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="admin-side-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
        <div className="admin-topbar__brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-transparent.png" alt="" className="admin-topbar__logo" />
          <span>Admin</span>
        </div>
        <button
          type="button"
          className="admin-topbar__logout"
          onClick={() => {
            clearAdminAuth()
            router.replace('/admin/login')
          }}
        >
          Logout
        </button>
      </header>

      <div
        className="admin-side-backdrop"
        aria-hidden={!menuOpen}
        onClick={() => setMenuOpen(false)}
      />

      <aside id="admin-side-nav" className="admin-side" aria-hidden={false}>
        <div className="admin-side__head">
          <div className="admin-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-transparent.png"
              alt="Shreeji Divine"
              className="admin-brand__logo"
            />
            <small>Admin Panel</small>
          </div>
          <button
            type="button"
            className="admin-side__close"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3.2 3.2 12.8 12.8M12.8 3.2 3.2 12.8" />
            </svg>
          </button>
        </div>

        <nav className="admin-side__nav" aria-label="Admin">
          {links.map((l) => {
            const active = l.end ? pathname === l.href : pathname.startsWith(l.href)
            return (
              <Link
                key={l.href}
                href={l.href}
                className={active ? 'active' : ''}
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </Link>
            )
          })}
        </nav>

        <div className="admin-side__foot">
          <div className="admin-side__user" title={user?.email || ''}>
            {user?.email || 'Admin'}
          </div>
          <div className="admin-version" title="Deploy version">
            v{APP_VERSION}
          </div>
          <button
            type="button"
            className="nav-btn"
            onClick={() => {
              clearAdminAuth()
              router.replace('/admin/login')
            }}
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
      <AdminToastHost />
    </div>
  )
}
