'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import ShopNav from '../../../../components/ShopNav'
import Footer from '../../../../components/Footer'
import { useAuth } from '../../../../context/AuthContext'
import { formatINR } from '../../../../lib/products'
import { api } from '../../../../lib/api'
import { downloadInvoice, printInvoice } from '../../../../lib/invoice'
import '../../../ecom.css'
import './order-detail.css'

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED']

function statusIndex(status) {
  if (status === 'CANCELLED') return -1
  const i = STATUS_STEPS.indexOf(status)
  return i >= 0 ? i : 0
}

function paymentLabel(method) {
  if (method === 'RAZORPAY') return 'Paid online (Razorpay)'
  if (method === 'COD') return 'Cash on Delivery'
  return method || '—'
}

export default function OrderDetailClient() {
  const { id } = useParams()
  const { user, loading } = useAuth()
  const router = useRouter()
  const search = useSearchParams()
  const placed = search.get('placed')
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !user) router.replace(`/login?next=/profile/orders/${id}`)
  }, [loading, user, router, id])

  useEffect(() => {
    if (!user || !id) return
    api(`/api/orders/${id}`)
      .then((data) => setOrder(data.order))
      .catch((err) => setError(err.message))
  }, [user, id])

  const step = useMemo(() => (order ? statusIndex(order.status) : 0), [order])

  if (loading || (!order && !error)) {
    return (
      <div className="ecom-page order-detail-page">
        <ShopNav />
        <div className="empty-state">Loading order…</div>
      </div>
    )
  }

  const placedMsg =
    order?.paymentMethod === 'COD'
      ? 'Order placed successfully. Please keep cash ready for delivery.'
      : order?.paymentStatus === 'PAID'
        ? 'Payment received. Your divine package is being prepared.'
        : 'Order placed successfully.'

  return (
    <div className="ecom-page order-detail-page">
      <ShopNav />
      <div className="od-shell">
        <p className="od-crumb">
          <Link href="/profile?tab=orders">My orders</Link>
          <span aria-hidden="true"> / </span>
          <span>{order?.orderNumber || 'Detail'}</span>
        </p>

        {error ? <div className="empty-state">{error}</div> : null}

        {order ? (
          <>
            {placed ? (
              <div className="od-success" role="status">
                <strong>Thank you</strong>
                <p>{placedMsg}</p>
              </div>
            ) : null}

            <header className="od-hero">
              <div>
                <p className="section-label">Order details</p>
                <h1>{order.orderNumber}</h1>
                <p className="od-hero__meta">
                  Placed on{' '}
                  {new Date(order.createdAt).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="od-hero__actions">
                <button
                  type="button"
                  className="od-btn od-btn--primary"
                  onClick={() => printInvoice(order, { email: user?.email })}
                >
                  Print invoice
                </button>
                <button
                  type="button"
                  className="od-btn od-btn--ghost"
                  onClick={() => downloadInvoice(order, { email: user?.email })}
                >
                  Download PDF
                </button>
              </div>
            </header>

            <div className="od-badges">
              <span className={`od-pill od-pill--status`}>{order.status}</span>
              <span className="od-pill">{paymentLabel(order.paymentMethod)}</span>
              <span className="od-pill">
                Payment: {order.paymentStatus || 'PENDING'}
              </span>
            </div>

            {order.status !== 'CANCELLED' ? (
              <ol className="od-timeline" aria-label="Order progress">
                {STATUS_STEPS.map((s, i) => (
                  <li
                    key={s}
                    className={
                      i < step ? 'is-done' : i === step ? 'is-current' : ''
                    }
                  >
                    <span className="od-timeline__dot" />
                    <span className="od-timeline__label">{s}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="od-cancelled">This order was cancelled.</p>
            )}

            <div className="od-grid">
              <section className="od-card">
                <div className="od-card__head">
                  <h2>Items ordered</h2>
                  <p>
                    {order.items.length} item{order.items.length === 1 ? '' : 's'}
                  </p>
                </div>
                <ul className="od-items">
                  {order.items.map((item) => (
                    <li key={item.id || item.productId}>
                      <div className="od-item__media">
                        <Image
                          src={item.image || '/images/aroma-variants.png'}
                          alt={item.productName}
                          width={96}
                          height={96}
                        />
                      </div>
                      <div className="od-item__info">
                        <h3>{item.productName}</h3>
                        {item.productSlug ? (
                          <Link href={`/shop/${item.productSlug}`}>View product</Link>
                        ) : null}
                        <p>
                          {formatINR(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <strong className="od-item__total">
                        {formatINR(item.price * item.quantity)}
                      </strong>
                    </li>
                  ))}
                </ul>
              </section>

              <div className="od-side">
                <section className="od-card">
                  <div className="od-card__head">
                    <h2>Delivery address</h2>
                  </div>
                  <div className="od-address">
                    <strong>{order.shippingName}</strong>
                    <p>{order.shippingPhone}</p>
                    <p>{order.shippingLine1}</p>
                    {order.shippingLine2 ? <p>{order.shippingLine2}</p> : null}
                    <p>
                      {order.shippingCity}, {order.shippingState} — {order.shippingPincode}
                    </p>
                  </div>
                </section>

                <section className="od-card">
                  <div className="od-card__head">
                    <h2>Payment summary</h2>
                  </div>
                  <div className="od-rows">
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
                    <div className="od-rows__total">
                      <span>Total paid / due</span>
                      <span>{formatINR(order.total)}</span>
                    </div>
                  </div>
                  <dl className="od-meta">
                    <div>
                      <dt>Method</dt>
                      <dd>{paymentLabel(order.paymentMethod)}</dd>
                    </div>
                    <div>
                      <dt>Payment status</dt>
                      <dd>{order.paymentStatus || 'PENDING'}</dd>
                    </div>
                    {order.razorpayPaymentId ? (
                      <div>
                        <dt>Razorpay payment ID</dt>
                        <dd className="od-mono">{order.razorpayPaymentId}</dd>
                      </div>
                    ) : null}
                    {order.razorpayOrderId ? (
                      <div>
                        <dt>Razorpay order ID</dt>
                        <dd className="od-mono">{order.razorpayOrderId}</dd>
                      </div>
                    ) : null}
                    {order.notes ? (
                      <div>
                        <dt>Order notes</dt>
                        <dd>{order.notes}</dd>
                      </div>
                    ) : null}
                  </dl>
                </section>

                <div className="od-actions">
                  <button
                    type="button"
                    className="od-btn od-btn--primary od-btn--full"
                    onClick={() => downloadInvoice(order, { email: user?.email })}
                  >
                    Download invoice PDF
                  </button>
                  <Link href="/shop" className="od-btn od-btn--ghost od-btn--full">
                    Continue shopping
                  </Link>
                  <Link href="/profile?tab=orders" className="od-link">
                    ← All orders
                  </Link>
                </div>
              </div>
            </div>

            <section className="od-help">
              <h2>Need help with this order?</h2>
              <p>
                Write to{' '}
                <a href="mailto:hello@shreejidivinearoma.com">hello@shreejidivinearoma.com</a>{' '}
                with your order number <strong>{order.orderNumber}</strong>.
              </p>
            </section>
          </>
        ) : null}
      </div>
      <Footer />
    </div>
  )
}
