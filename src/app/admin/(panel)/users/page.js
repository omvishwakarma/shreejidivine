'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminApi } from '../../../../lib/adminApi'
import { customerWhatsAppHref } from '@/lib/whatsapp/phone'

const SORT_COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'joined', label: 'Joined' },
]

function csvEscape(value) {
  const text = String(value ?? '')
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

function downloadCustomersExcel(rows) {
  const header = ['Name', 'Email', 'Phone', 'WhatsApp Sent', 'Joined']
  const lines = [
    header.join(','),
    ...rows.map((u) =>
      [
        csvEscape(u.name || ''),
        csvEscape(u.email || ''),
        csvEscape(u.phone || ''),
        csvEscape(u.whatsappSent ? 'Yes' : 'No'),
        csvEscape(
          u.createdAt
            ? new Date(u.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })
            : ''
        ),
      ].join(',')
    ),
  ]
  const blob = new Blob([`\uFEFF${lines.join('\n')}`], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const stamp = new Date().toISOString().slice(0, 10)
  const a = document.createElement('a')
  a.href = url
  a.download = `shreeji-customers-${stamp}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function compareUsers(a, b, sortKey, sortDir) {
  const dir = sortDir === 'asc' ? 1 : -1
  if (sortKey === 'joined') {
    return (new Date(a.createdAt) - new Date(b.createdAt)) * dir
  }
  const left = String(a[sortKey] || '').toLowerCase()
  const right = String(b[sortKey] || '').toLowerCase()
  return left.localeCompare(right, 'en', { numeric: true, sensitivity: 'base' }) * dir
}

function WhatsAppSentTick({ sent }) {
  if (!sent) return null
  return (
    <span className="admin-wa-tick" title="WhatsApp message sent" aria-label="WhatsApp sent">
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path d="M8.2 13.6 4.8 10.2l1.3-1.3 2.1 2.1 5.2-5.2 1.3 1.3z" />
      </svg>
    </span>
  )
}

function CustomersSkeleton() {
  return (
    <div className="admin-users-skel" aria-hidden="true">
      <div className="admin-users-skel__list">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="admin-users-skel__card">
            <span className="admin-skel-line admin-skel-line--lg" />
            <span className="admin-skel-line admin-skel-line--md" />
            <span className="admin-skel-line admin-skel-line--sm" />
          </div>
        ))}
      </div>
      <div className="admin-users-skel__table">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="admin-users-skel__row">
            <span className="admin-skel-line" />
            <span className="admin-skel-line" />
            <span className="admin-skel-line" />
            <span className="admin-skel-line" />
          </div>
        ))}
      </div>
    </div>
  )
}

function WhatsAppButton({ user, onMarked, className = '' }) {
  const href = customerWhatsAppHref({ phone: user.phone, name: user.name })
  const [saving, setSaving] = useState(false)

  if (!href) {
    return (
      <button type="button" className={`admin-btn admin-btn-ghost${className ? ` ${className}` : ''}`} disabled>
        No WhatsApp
      </button>
    )
  }

  async function markSent() {
    if (saving) return
    setSaving(true)
    try {
      const data = await adminApi(`/api/admin/users/${user.id}/whatsapp`, { method: 'POST' })
      onMarked?.(data.user)
    } catch {
      /* still open WhatsApp even if mark fails */
    } finally {
      setSaving(false)
    }
  }

  return (
    <span className="admin-wa-action">
      <WhatsAppSentTick sent={user.whatsappSent} />
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`admin-btn admin-btn-wa${user.whatsappSent ? ' is-sent' : ''}${className ? ` ${className}` : ''}`}
        onClick={(e) => {
          e.stopPropagation()
          void markSent()
        }}
      >
        {user.whatsappSent ? 'Sent again' : saving ? 'Saving…' : 'WhatsApp'}
      </a>
    </span>
  )
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('joined')
  const [sortDir, setSortDir] = useState('desc')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    adminApi('/api/admin/users')
      .then((d) => {
        if (!cancelled) setUsers(d.users || [])
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Could not load customers')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  function markUser(nextUser) {
    if (!nextUser?.id) return
    setUsers((list) => list.map((u) => (u.id === nextUser.id ? { ...u, ...nextUser } : u)))
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = users.filter((u) => {
      if (!q) return true
      const hay = [u.name, u.email, u.phone].filter(Boolean).join(' ').toLowerCase()
      return hay.includes(q)
    })
    return [...list].sort((a, b) => compareUsers(a, b, sortKey, sortDir))
  }, [users, search, sortKey, sortDir])

  const sentCount = useMemo(() => users.filter((u) => u.whatsappSent).length, [users])

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(key)
    setSortDir(key === 'joined' ? 'desc' : 'asc')
  }

  return (
    <div className="admin-users">
      <h1 className="admin-page-title">Customers</h1>
      <p className="admin-page-sub">
        WhatsApp pe click → message open. Green tick = pehle bhej chuke ho.
      </p>
      {error ? <p className="admin-error">{error}</p> : null}

      <div className="admin-toolbar admin-users__toolbar">
        <input
          className="admin-search"
          type="search"
          placeholder="Search name, email, phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="admin-users__toolbar-actions">
          <label className="admin-users__sort">
            <span>Sort</span>
            <select
              value={`${sortKey}:${sortDir}`}
              onChange={(e) => {
                const [key, dir] = e.target.value.split(':')
                setSortKey(key)
                setSortDir(dir === 'asc' ? 'asc' : 'desc')
              }}
            >
              <option value="joined:desc">Newest</option>
              <option value="joined:asc">Oldest</option>
              <option value="name:asc">Name A–Z</option>
              <option value="name:desc">Name Z–A</option>
              <option value="email:asc">Email A–Z</option>
              <option value="phone:asc">Phone</option>
            </select>
          </label>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            disabled={filtered.length === 0}
            onClick={() => downloadCustomersExcel(filtered)}
          >
            Download Excel
          </button>
          <span className="admin-toolbar__count">
            {loading ? 'Loading…' : `${filtered.length} / ${users.length} · WA ${sentCount}`}
          </span>
        </div>
      </div>

      <div className="admin-card admin-users__card">
        {loading ? (
          <CustomersSkeleton />
        ) : error && users.length === 0 ? (
          <p className="admin-error" style={{ marginBottom: 0 }}>
            {error}
          </p>
        ) : users.length === 0 ? (
          <p className="admin-page-sub" style={{ marginBottom: 0 }}>
            No customers yet
          </p>
        ) : filtered.length === 0 ? (
          <p className="admin-page-sub" style={{ marginBottom: 0 }}>
            No customers match your search
          </p>
        ) : (
          <>
            <div className="admin-users__list" aria-label="Customers">
              {filtered.map((u) => (
                <div key={u.id} className={`admin-users__item${u.whatsappSent ? ' is-wa-sent' : ''}`}>
                  <button
                    type="button"
                    className="admin-users__item-main"
                    onClick={() => router.push(`/admin/users/${u.id}`)}
                  >
                    <strong className="admin-users__name">
                      {u.name || '—'}
                      <WhatsAppSentTick sent={u.whatsappSent} />
                    </strong>
                    <span className="admin-users__email">{u.email || '—'}</span>
                    <span className="admin-users__meta">
                      <span>{u.phone || 'No phone'}</span>
                      <span>
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString('en-IN')
                          : '—'}
                      </span>
                    </span>
                  </button>
                  <div className="admin-users__item-actions">
                    <WhatsAppButton user={u} onMarked={markUser} />
                    <button
                      type="button"
                      className="admin-btn admin-btn-ghost"
                      onClick={() => router.push(`/admin/users/${u.id}`)}
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="admin-table-wrap admin-users__table-wrap">
              <table className="admin-table admin-users__table">
                <thead>
                  <tr>
                    {SORT_COLUMNS.map((col) => {
                      const active = sortKey === col.key
                      const arrow = !active ? '↕' : sortDir === 'asc' ? '↑' : '↓'
                      return (
                        <th key={col.key}>
                          <button
                            type="button"
                            className={`admin-sort-th${active ? ' is-active' : ''}`}
                            onClick={() => toggleSort(col.key)}
                            aria-label={`Sort by ${col.label}`}
                          >
                            <span>{col.label}</span>
                            <span className="admin-sort-th__arrow" aria-hidden="true">
                              {arrow}
                            </span>
                          </button>
                        </th>
                      )
                    })}
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr
                      key={u.id}
                      className={`admin-table__row--click${u.whatsappSent ? ' is-wa-sent' : ''}`}
                      onClick={() => router.push(`/admin/users/${u.id}`)}
                    >
                      <td>
                        <strong className="admin-users__name-cell">
                          {u.name}
                          <WhatsAppSentTick sent={u.whatsappSent} />
                        </strong>
                      </td>
                      <td>
                        <span className="admin-users__email-cell">{u.email}</span>
                      </td>
                      <td>{u.phone || '—'}</td>
                      <td>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="admin-users__row-actions">
                          <WhatsAppButton user={u} onMarked={markUser} />
                          <button
                            type="button"
                            className="admin-btn admin-btn-ghost"
                            onClick={() => router.push(`/admin/users/${u.id}`)}
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
