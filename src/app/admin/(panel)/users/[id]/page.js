'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { adminApi, formatINR } from '../../../../../lib/adminApi'
import { customerWhatsAppHref } from '@/lib/whatsapp/phone'

export default function AdminUserDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [markingWa, setMarkingWa] = useState(false)

  useEffect(() => {
    if (!id) return
    adminApi(`/api/admin/users/${id}`)
      .then((data) => {
        setUser(data.user)
        setOrders(data.orders || [])
      })
      .catch((err) => setError(err.message))
  }, [id])

  const waHref = user ? customerWhatsAppHref({ phone: user.phone, name: user.name }) : ''

  async function openWhatsApp() {
    if (!user?.id || !waHref || markingWa) return
    setMarkingWa(true)
    try {
      const data = await adminApi(`/api/admin/users/${user.id}/whatsapp`, { method: 'POST' })
      if (data.user) setUser((prev) => ({ ...prev, ...data.user }))
    } catch {
      /* still open chat */
    } finally {
      setMarkingWa(false)
    }
    window.open(waHref, '_blank', 'noopener,noreferrer')
  }

  if (error && !user) {
    return (
      <div>
        <Link href="/admin/users" className="admin-back">
          ← Back to customers
        </Link>
        <p className="admin-error">{error}</p>
      </div>
    )
  }

  if (!user) {
    return <p className="admin-page-sub">Loading customer…</p>
  }

  return (
    <div>
      <Link href="/admin/users" className="admin-back">
        ← Back to customers
      </Link>

      <h1 className="admin-page-title">{user.name}</h1>
      <p className="admin-page-sub">Customer profile and order history</p>

      <div className="admin-order-grid">
        <div className="admin-card">
          <h2>Orders ({orders.length})</h2>
          {orders.length === 0 ? (
            <p className="admin-page-sub" style={{ marginBottom: 0 }}>
              No orders yet
            </p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
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
                    <td>{o.items?.length || 0}</td>
                    <td>{formatINR(o.total)}</td>
                    <td>
                      <span className="admin-badge">{o.paymentMethod}</span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', marginTop: 4 }}>
                        {o.paymentStatus || 'PENDING'}
                      </div>
                    </td>
                    <td>
                      <span className={`admin-status admin-status--${String(o.status).toLowerCase()}`}>
                        {o.status}
                      </span>
                    </td>
                    <td>
                      {new Date(o.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="admin-order-side">
          <div className="admin-card">
            <h2>Profile</h2>
            <dl className="admin-dl">
              <div>
                <dt>Name</dt>
                <dd>{user.name}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{user.email}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{user.phone || '—'}</dd>
              </div>
              {waHref ? (
                <div className="admin-users__detail-wa">
                  {user.whatsappSent ? (
                    <p className="admin-wa-sent-note">
                      <span className="admin-wa-tick" aria-hidden="true">
                        <svg viewBox="0 0 20 20">
                          <path d="M8.2 13.6 4.8 10.2l1.3-1.3 2.1 2.1 5.2-5.2 1.3 1.3z" />
                        </svg>
                      </span>
                      WhatsApp sent
                      {user.whatsappOutreachAt
                        ? ` · ${new Date(user.whatsappOutreachAt).toLocaleString('en-IN')}`
                        : ''}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    className={`admin-btn admin-btn-wa${user.whatsappSent ? ' is-sent' : ''}`}
                    onClick={openWhatsApp}
                    disabled={markingWa}
                  >
                    {user.whatsappSent ? 'Send again on WhatsApp' : 'WhatsApp message'}
                  </button>
                </div>
              ) : null}
              <div>
                <dt>Joined</dt>
                <dd>
                  {new Date(user.createdAt).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </dd>
              </div>
              <div>
                <dt>Orders</dt>
                <dd>{orders.length}</dd>
              </div>
              <div>
                <dt>Total spent</dt>
                <dd>
                  {formatINR(
                    orders
                      .filter((o) => o.status !== 'CANCELLED')
                      .reduce((sum, o) => sum + (o.total || 0), 0)
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
