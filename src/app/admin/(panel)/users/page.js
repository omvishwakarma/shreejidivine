'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '../../../../lib/adminApi'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    adminApi('/api/admin/users')
      .then((d) => setUsers(d.users || []))
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div>
      <h1 className="admin-page-title">Customers</h1>
      <p className="admin-page-sub">Registered storefront users</p>
      {error ? <p className="admin-error">{error}</p> : null}
      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone || '—'}</td>
                <td>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 ? <p className="admin-page-sub">No customers yet</p> : null}
      </div>
    </div>
  )
}
