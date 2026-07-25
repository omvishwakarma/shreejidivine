'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { clearAdminAuth, getAdminUser } from '../../lib/adminApi'
import { APP_VERSION } from '../../lib/appVersion'

const links = [
  { href: '/admin', label: 'Dashboard', end: true },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/users', label: 'Customers' },
]

export default function AdminShell({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const user = getAdminUser()

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <div className="admin-brand">
          SHREEJI
          <small>Admin Panel</small>
        </div>
        {links.map((l) => {
          const active = l.end ? pathname === l.href : pathname.startsWith(l.href)
          return (
            <Link key={l.href} href={l.href} className={active ? 'active' : ''}>
              {l.label}
            </Link>
          )
        })}
        <div
          style={{
            marginTop: 'auto',
            padding: '1rem 0.75rem 0',
            fontSize: '0.8rem',
            opacity: 0.6,
          }}
        >
          {user?.email}
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
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  )
}
