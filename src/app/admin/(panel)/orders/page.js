'use client'

import { useEffect, useState } from 'react'
import { adminApi, formatINR } from '../../../../lib/adminApi'

const STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')

  async function load() {
    const data = await adminApi('/api/orders?all=1')
    setOrders(data.orders || [])
  }

  useEffect(() => {
    load().catch((err) => setError(err.message))
  }, [])

  async function updateStatus(id, status) {
    await adminApi(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
    await load()
  }

  return (
    <div>
      <h1 className="admin-page-title">Orders</h1>
      <p className="admin-page-sub">Track and update customer orders</p>
      {error ? <p className="admin-error">{error}</p> : null}

      <div className="admin-card">
        {orders.length === 0 ? (
          <p className="admin-page-sub">No orders yet</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <strong>{o.orderNumber}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--admin-muted)' }}>
                      {o.shippingCity}, {o.shippingState}
                    </div>
                  </td>
                  <td>
                    {o.user?.name || o.shippingName}
                    <div style={{ fontSize: '0.8rem', color: 'var(--admin-muted)' }}>
                      {o.user?.email || o.shippingPhone}
                    </div>
                  </td>
                  <td>{o.items?.length || 0}</td>
                  <td>{formatINR(o.total)}</td>
                  <td>
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
