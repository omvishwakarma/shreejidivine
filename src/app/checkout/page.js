'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ShopNav from '../../components/ShopNav'
import Footer from '../../components/Footer'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { formatINR, SHIPPING_FEE, FREE_SHIPPING_NOTE } from '../../lib/products'
import { api } from '../../lib/api'
import '../ecom.css'

const emptyShipping = {
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart, ready } = useCart()
  const { user, loading } = useAuth()
  const [shipping, setShipping] = useState(emptyShipping)
  const [addresses, setAddresses] = useState([])
  const [saveAddress, setSaveAddress] = useState(true)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?next=/checkout')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (!user) return
    api('/api/addresses')
      .then((data) => {
        setAddresses(data.addresses || [])
        const def = (data.addresses || []).find((a) => a.isDefault) || data.addresses?.[0]
        if (def) {
          setShipping({
            fullName: def.fullName,
            phone: def.phone,
            line1: def.line1,
            line2: def.line2 || '',
            city: def.city,
            state: def.state,
            pincode: def.pincode,
          })
        } else if (user.name) {
          setShipping((s) => ({ ...s, fullName: user.name, phone: user.phone || '' }))
        }
      })
      .catch(() => {})
  }, [user])

  async function placeOrder(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const data = await api('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          shipping,
          paymentMethod: 'COD',
          notes,
          saveAddress,
          addressLabel: 'Home',
        }),
      })
      clearCart()
      router.push(`/profile/orders/${data.order.id}?placed=1`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !ready) {
    return (
      <div className="ecom-page">
        <ShopNav />
        <div className="empty-state">Loading…</div>
      </div>
    )
  }

  if (!user) return null

  if (items.length === 0) {
    return (
      <div className="ecom-page">
        <ShopNav />
        <div className="ecom-wrap">
          <div className="empty-state">
            <p>Your cart is empty.</p>
            <Link href="/shop" className="btn-sm btn-primary">
              Go to Shop
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="ecom-page">
      <ShopNav />
      <div className="ecom-wrap">
        <header className="ecom-hero">
          <p className="section-label">Almost There</p>
          <h1 className="ecom-title">Checkout</h1>
          <p className="ecom-lead">{FREE_SHIPPING_NOTE}. Pay comfortably with Cash on Delivery.</p>
        </header>

        <form className="checkout-layout" onSubmit={placeOrder}>
          <div className="panel">
            <div className="panel-head">
              <h2>Shipping Address</h2>
              <p>Where should we deliver your divine package?</p>
            </div>

            {addresses.length > 0 ? (
              <div className="form-field" style={{ marginTop: '1.15rem' }}>
                <label htmlFor="saved">Use saved address</label>
                <select
                  id="saved"
                  onChange={(e) => {
                    const a = addresses.find((x) => x.id === e.target.value)
                    if (!a) return
                    setShipping({
                      fullName: a.fullName,
                      phone: a.phone,
                      line1: a.line1,
                      line2: a.line2 || '',
                      city: a.city,
                      state: a.state,
                      pincode: a.pincode,
                    })
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select address
                  </option>
                  {addresses.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label} — {a.city}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className="form-stack">
              <div className="form-row-2">
                <div className="form-field">
                  <label htmlFor="fullName">Full name</label>
                  <input
                    id="fullName"
                    required
                    value={shipping.fullName}
                    onChange={(e) => setShipping((s) => ({ ...s, fullName: e.target.value }))}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    required
                    value={shipping.phone}
                    onChange={(e) => setShipping((s) => ({ ...s, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="line1">Address line 1</label>
                <input
                  id="line1"
                  required
                  value={shipping.line1}
                  onChange={(e) => setShipping((s) => ({ ...s, line1: e.target.value }))}
                />
              </div>
              <div className="form-field">
                <label htmlFor="line2">Address line 2 (optional)</label>
                <input
                  id="line2"
                  value={shipping.line2}
                  onChange={(e) => setShipping((s) => ({ ...s, line2: e.target.value }))}
                />
              </div>

              <div className="form-row-2">
                <div className="form-field">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    required
                    value={shipping.city}
                    onChange={(e) => setShipping((s) => ({ ...s, city: e.target.value }))}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="state">State</label>
                  <input
                    id="state"
                    required
                    value={shipping.state}
                    onChange={(e) => setShipping((s) => ({ ...s, state: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="pincode">PIN code</label>
                <input
                  id="pincode"
                  required
                  value={shipping.pincode}
                  onChange={(e) => setShipping((s) => ({ ...s, pincode: e.target.value }))}
                />
              </div>

              <div className="form-field">
                <label htmlFor="notes">Order notes (optional)</label>
                <textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Delivery instructions, gift message…"
                />
              </div>

              <label className="form-check">
                <input
                  type="checkbox"
                  checked={saveAddress}
                  onChange={(e) => setSaveAddress(e.target.checked)}
                />
                Save this address to my profile for next time
              </label>
            </div>
          </div>

          <aside className="summary-box">
            <h2>Payment &amp; Total</h2>
            <p className="summary-box__note">Cash on Delivery (COD) — pay when your order arrives.</p>
            {items.map((i) => (
              <div className="summary-row" key={i.productId}>
                <span>
                  {i.name} × {i.quantity}
                </span>
                <span>{formatINR(i.price * i.quantity)}</span>
              </div>
            ))}
            <div className="summary-row">
              <span>Shipping</span>
              <span>{SHIPPING_FEE === 0 ? 'Free' : formatINR(SHIPPING_FEE)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatINR(subtotal + SHIPPING_FEE)}</span>
            </div>
            {error ? <p className="form-error">{error}</p> : null}
            <button type="submit" className="btn-sm btn-primary btn-full" disabled={submitting}>
              {submitting ? 'Placing order…' : 'Place Order'}
            </button>
            <Link href="/cart" className="btn-sm btn-ghost btn-full">
              Back to Cart
            </Link>
          </aside>
        </form>
      </div>
      <Footer />
    </div>
  )
}
