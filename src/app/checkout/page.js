'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Script from 'next/script'
import ShopNav from '../../components/ShopNav'
import Footer from '../../components/Footer'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { formatINR } from '../../lib/products'
import { api } from '../../lib/api'
import '../ecom.css'
import './checkout.css'

function calcFee(subtotal, settings) {
  const fee = Math.max(0, Number(settings?.shippingFee) || 0)
  const minFree = Math.max(0, Number(settings?.freeShippingMinOrder) || 0)
  if (fee === 0) return 0
  if (minFree > 0 && subtotal >= minFree) return 0
  return fee
}

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
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY')
  const [acceptTerms, setAcceptTerms] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [activeItem, setActiveItem] = useState(0)
  const [couponInput, setCouponInput] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [shipSettings, setShipSettings] = useState({
    shippingFee: 0,
    freeShippingMinOrder: 0,
  })

  useEffect(() => {
    fetch('/api/shipping')
      .then((r) => r.json())
      .then((data) => setShipSettings(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?next=/checkout')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (!user) return
    setShipping((s) => ({
      ...s,
      fullName: s.fullName || user.name || '',
      phone: s.phone || user.phone || '',
    }))
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
        }
      })
      .catch(() => {})
  }, [user])

  useEffect(() => {
    setActiveItem(0)
  }, [items.length])

  useEffect(() => {
    setCoupon(null)
    setCouponError('')
  }, [subtotal])

  async function applyCoupon() {
    setCouponError('')
    setCouponLoading(true)
    try {
      const data = await api('/api/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code: couponInput, subtotal }),
      })
      setCoupon(data)
    } catch (err) {
      setCoupon(null)
      setCouponError(err.message)
    } finally {
      setCouponLoading(false)
    }
  }

  function removeCoupon() {
    setCoupon(null)
    setCouponInput('')
    setCouponError('')
  }

  async function placeCodOrder() {
    const data = await api('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shipping,
        paymentMethod: 'COD',
        notes,
        saveAddress,
        addressLabel: 'Home',
        couponCode: coupon?.code || '',
      }),
    })
    clearCart()
    router.push(`/profile/orders/${data.order.id}?placed=1`)
  }

  async function placeRazorpayOrder() {
    const payload = await api('/api/payments/razorpay/create', {
      method: 'POST',
      body: JSON.stringify({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shipping,
        notes,
        saveAddress,
        addressLabel: 'Home',
        couponCode: coupon?.code || '',
      }),
    })

    if (payload.freeOrder) {
      clearCart()
      router.push(`/profile/orders/${payload.orderId}?placed=1`)
      return
    }

    if (!window.Razorpay) {
      throw new Error('Razorpay checkout failed to load. Please refresh and try again.')
    }

    await new Promise((resolve, reject) => {
      const rzp = new window.Razorpay({
        key: payload.keyId,
        amount: payload.amount,
        currency: payload.currency,
        name: 'Shreeji Divine',
        description: `Order ${payload.orderNumber}`,
        order_id: payload.razorpayOrderId,
        prefill: {
          name: payload.customer?.name || '',
          email: payload.customer?.email || user?.email || '',
          contact: payload.customer?.contact || '',
        },
        theme: { color: '#2b1e16' },
        handler: async (response) => {
          try {
            const verified = await api('/api/payments/razorpay/verify', {
              method: 'POST',
              body: JSON.stringify({
                orderId: payload.orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            })
            clearCart()
            router.push(`/profile/orders/${verified.order.id}?placed=1`)
            resolve()
          } catch (err) {
            reject(err)
          }
        },
        modal: {
          ondismiss: () => reject(new Error('Payment cancelled')),
        },
      })
      rzp.on('payment.failed', (resp) => {
        reject(new Error(resp?.error?.description || 'Payment failed'))
      })
      rzp.open()
    })
  }

  async function placeOrder(e) {
    e.preventDefault()
    setError('')
    if (!acceptTerms) {
      setError('Please accept the terms to continue.')
      return
    }
    setSubmitting(true)
    try {
      if (paymentMethod === 'RAZORPAY') {
        await placeRazorpayOrder()
      } else {
        await placeCodOrder()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !ready) {
    return (
      <div className="ecom-page checkout-page">
        <ShopNav />
        <div className="empty-state">Loading checkout…</div>
      </div>
    )
  }

  if (!user) return null

  if (items.length === 0) {
    return (
      <div className="ecom-page checkout-page">
        <ShopNav />
        <div className="checkout-shell">
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

  const discount = coupon?.discount || 0
  const shippingFee = calcFee(subtotal, shipSettings)
  const total = Math.max(0, subtotal - discount) + shippingFee
  const current = items[Math.min(activeItem, items.length - 1)]
  const nameParts = (shipping.fullName || '').trim().split(/\s+/)
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ')

  function setNamePart(part, value) {
    if (part === 'first') {
      setShipping((s) => ({
        ...s,
        fullName: [value, lastName].filter(Boolean).join(' '),
      }))
    } else {
      setShipping((s) => ({
        ...s,
        fullName: [firstName, value].filter(Boolean).join(' '),
      }))
    }
  }

  return (
    <div className="ecom-page checkout-page">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <ShopNav />

      <div className="checkout-shell">
        <form className="checkout-board" onSubmit={placeOrder}>
          <div className="checkout-form-col">
            <header className="checkout-top">
              <Link href="/cart" className="checkout-back-btn" aria-label="Back to cart">
                ←
              </Link>
              <h1>Checkout</h1>
            </header>

            <section className="ck-section">
              <h2>
                <span>1</span> Contact information
              </h2>
              <div className="ck-grid-2">
                <div className="ck-field">
                  <label htmlFor="firstName">First name</label>
                  <input
                    id="firstName"
                    required
                    value={firstName}
                    onChange={(e) => setNamePart('first', e.target.value)}
                    autoComplete="given-name"
                  />
                </div>
                <div className="ck-field">
                  <label htmlFor="lastName">Last name</label>
                  <input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setNamePart('last', e.target.value)}
                    autoComplete="family-name"
                  />
                </div>
                <div className="ck-field">
                  <label htmlFor="phone">Phone</label>
                  <div className="ck-input-wrap">
                    <span className="ck-prefix">+91</span>
                    <input
                      id="phone"
                      required
                      value={shipping.phone}
                      onChange={(e) => setShipping((s) => ({ ...s, phone: e.target.value }))}
                      autoComplete="tel"
                      inputMode="tel"
                    />
                  </div>
                </div>
                <div className="ck-field">
                  <label htmlFor="email">E-mail</label>
                  <input id="email" type="email" value={user.email || ''} readOnly />
                </div>
              </div>
            </section>

            <section className="ck-section">
              <h2>
                <span>2</span> Delivery details
              </h2>

              <div className="ck-toggle-row" role="group" aria-label="Delivery method">
                <button type="button" className="ck-toggle is-active" disabled>
                  Delivery
                </button>
                <button type="button" className="ck-toggle" disabled title="Coming soon">
                  Store pickup
                </button>
              </div>

              {addresses.length > 0 ? (
                <div className="ck-field ck-field--full">
                  <label htmlFor="saved">Saved address</label>
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
                      Choose a saved address
                    </option>
                    {addresses.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.label} — {a.city}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div className="ck-grid-2">
                <div className="ck-field ck-field--full">
                  <label htmlFor="line1">Address</label>
                  <input
                    id="line1"
                    required
                    value={shipping.line1}
                    onChange={(e) => setShipping((s) => ({ ...s, line1: e.target.value }))}
                    placeholder="House / street / landmark"
                    autoComplete="address-line1"
                  />
                </div>
                <div className="ck-field ck-field--full">
                  <label htmlFor="line2">Address line 2 (optional)</label>
                  <input
                    id="line2"
                    value={shipping.line2}
                    onChange={(e) => setShipping((s) => ({ ...s, line2: e.target.value }))}
                    autoComplete="address-line2"
                  />
                </div>
                <div className="ck-field">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    required
                    value={shipping.city}
                    onChange={(e) => setShipping((s) => ({ ...s, city: e.target.value }))}
                    autoComplete="address-level2"
                  />
                </div>
                <div className="ck-field">
                  <label htmlFor="state">State</label>
                  <input
                    id="state"
                    required
                    value={shipping.state}
                    onChange={(e) => setShipping((s) => ({ ...s, state: e.target.value }))}
                    autoComplete="address-level1"
                  />
                </div>
                <div className="ck-field">
                  <label htmlFor="pincode">Zip code</label>
                  <input
                    id="pincode"
                    required
                    value={shipping.pincode}
                    onChange={(e) => setShipping((s) => ({ ...s, pincode: e.target.value }))}
                    autoComplete="postal-code"
                    inputMode="numeric"
                  />
                </div>
                <div className="ck-field">
                  <label htmlFor="notes">Notes (optional)</label>
                  <input
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Gift message / instructions"
                  />
                </div>
              </div>

              <label className="ck-check">
                <input
                  type="checkbox"
                  checked={saveAddress}
                  onChange={(e) => setSaveAddress(e.target.checked)}
                />
                Save this address for next time
              </label>
            </section>

            <section className="ck-section">
              <h2>
                <span>3</span> Payment method
              </h2>
              <div className="ck-pay-row">
                <button
                  type="button"
                  className={`ck-pay ${paymentMethod === 'RAZORPAY' ? 'is-active' : ''}`}
                  onClick={() => setPaymentMethod('RAZORPAY')}
                >
                  <strong>Online</strong>
                  <span>UPI / Card</span>
                </button>
                <button
                  type="button"
                  className={`ck-pay ${paymentMethod === 'COD' ? 'is-active' : ''}`}
                  onClick={() => setPaymentMethod('COD')}
                >
                  <strong>COD</strong>
                  <span>Pay on delivery</span>
                </button>
              </div>
            </section>
          </div>

          <aside className="checkout-order-col">
            <div className="ck-order-card">
              <h2>Order</h2>

              <div className="ck-product">
                <div className="ck-product__media">
                  <Image
                    src={current.image || '/images/aroma-variants.png'}
                    alt={current.name}
                    width={320}
                    height={280}
                    priority
                  />
                  {items.length > 1 ? (
                    <>
                      <button
                        type="button"
                        className="ck-nav ck-nav--prev"
                        aria-label="Previous item"
                        onClick={() =>
                          setActiveItem((i) => (i - 1 + items.length) % items.length)
                        }
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        className="ck-nav ck-nav--next"
                        aria-label="Next item"
                        onClick={() => setActiveItem((i) => (i + 1) % items.length)}
                      >
                        ›
                      </button>
                      <div className="ck-dots" aria-hidden="true">
                        {items.map((item, idx) => (
                          <span key={item.productId} className={idx === activeItem ? 'is-on' : ''} />
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>

                <div className="ck-product__body">
                  <h3>{current.name}</h3>
                  <p>
                    Qty {current.quantity}
                    {items.length > 1 ? ` · Item ${activeItem + 1} of ${items.length}` : ''}
                  </p>
                  <strong>{formatINR(current.price * current.quantity)}</strong>
                </div>
              </div>

              <div className="ck-breakdown">
                <div>
                  <span>Subtotal</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                <div>
                  <span>Shipping</span>
                  <span>{shippingFee === 0 ? 'Free' : formatINR(shippingFee)}</span>
                </div>
                {discount > 0 ? (
                  <div className="ck-discount">
                    <span>Coupon ({coupon.code})</span>
                    <span>−{formatINR(discount)}</span>
                  </div>
                ) : null}
                <div className="ck-total">
                  <span>Total</span>
                  <span>{formatINR(total)}</span>
                </div>
              </div>

              <div className="ck-coupon">
                <label htmlFor="coupon">Coupon code</label>
                {coupon ? (
                  <div className="ck-coupon__applied">
                    <span>
                      {coupon.code} · {coupon.message}
                    </span>
                    <button type="button" onClick={removeCoupon}>
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="ck-coupon__row">
                    <input
                      id="coupon"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      className="ck-coupon__btn"
                      disabled={couponLoading || !couponInput.trim()}
                      onClick={applyCoupon}
                    >
                      {couponLoading ? '…' : 'Apply'}
                    </button>
                  </div>
                )}
                {couponError ? <p className="ck-coupon__error">{couponError}</p> : null}
              </div>

              {error ? <p className="ck-error">{error}</p> : null}

              <button type="submit" className="ck-submit" disabled={submitting}>
                {submitting
                  ? paymentMethod === 'RAZORPAY'
                    ? 'Opening payment…'
                    : 'Placing order…'
                  : paymentMethod === 'RAZORPAY'
                    ? `Checkout · ${formatINR(total)} →`
                    : `Place COD order · ${formatINR(total)} →`}
              </button>

              <label className="ck-terms">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                />
                <span>
                  By confirming the order, I accept the terms of sale and privacy policy of
                  Shreeji Divine.
                </span>
              </label>
            </div>
          </aside>
        </form>
      </div>

      <Footer />
    </div>
  )
}
