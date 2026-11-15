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
  const header = ['Name', 'Email', 'Phone', 'Joined']
  const lines = [
    header.join(','),
    ...rows.map((u) =>
      [
        csvEscape(u.name || ''),
        csvEscape(u.email || ''),
        csvEscape(u.phone || ''),
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

function WhatsAppButton({ user, className = '' }) {
  const href = customerWhatsAppHref({ phone: user.phone, name: user.name })
  if (!href) {
    return (
      <button type="button" className={`admin-btn admin-btn-ghost${className ? ` ${className}` : ''}`} disabled>
        No WhatsApp
      </button>
    )
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`admin-btn admin-btn-wa${className ? ` ${className}` : ''}`}
      onClick={(e) => e.stopPropagation()}
    >
      WhatsApp
    </a>
  )
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('joined')
  const [sortDir, setSortDir] = useState('desc')

  useEffect(() => {
    adminApi('/api/admin/users')
      .then((d) => setUsers(d.users || []))
      .catch((err) => setError(err.message))
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = users.filter((u) => {
      if (!q) return true
      const hay = [u.name, u.email, u.phone].filter(Boolean).join(' ').toLowerCase()
      return hay.includes(q)
    })
    return [...list].sort((a, b) => compareUsers(a, b, sortKey, sortDir))
  }, [users, search, sortKey, sortDir])

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
      <p className="admin-page-sub">Search customers or tap a customer for details</p>
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
            {filtered.length} / {users.length}
          </span>
        </div>
      </div>

      <div className="admin-card admin-users__card">
        {users.length === 0 ? (
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
                <div key={u.id} className="admin-users__item">
                  <button
                    type="button"
                    className="admin-users__item-main"
                    onClick={() => router.push(`/admin/users/${u.id}`)}
                  >
                    <strong className="admin-users__name">{u.name || '—'}</strong>
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
                    <WhatsAppButton user={u} />
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
                      className="admin-table__row--click"
                      onClick={() => router.push(`/admin/users/${u.id}`)}
                    >
                      <td>
                        <strong>{u.name}</strong>
                      </td>
                      <td>
                        <span className="admin-users__email-cell">{u.email}</span>
                      </td>
                      <td>{u.phone || '—'}</td>
                      <td>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="admin-users__row-actions">
                          <WhatsAppButton user={u} />
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
