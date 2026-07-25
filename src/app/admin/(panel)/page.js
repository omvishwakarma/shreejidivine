'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { adminApi, formatINR } from '../../../lib/adminApi'

export default function AdminDashboardPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    adminApi('/api/admin/stats')
      .then(setData)
      .catch((err) => setError(err.message))
  }, [])

  if (error) return <p className="admin-error">{error}</p>
  if (!data) return <p className="admin-page-sub">Loading dashboard…</p>

  const { stats, recentOrders } = data

  return (
    <div>
      <h1 className="admin-page-title">Dashboard</h1>
      <p className="admin-page-sub">Overview of your Shreeji Divine store</p>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <span>Revenue</span>
          <strong>{formatINR(stats.revenue)}</strong>
        </div>
        <div className="admin-stat-card">
          <span>Orders</span>
          <strong>{stats.orders}</strong>
        </div>
        <div className="admin-stat-card">
          <span>Products</span>
          <strong>{stats.products}</strong>
        </div>
        <div className="admin-stat-card">
          <span>Customers</span>
          <strong>{stats.users}</strong>
        </div>
      </div>

      <div className="admin-card">
        <h2>Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="admin-page-sub">No orders yet</p>
        ) : (
          <table className="admin-table">
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
                    <Link href="/admin/orders">{o.orderNumber}</Link>
                  </td>
                  <td>{o.user?.name || '—'}</td>
                  <td>{formatINR(o.total)}</td>
                  <td>
                    <span className="admin-badge">{o.status}</span>
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
