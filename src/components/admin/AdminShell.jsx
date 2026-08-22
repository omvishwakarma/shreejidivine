'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { clearAdminAuth, getAdminUser } from '../../lib/adminApi'
import { APP_VERSION } from '../../lib/appVersion'

const links = [
  { href: '/admin', label: 'Dashboard', end: true },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/coupons', label: 'Coupons' },
  { href: '/admin/instagram-shop', label: 'Instagram Shop' },
  { href: '/admin/testimonials', label: 'Testimonials' },
  { href: '/admin/users', label: 'Customers' },
  { href: '/admin/settings', label: 'Settings' },
]

export default function AdminShell({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const user = getAdminUser()

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <div className="admin-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo-transparent.png"
            alt="Shreeji Divine"
            className="admin-brand__logo"
          />
          <small>Admin Panel</small>
        </div>

        <nav className="admin-side__nav" aria-label="Admin">
          {links.map((l) => {
            const active = l.end ? pathname === l.href : pathname.startsWith(l.href)
            return (
              <Link key={l.href} href={l.href} className={active ? 'active' : ''}>
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
    </div>
  )
}
