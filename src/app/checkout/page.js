'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Script from 'next/script'
import ShopNav from '../../components/ShopNav'
import Footer from '../../components/Footer'
import CheckoutMobile from './CheckoutMobile'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { formatINR } from '../../lib/products'
import { api } from '../../lib/api'
import '../ecom.css'
import './checkout.css'
import { checkoutFieldErrors } from './checkoutValidation'
import { applyCartRewards, shippingFeeFor } from '../../lib/cartRewards'
import { purchaseMeta, trackMeta } from '../../lib/meta'

function CheckoutSkeleton({ mobileOnly = false }) {
  const mobile = (
    <div className="ck-skel-mobile" aria-hidden="true">
      <div className="ck-skel-mobile__bar">
        <span className="skel ck-skel-mobile__back" />
        <span className="skel ck-skel-mobile__title" />
      </div>
      <div className="ck-skel-mobile__steps">
        {Array.from({ length: 3 }).map((_, i) => (
          <span key={i} className="ck-skel-mobile__step">
            <span className="skel ck-skel-mobile__dot" />
            <span className="skel ck-skel-mobile__label" />
          </span>
        ))}
      </div>
      <div className="ck-skel-mobile__block">
        <span className="skel ck-skel-line" />
        <span className="skel ck-skel-line ck-skel-line--mid" />
        <span className="skel ck-skel-line ck-skel-line--long" />
      </div>
      <div className="ck-skel-mobile__item">
        <span className="skel ck-skel-mobile__thumb" />
        <span className="ck-skel-mobile__copy">
          <span className="skel ck-skel-line ck-skel-line--mid" />
          <span className="skel ck-skel-line ck-skel-line--short" />
          <span className="skel ck-skel-line ck-skel-line--price" />
        </span>
      </div>
      <div className="ck-skel-mobile__block">
        <span className="skel ck-skel-line ck-skel-line--short" />
        <span className="skel ck-skel-line" />
        <span className="skel ck-skel-line" />
        <span className="skel ck-skel-mobile__save" />
      </div>
      <div className="ck-skel-mobile__dock">
        <span className="skel ck-skel-mobile__due" />
        <span className="skel ck-skel-mobile__go" />
      </div>
    </div>
  )

  if (mobileOnly) {
    return (
      <div className="ecom-page checkout-page checkout-page--mobile" aria-busy="true" aria-label="Loading checkout">
        {mobile}
      </div>
    )
  }

  return (
    <div className="ecom-page checkout-page ck-skel-page" aria-busy="true" aria-label="Loading checkout">
      <ShopNav />
      <div className="checkout-shell ck-skel-desk">
        <div className="checkout-board">
          <div className="checkout-form-col">
            <div className="ck-skel-desk__top">
              <span className="skel ck-skel-desk__back" />
              <span className="skel ck-skel-desk__heading" />
            </div>
            {Array.from({ length: 2 }).map((_, section) => (
              <section key={section} className="ck-section ck-skel-desk__card">
                <span className="skel ck-skel-line ck-skel-line--short" />
                <div className="ck-skel-desk__grid">
                  {Array.from({ length: 4 }).map((_, field) => (
                    <span key={field} className="skel ck-skel-desk__field" />
                  ))}
                </div>
              </section>
            ))}
          </div>
          <aside className="ck-skel-desk__order">
            <span className="skel ck-skel-desk__photo" />
            <span className="skel ck-skel-line ck-skel-line--mid" />
            <span className="skel ck-skel-line ck-skel-line--short" />
            <span className="skel ck-skel-line" />
            <span className="skel ck-skel-desk__btn" />
          </aside>
        </div>
      </div>
      {mobile}
    </div>
  )
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
  const { items, subtotal, clearCart, ready, updateQty } = useCart()
  const { user, loading } = useAuth()
  const [shipping, setShipping] = useState(emptyShipping)
  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [saveAddress, setSaveAddress] = useState(true)
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY')
  const [acceptTerms, setAcceptTerms] = useState(true)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [activeItem, setActiveItem] = useState(0)
  const [couponInput, setCouponInput] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const checkoutTracked = useRef(false)
  const [shipSettings, setShipSettings] = useState({
    shippingFee: 0,
    freeShippingMinOrder: 0,
  })
  const [isMobile, setIsMobile] = useState(null)
  const [addressesReady, setAddressesReady] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(max-width: 760px)')
    const apply = () => setIsMobile(query.matches)
    apply()
    query.addEventListener('change', apply)
    return () => query.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    fetch('/api/shipping')
      .then((r) => r.json())
      .then((data) => setShipSettings(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (shipSettings?.codEnabled === false) setPaymentMethod('RAZORPAY')
  }, [shipSettings])

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
          setSelectedAddressId(def.id)
          setSaveAddress(false)
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
      .finally(() => setAddressesReady(true))
  }, [user])

  useEffect(() => {
    setActiveItem(0)
  }, [items.length])

  useEffect(() => {
    setCoupon(null)
    setCouponError('')
  }, [subtotal])

  useEffect(() => {
    if (!ready || !items.length || checkoutTracked.current) return
    checkoutTracked.current = true
    trackMeta('InitiateCheckout', {
      content_ids: items.map((item) => String(item.productId)),
      content_type: 'product',
      contents: items.map((item) => ({
        id: String(item.productId),
        quantity: item.quantity,
      })),
      num_items: items.reduce((sum, item) => sum + item.quantity, 0),
      value: subtotal,
      currency: 'INR',
    })
  }, [ready, items, subtotal])

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
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          colour: i.colour || '',
          fragrance: i.fragrance || '',
        })),
        shipping,
        paymentMethod: 'COD',
        notes,
        saveAddress: Boolean(saveAddress && !selectedAddressId),
        addressLabel: 'Home',
        couponCode: coupon?.code || '',
      }),
    })
    trackMeta('Purchase', purchaseMeta(items, data.order?.total))
    clearCart()
    router.push(`/profile/orders/${data.order.id}?placed=1`)
  }

  async function placeRazorpayOrder() {
    const payload = await api('/api/payments/razorpay/create', {
      method: 'POST',
      body: JSON.stringify({
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          colour: i.colour || '',
          fragrance: i.fragrance || '',
        })),
        shipping,
        notes,
        saveAddress: Boolean(saveAddress && !selectedAddressId),
        addressLabel: 'Home',
        couponCode: coupon?.code || '',
      }),
    })

    if (payload.freeOrder) {
      trackMeta('Purchase', purchaseMeta(items, payload.order?.total))
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
            trackMeta('Purchase', purchaseMeta(items, verified.order?.total))
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

  function clearCheckoutField(key) {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev
      const nextErrors = { ...prev }
      delete nextErrors[key]
      return nextErrors
    })
  }

  async function placeOrder(e) {
    e.preventDefault()
    setError('')
    const nextErrors = checkoutFieldErrors(shipping)
    if (!acceptTerms) nextErrors.terms = 'Please accept the terms to continue.'
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
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

  function selectAddress(e) {
    const id = e.target.value
    setSelectedAddressId(id)
    if (!id) {
      setSaveAddress(true)
      setShipping((s) => ({
        ...emptyShipping,
        fullName: s.fullName || user?.name || '',
        phone: s.phone || user?.phone || '',
      }))
      return
    }
    const match = addresses.find((item) => item.id === id)
    if (!match) return
    setSaveAddress(false)
    setShipping({
      fullName: match.fullName,
      phone: match.phone,
      line1: match.line1,
      line2: match.line2 || '',
      city: match.city,
      state: match.state,
      pincode: match.pincode,
    })
  }

  if (loading || !ready || isMobile === null) {
    return <CheckoutSkeleton />
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
  const rewards = applyCartRewards(
    subtotal,
    shipSettings.cartRewards,
    Math.max(0, subtotal - discount)
  )
  const codEnabled = shipSettings?.codEnabled !== false
  const shippingFee = shippingFeeFor(subtotal, shipSettings)
  const total = Math.max(0, subtotal - discount - rewards.discount) + shippingFee

  if (isMobile && !addressesReady) {
    return <CheckoutSkeleton mobileOnly />
  }

  if (isMobile) {
    return (
      <div className="ecom-page checkout-page checkout-page--mobile">
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        <CheckoutMobile
          user={user}
          items={items}
          updateQty={updateQty}
          shipping={shipping}
          setShipping={setShipping}
          addresses={addresses}
          selectedAddressId={selectedAddressId}
          onSelectAddress={selectAddress}
          saveAddress={saveAddress}
          setSaveAddress={setSaveAddress}
          notes={notes}
          setNotes={setNotes}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          codEnabled={codEnabled}
          couponInput={couponInput}
          setCouponInput={setCouponInput}
          coupon={coupon}
          couponError={couponError}
          couponLoading={couponLoading}
          applyCoupon={applyCoupon}
          removeCoupon={removeCoupon}
          acceptTerms={acceptTerms}
          setAcceptTerms={setAcceptTerms}
          error={error}
          setError={setError}
          fieldErrors={fieldErrors}
          setFieldErrors={setFieldErrors}
          submitting={submitting}
          subtotal={subtotal}
          discount={discount}
          rewardOffers={rewards.offers}
          shippingFee={shippingFee}
          total={total}
          placeOrder={placeOrder}
          onLeave={() => router.push('/cart')}
        />
      </div>
    )
  }

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
        <form className="checkout-board" onSubmit={placeOrder} noValidate>
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
                    value={firstName}
                    aria-invalid={Boolean(fieldErrors.firstName)}
                    className={fieldErrors.firstName ? 'is-invalid' : ''}
                    onChange={(e) => {
                      setNamePart('first', e.target.value)
                      clearCheckoutField('firstName')
                    }}
                    autoComplete="given-name"
                  />
                  {fieldErrors.firstName ? (
                    <p className="ck-field__error">{fieldErrors.firstName}</p>
                  ) : null}
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
                  <label htmlFor="phone">
                    Phone <span className="ck-req">*</span>
                  </label>
                  <div className={`ck-input-wrap${fieldErrors.phone ? ' is-invalid' : ''}`}>
                    <span className="ck-prefix">+91</span>
                    <input
                      id="phone"
                      value={shipping.phone}
                      required
                      aria-required="true"
                      aria-invalid={Boolean(fieldErrors.phone)}
                      onChange={(e) => {
                        setShipping((s) => ({ ...s, phone: e.target.value }))
                        clearCheckoutField('phone')
                      }}
                      autoComplete="tel"
                      inputMode="tel"
                    />
                  </div>
                  {fieldErrors.phone ? <p className="ck-field__error">{fieldErrors.phone}</p> : null}
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

              {addresses.length > 0 ? (
                <div className="ck-field ck-field--full">
                  <label htmlFor="saved">Saved address</label>
                  <select
                    id="saved"
                    value={selectedAddressId}
                    onChange={selectAddress}
                  >
                    <option value="">Enter a new address</option>
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
                    value={shipping.line1}
                    aria-invalid={Boolean(fieldErrors.line1)}
                    className={fieldErrors.line1 ? 'is-invalid' : ''}
                    onChange={(e) => {
                      setShipping((s) => ({ ...s, line1: e.target.value }))
                      clearCheckoutField('line1')
                    }}
                    placeholder="House / street / landmark"
                    autoComplete="address-line1"
                  />
                  {fieldErrors.line1 ? <p className="ck-field__error">{fieldErrors.line1}</p> : null}
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
                    value={shipping.city}
                    aria-invalid={Boolean(fieldErrors.city)}
                    className={fieldErrors.city ? 'is-invalid' : ''}
                    onChange={(e) => {
                      setShipping((s) => ({ ...s, city: e.target.value }))
                      clearCheckoutField('city')
                    }}
                    autoComplete="address-level2"
                  />
                  {fieldErrors.city ? <p className="ck-field__error">{fieldErrors.city}</p> : null}
                </div>
                <div className="ck-field">
                  <label htmlFor="state">State</label>
                  <input
                    id="state"
                    value={shipping.state}
                    aria-invalid={Boolean(fieldErrors.state)}
                    className={fieldErrors.state ? 'is-invalid' : ''}
                    onChange={(e) => {
                      setShipping((s) => ({ ...s, state: e.target.value }))
                      clearCheckoutField('state')
                    }}
                    autoComplete="address-level1"
                  />
                  {fieldErrors.state ? <p className="ck-field__error">{fieldErrors.state}</p> : null}
                </div>
                <div className="ck-field">
                  <label htmlFor="pincode">Zip code</label>
                  <input
                    id="pincode"
                    value={shipping.pincode}
                    aria-invalid={Boolean(fieldErrors.pincode)}
                    className={fieldErrors.pincode ? 'is-invalid' : ''}
                    onChange={(e) => {
                      setShipping((s) => ({ ...s, pincode: e.target.value }))
                      clearCheckoutField('pincode')
                    }}
                    autoComplete="postal-code"
                    inputMode="numeric"
                  />
                  {fieldErrors.pincode ? (
                    <p className="ck-field__error">{fieldErrors.pincode}</p>
                  ) : null}
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

              {!selectedAddressId ? (
                <label className="ck-check">
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                  />
                  Save this address for next time
                </label>
              ) : null}
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
                {codEnabled ? (
                  <button
                    type="button"
                    className={`ck-pay ${paymentMethod === 'COD' ? 'is-active' : ''}`}
                    onClick={() => setPaymentMethod('COD')}
                  >
                    <strong>COD</strong>
                    <span>Pay on delivery</span>
                  </button>
                ) : null}
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
                          <span
                            key={item.lineKey || item.productId}
                            className={idx === activeItem ? 'is-on' : ''}
                          />
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>

                <div className="ck-product__body">
                  <h3>{current.name}</h3>
                  {current.colour || current.fragrance ? (
                    <p>
                      {[
                        current.colour && `Colour: ${current.colour}`,
                        current.fragrance && `Fragrance: ${current.fragrance}`,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  ) : null}
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
                {rewards.offers.map((offer) => (
                  <div key={offer.label} className="ck-discount">
                    <span>{offer.label}</span>
                    <span>−{formatINR(offer.off)}</span>
                  </div>
                ))}
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
                  onChange={(e) => {
                    setAcceptTerms(e.target.checked)
                    clearCheckoutField('terms')
                  }}
                />
                <span>
                  By confirming the order, I accept the{' '}
                  <Link href="/policies">policies</Link> of Shreeji Divine.
                </span>
              </label>
              {fieldErrors.terms ? <p className="ck-field__error">{fieldErrors.terms}</p> : null}
            </div>
          </aside>
        </form>
      </div>

      <Footer />
    </div>
  )
}
