'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminApi, formatINR } from '../../../../lib/adminApi'

const STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export default function AdminOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')

  async function load() {
    const data = await adminApi('/api/orders?all=1')
    const list = [...(data.orders || [])].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )
    setOrders(list)
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false
      if (paymentFilter !== 'all' && o.paymentMethod !== paymentFilter) return false
      if (!q) return true
      const hay = [
        o.orderNumber,
        o.shippingName,
        o.shippingPhone,
        o.shippingCity,
        o.shippingState,
        o.user?.name,
        o.user?.email,
        o.paymentStatus,
        o.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [orders, search, statusFilter, paymentFilter])

  return (
    <div>
      <h1 className="admin-page-title">Orders</h1>
      <p className="admin-page-sub">Newest orders first — search, filter, or open details</p>
      {error ? <p className="admin-error">{error}</p> : null}

      <div className="admin-toolbar">
        <input
          className="admin-search"
          type="search"
          placeholder="Search order, customer, phone, city…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
          <option value="all">All payments</option>
          <option value="COD">COD</option>
          <option value="RAZORPAY">RAZORPAY</option>
        </select>
        <span className="admin-toolbar__count">
          {filtered.length} / {orders.length}
        </span>
      </div>

      <div className="admin-card">
        {orders.length === 0 ? (
          <p className="admin-page-sub" style={{ marginBottom: 0 }}>
            No orders yet
          </p>
        ) : filtered.length === 0 ? (
          <p className="admin-page-sub" style={{ marginBottom: 0 }}>
            No orders match your search
          </p>
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
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr
                  key={o.id}
                  className="admin-table__row--click"
                  onClick={() => router.push(`/admin/orders/${o.id}`)}
                >
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
                  <td onClick={(e) => e.stopPropagation()}>
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
                  <td onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="admin-btn admin-btn-ghost"
                      onClick={() => router.push(`/admin/orders/${o.id}`)}
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
