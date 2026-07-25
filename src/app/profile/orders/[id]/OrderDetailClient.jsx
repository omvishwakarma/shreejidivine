'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import ShopNav from '../../../../components/ShopNav'
import Footer from '../../../../components/Footer'
import { useAuth } from '../../../../context/AuthContext'
import { formatINR } from '../../../../lib/products'
import { api } from '../../../../lib/api'
import '../../../ecom.css'

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

  if (loading || (!order && !error)) {
    return (
      <div className="ecom-page">
        <ShopNav />
        <div className="empty-state">Loading order…</div>
      </div>
    )
  }

  return (
    <div className="ecom-page">
      <ShopNav />
      <div className="ecom-wrap">
        <p className="breadcrumb">
          <Link href="/profile?tab=orders">Orders</Link>
          <span aria-hidden="true"> / </span>
          Detail
        </p>

        {placed ? (
          <p className="form-ok" style={{ marginBottom: '1.25rem' }}>
            Order placed successfully. Pay on delivery when your package arrives.
          </p>
        ) : null}

        {error ? (
          <div className="empty-state">{error}</div>
        ) : (
          <>
            <header className="ecom-hero" style={{ textAlign: 'left', marginInline: 0, maxWidth: 'none' }}>
              <p className="section-label">Order</p>
              <h1 className="ecom-title">{order.orderNumber}</h1>
              <p className="ecom-lead">
                <span className="order-status">{order.status}</span>
                <span style={{ marginLeft: '0.75rem' }}>
                  {new Date(order.createdAt).toLocaleString('en-IN')} · {order.paymentMethod}
                </span>
              </p>
            </header>

            <div className="checkout-layout">
              <div className="panel">
                <div className="panel-head">
                  <h2>Items</h2>
                  <p>{order.items.length} product{order.items.length > 1 ? 's' : ''} in this order</p>
                </div>
                {order.items.map((item) => (
                  <div key={item.id} className="cart-line">
                    <Image src={item.image} alt={item.productName} width={100} height={100} />
                    <div>
                      <h3>{item.productName}</h3>
                      <p className="cart-line__meta">
                        {formatINR(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <div className="cart-line__right">
                      <strong>{formatINR(item.price * item.quantity)}</strong>
                    </div>
                  </div>
                ))}
              </div>

              <aside className="summary-box">
                <h2>Delivery</h2>
                <p className="summary-box__note" style={{ lineHeight: 1.6 }}>
                  <strong style={{ color: 'var(--gold-light)' }}>{order.shippingName}</strong>
                  <br />
                  {order.shippingPhone}
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
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>{formatINR(order.subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>{order.shipping === 0 ? 'Free' : formatINR(order.shipping)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>{formatINR(order.total)}</span>
                </div>
                <Link href="/shop" className="btn-sm btn-primary btn-full">
                  Shop Again
                </Link>
                <Link href="/profile?tab=orders" className="btn-sm btn-ghost btn-full">
                  All Orders
                </Link>
              </aside>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}
