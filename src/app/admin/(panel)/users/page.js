'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminApi } from '../../../../lib/adminApi'

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
    <div>
      <h1 className="admin-page-title">Customers</h1>
      <p className="admin-page-sub">Search customers or click a column to sort</p>
      {error ? <p className="admin-error">{error}</p> : null}

      <div className="admin-toolbar">
        <input
          className="admin-search"
          type="search"
          placeholder="Search name, email, phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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

      <div className="admin-card">
        {users.length === 0 ? (
          <p className="admin-page-sub" style={{ marginBottom: 0 }}>
            No customers yet
          </p>
        ) : filtered.length === 0 ? (
          <p className="admin-page-sub" style={{ marginBottom: 0 }}>
            No customers match your search
          </p>
        ) : (
          <table className="admin-table">
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
                  <td>{u.email}</td>
                  <td>{u.phone || '—'}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="admin-btn admin-btn-ghost"
                      onClick={() => router.push(`/admin/users/${u.id}`)}
                    >
                      View detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
