'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { adminApi, formatINR } from '../../../../../lib/adminApi'

const STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export default function AdminOrderDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [shippingInput, setShippingInput] = useState('')
  const [savingShip, setSavingShip] = useState(false)

  async function load() {
    const data = await adminApi(`/api/orders/${id}`)
    setOrder(data.order)
    setShippingInput(String(data.order?.shipping ?? 0))
  }

  useEffect(() => {
    if (!id) return
    load().catch((err) => setError(err.message))
  }, [id])

  async function updateStatus(status) {
    setSaving(true)
    setError('')
    setMsg('')
    try {
      const data = await adminApi(`/api/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      setOrder(data.order)
      setMsg('Status updated')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function updateShipping(e) {
    e.preventDefault()
    setSavingShip(true)
    setError('')
    setMsg('')
    try {
      const data = await adminApi(`/api/orders/${id}/shipping`, {
        method: 'PATCH',
        body: JSON.stringify({ shipping: Number(shippingInput) || 0 }),
      })
      setOrder(data.order)
      setShippingInput(String(data.order.shipping ?? 0))
      setMsg('Shipping updated')
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingShip(false)
    }
  }

  if (error && !order) {
    return (
      <div>
        <Link href="/admin/orders" className="admin-back">
          ← Back to orders
        </Link>
        <p className="admin-error">{error}</p>
      </div>
    )
  }

  if (!order) {
    return <p className="admin-page-sub">Loading order…</p>
  }

  return (
    <div>
      <Link href="/admin/orders" className="admin-back">
        ← Back to orders
      </Link>

      <div className="admin-order-head">
        <div>
          <h1 className="admin-page-title">{order.orderNumber}</h1>
          <p className="admin-page-sub" style={{ marginBottom: 0 }}>
            Placed{' '}
            {new Date(order.createdAt).toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <div className="admin-order-status">
          <label htmlFor="order-status">Status</label>
          <select
            id="order-status"
            value={order.status}
            disabled={saving}
            onChange={(e) => updateStatus(e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? <p className="admin-error">{error}</p> : null}
      {msg ? <p className="admin-success">{msg}</p> : null}

      <div className="admin-order-grid">
        <div className="admin-card">
          <h2>Items</h2>
          <ul className="admin-order-items">
            {(order.items || []).map((item) => (
              <li key={item.id || `${item.productSlug}-${item.productName}`}>
                <div className="admin-order-items__media">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.productName}
                      width={72}
                      height={72}
                      unoptimized
                    />
                  ) : null}
                </div>
                <div>
                  <strong>{item.productName}</strong>
                  <p>
                    {formatINR(item.price)} × {item.quantity}
                  </p>
                </div>
                <div className="admin-order-items__total">
                  {formatINR(item.price * item.quantity)}
                </div>
              </li>
            ))}
          </ul>
          <div className="admin-order-totals">
            <div>
              <span>Subtotal</span>
              <span>{formatINR(order.subtotal)}</span>
            </div>
            <div>
              <span>Shipping</span>
              <span>{order.shipping === 0 ? 'Free' : formatINR(order.shipping)}</span>
            </div>
            {order.discount > 0 ? (
              <div>
                <span>Coupon{order.couponCode ? ` (${order.couponCode})` : ''}</span>
                <span>−{formatINR(order.discount)}</span>
              </div>
            ) : null}
            <div className="is-total">
              <span>Total</span>
              <span>{formatINR(order.total)}</span>
            </div>
          </div>

          <form className="admin-ship-edit" onSubmit={updateShipping}>
            <h3>Change shipping</h3>
            <div className="admin-ship-edit__row">
              <label htmlFor="order-shipping">
                Shipping charge (₹)
                <input
                  id="order-shipping"
                  type="number"
                  min="0"
                  step="1"
                  value={shippingInput}
                  onChange={(e) => setShippingInput(e.target.value)}
                />
              </label>
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                disabled={savingShip}
              >
                {savingShip ? 'Saving…' : 'Update'}
              </button>
            </div>
            <p className="admin-page-sub" style={{ margin: '0.5rem 0 0' }}>
              Total recalculates as subtotal − discount + shipping
            </p>
          </form>
        </div>

        <div className="admin-order-side">
          <div className="admin-card">
            <h2>Customer</h2>
            <dl className="admin-dl">
              <div>
                <dt>Name</dt>
                <dd>{order.user?.name || order.shippingName}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{order.user?.email || '—'}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{order.shippingPhone}</dd>
              </div>
            </dl>
          </div>

          <div className="admin-card">
            <h2>Shipping</h2>
            <p className="admin-address">
              <strong>{order.shippingName}</strong>
              <br />
              {order.shippingLine1}
              {order.shippingLine2 ? (
                <>
                  <br />
                  {order.shippingLine2}
                </>
              ) : null}
              <br />
              {order.shippingCity}, {order.shippingState} — {order.shippingPincode}
            </p>
          </div>

          <div className="admin-card">
            <h2>Payment</h2>
            <dl className="admin-dl">
              <div>
                <dt>Method</dt>
                <dd>{order.paymentMethod}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{order.paymentStatus || 'PENDING'}</dd>
              </div>
              {order.razorpayPaymentId ? (
                <div>
                  <dt>Razorpay</dt>
                  <dd className="admin-mono">{order.razorpayPaymentId}</dd>
                </div>
              ) : null}
              {order.notes ? (
                <div>
                  <dt>Notes</dt>
                  <dd>{order.notes}</dd>
                </div>
              ) : null}
            </dl>
          </div>

          <button
            type="button"
            className="admin-btn admin-btn-ghost"
            onClick={() => router.push('/admin/orders')}
          >
            Back to list
          </button>
        </div>
      </div>
    </div>
  )
}
