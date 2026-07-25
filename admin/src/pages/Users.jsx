import { useEffect, useState } from 'react'
import { api } from '../api'

export default function Users() {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api('/api/admin/users')
      .then((d) => setUsers(d.users || []))
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div>
      <h1 className="page-title">Customers</h1>
      <p className="page-sub">Registered storefront users</p>
      {error ? <p className="error">{error}</p> : null}
      <div className="card">
        <table>
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
        {users.length === 0 ? <p className="page-sub">No customers yet</p> : null}
      </div>
    </div>
  )
}
