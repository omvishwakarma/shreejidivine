'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminApi } from '../../../../lib/adminApi'

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')

  useEffect(() => {
    adminApi('/api/admin/users')
      .then((d) => setUsers(d.users || []))
      .catch((err) => setError(err.message))
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = users.filter((u) => {
      if (!q) return true
      const hay = [u.name, u.email, u.phone].filter(Boolean).join(' ').toLowerCase()
      return hay.includes(q)
    })
    list = [...list].sort((a, b) => {
      if (sort === 'name') return String(a.name).localeCompare(String(b.name))
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
    return list
  }, [users, search, sort])

  return (
    <div>
      <h1 className="admin-page-title">Customers</h1>
      <p className="admin-page-sub">Search customers or open View detail</p>
      {error ? <p className="admin-error">{error}</p> : null}

      <div className="admin-toolbar">
        <input
          className="admin-search"
          type="search"
          placeholder="Search name, email, phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest first</option>
          <option value="name">Name A–Z</option>
        </select>
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
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Joined</th>
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
