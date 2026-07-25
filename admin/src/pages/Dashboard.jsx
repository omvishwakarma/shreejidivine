import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, formatINR } from '../api'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/api/admin/stats')
      .then(setData)
      .catch((err) => setError(err.message))
  }, [])

  if (error) return <p className="error">{error}</p>
  if (!data) return <p className="page-sub">Loading dashboard…</p>

  const { stats, recentOrders } = data

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">Overview of your Shreeji Divine store</p>

      <div className="stats">
        <div className="stat-card">
          <span>Revenue</span>
          <strong>{formatINR(stats.revenue)}</strong>
        </div>
        <div className="stat-card">
          <span>Orders</span>
          <strong>{stats.orders}</strong>
        </div>
        <div className="stat-card">
          <span>Products</span>
          <strong>{stats.products}</strong>
        </div>
        <div className="stat-card">
          <span>Customers</span>
          <strong>{stats.users}</strong>
        </div>
      </div>

      <div className="card">
        <h2>Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="page-sub">No orders yet</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link to="/orders">{o.orderNumber}</Link>
                  </td>
                  <td>{o.user?.name || '—'}</td>
                  <td>{formatINR(o.total)}</td>
                  <td>
                    <span className="badge">{o.status}</span>
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
