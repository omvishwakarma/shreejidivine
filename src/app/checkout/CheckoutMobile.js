'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { discountPct, formatINR } from '../../lib/products'
import { checkoutFieldErrors } from './checkoutValidation'

const STEPS = [
  { id: 'address', label: 'Address' },
  { id: 'summary', label: 'Order Summary' },
  { id: 'payment', label: 'Payment' },
]

function formatAddress(shipping) {
  return [shipping.line1, shipping.line2, [shipping.city, shipping.pincode].filter(Boolean).join(' '), shipping.state]
    .map((part) => String(part || '').trim())
    .filter(Boolean)
    .join(', ')
}

export default function CheckoutMobile({
  user,
  items,
  updateQty,
  shipping,
  setShipping,
  addresses,
  selectedAddressId,
  onSelectAddress,
  saveAddress,
  setSaveAddress,
  notes,
  setNotes,
  paymentMethod,
  codEnabled = true,
  setPaymentMethod,
  couponInput,
  setCouponInput,
  coupon,
  couponError,
  couponLoading,
  applyCoupon,
  removeCoupon,
  acceptTerms,
  setAcceptTerms,
  error,
  fieldErrors,
  setFieldErrors,
  submitting,
  subtotal,
  discount,
  rewardOffers = [],
  shippingFee,
  total,
  placeOrder,
  onLeave,
}) {
  const [step, setStep] = useState(() =>
    selectedAddressId && Object.keys(checkoutFieldErrors(shipping)).length === 0
      ? 'summary'
      : 'address'
  )
  const [compareById, setCompareById] = useState({})

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

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [step])

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        const map = {}
        for (const product of data.products || []) {
          const compareAt = Number(product.compareAt) || 0
          if (compareAt > 0) map[product.id] = compareAt
        }
        setCompareById(map)
      })
      .catch(() => {})
  }, [])

  const currentIndex = STEPS.findIndex((item) => item.id === step)
  const selectedAddress = addresses.find((item) => item.id === selectedAddressId)
  const mrpTotal = items.reduce((sum, item) => {
    const compareAt = compareById[item.productId] || 0
    const unit = compareAt > item.price ? compareAt : item.price
    return sum + unit * item.quantity
  }, 0)
  const rewardDiscount = rewardOffers.reduce((sum, offer) => sum + offer.off, 0)
  const saveAmount = Math.max(0, mrpTotal - subtotal) + discount + rewardDiscount
  const title = STEPS[currentIndex]?.label || 'Checkout'

  function clearField(key) {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev
      const nextErrors = { ...prev }
      delete nextErrors[key]
      return nextErrors
    })
  }

  function goTo(next) {
    if (next !== 'address') {
      const errors = checkoutFieldErrors(shipping)
      setFieldErrors(errors)
      if (Object.keys(errors).length) {
        setStep('address')
        return
      }
    }
    setStep(next)
  }

  function onBack() {
    if (step === 'payment') setStep('summary')
    else if (step === 'summary') setStep('address')
    else onLeave()
  }

  function onContinue() {
    if (step === 'address') {
      goTo('summary')
      return
    }
    if (step === 'summary') {
      goTo('payment')
      return
    }
    const errors = checkoutFieldErrors(shipping)
    if (Object.keys(errors).length) {
      setFieldErrors(errors)
      setStep('address')
      return
    }
    placeOrder({ preventDefault() {} })
  }

  const continueLabel = submitting
    ? paymentMethod === 'RAZORPAY'
      ? 'Opening…'
      : 'Placing…'
    : 'Continue'

  return (
    <div className="ck-m">
      <header className="ck-m__bar">
        <button type="button" className="ck-m__back" onClick={onBack} aria-label="Back">
          ←
        </button>
        <h1>{title}</h1>
      </header>

      <ol className="ck-m__steps">
        {STEPS.map((item, index) => {
          const done = index < currentIndex
          const active = index === currentIndex
          return (
            <li key={item.id} className={done ? 'is-done' : active ? 'is-active' : ''}>
              <button
                type="button"
                disabled={index > currentIndex}
                onClick={() => goTo(item.id)}
              >
                <span className="ck-m__dot" aria-hidden="true">
                  {done ? '✓' : index + 1}
                </span>
                <span>{item.label}</span>
              </button>
            </li>
          )
        })}
      </ol>

      {step === 'address' ? (
        <div className="ck-m__pane">
          <section className="ck-section">
            <h2>Contact</h2>
            <div className="ck-grid-2">
              <div className="ck-field">
                <label htmlFor="m-first">First name</label>
                <input
                  id="m-first"
                  value={firstName}
                  aria-invalid={Boolean(fieldErrors.firstName)}
                  className={fieldErrors.firstName ? 'is-invalid' : ''}
                  onChange={(e) => {
                    setNamePart('first', e.target.value)
                    clearField('firstName')
                  }}
                  autoComplete="given-name"
                />
                {fieldErrors.firstName ? (
                  <p className="ck-field__error">{fieldErrors.firstName}</p>
                ) : null}
              </div>
              <div className="ck-field">
                <label htmlFor="m-last">Last name</label>
                <input
                  id="m-last"
                  value={lastName}
                  onChange={(e) => setNamePart('last', e.target.value)}
                  autoComplete="family-name"
                />
              </div>
              <div className="ck-field">
                <label htmlFor="m-phone">
                  Phone <span className="ck-req">*</span>
                </label>
                <div className={`ck-input-wrap${fieldErrors.phone ? ' is-invalid' : ''}`}>
                  <span className="ck-prefix">+91</span>
                  <input
                    id="m-phone"
                    value={shipping.phone}
                    required
                    aria-required="true"
                    aria-invalid={Boolean(fieldErrors.phone)}
                    onChange={(e) => {
                      setShipping((s) => ({ ...s, phone: e.target.value }))
                      clearField('phone')
                    }}
                    autoComplete="tel"
                    inputMode="tel"
                  />
                </div>
                {fieldErrors.phone ? <p className="ck-field__error">{fieldErrors.phone}</p> : null}
              </div>
              <div className="ck-field">
                <label htmlFor="m-email">E-mail</label>
                <input id="m-email" type="email" value={user.email || ''} readOnly />
              </div>
            </div>
          </section>

          <section className="ck-section">
            <h2>Delivery address</h2>
            {addresses.length > 0 ? (
              <div className="ck-field ck-field--full">
                <label htmlFor="m-saved">Saved address</label>
                <select id="m-saved" value={selectedAddressId} onChange={onSelectAddress}>
                  <option value="">Enter a new address</option>
                  {addresses.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label} — {item.city}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            <div className="ck-grid-2">
              <div className="ck-field ck-field--full">
                <label htmlFor="m-line1">Address</label>
                <input
                  id="m-line1"
                  value={shipping.line1}
                  aria-invalid={Boolean(fieldErrors.line1)}
                  className={fieldErrors.line1 ? 'is-invalid' : ''}
                  onChange={(e) => {
                    setShipping((s) => ({ ...s, line1: e.target.value }))
                    clearField('line1')
                  }}
                  placeholder="House / street / landmark"
                  autoComplete="address-line1"
                />
                {fieldErrors.line1 ? <p className="ck-field__error">{fieldErrors.line1}</p> : null}
              </div>
              <div className="ck-field ck-field--full">
                <label htmlFor="m-line2">Address line 2 (optional)</label>
                <input
                  id="m-line2"
                  value={shipping.line2}
                  onChange={(e) => setShipping((s) => ({ ...s, line2: e.target.value }))}
                  autoComplete="address-line2"
                />
              </div>
              <div className="ck-field">
                <label htmlFor="m-city">City</label>
                <input
                  id="m-city"
                  value={shipping.city}
                  aria-invalid={Boolean(fieldErrors.city)}
                  className={fieldErrors.city ? 'is-invalid' : ''}
                  onChange={(e) => {
                    setShipping((s) => ({ ...s, city: e.target.value }))
                    clearField('city')
                  }}
                  autoComplete="address-level2"
                />
                {fieldErrors.city ? <p className="ck-field__error">{fieldErrors.city}</p> : null}
              </div>
              <div className="ck-field">
                <label htmlFor="m-state">State</label>
                <input
                  id="m-state"
                  value={shipping.state}
                  aria-invalid={Boolean(fieldErrors.state)}
                  className={fieldErrors.state ? 'is-invalid' : ''}
                  onChange={(e) => {
                    setShipping((s) => ({ ...s, state: e.target.value }))
                    clearField('state')
                  }}
                  autoComplete="address-level1"
                />
                {fieldErrors.state ? <p className="ck-field__error">{fieldErrors.state}</p> : null}
              </div>
              <div className="ck-field">
                <label htmlFor="m-pin">Zip code</label>
                <input
                  id="m-pin"
                  value={shipping.pincode}
                  aria-invalid={Boolean(fieldErrors.pincode)}
                  className={fieldErrors.pincode ? 'is-invalid' : ''}
                  onChange={(e) => {
                    setShipping((s) => ({ ...s, pincode: e.target.value }))
                    clearField('pincode')
                  }}
                  autoComplete="postal-code"
                  inputMode="numeric"
                />
                {fieldErrors.pincode ? (
                  <p className="ck-field__error">{fieldErrors.pincode}</p>
                ) : null}
              </div>
              <div className="ck-field">
                <label htmlFor="m-notes">Notes (optional)</label>
                <input
                  id="m-notes"
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
        </div>
      ) : null}

      {step === 'summary' ? (
        <div className="ck-m__pane">
          <section className="ck-m__block">
            <div className="ck-m__deliver-top">
              <p>Deliver to:</p>
              <button type="button" className="ck-m__change" onClick={() => goTo('address')}>
                Change
              </button>
            </div>
            <p className="ck-m__who">
              <strong>{shipping.fullName}</strong>
              {selectedAddress?.label ? <span>{selectedAddress.label}</span> : null}
            </p>
            <p className="ck-m__addr">{formatAddress(shipping)}</p>
            <p className="ck-m__phone">{shipping.phone}</p>
          </section>

          <section className="ck-m__block ck-m__items">
            {items.map((item) => {
              const compareAt = compareById[item.productId] || 0
              const off = discountPct(item.price, compareAt)
              const variant = [
                item.colour,
                item.fragrance,
              ]
                .filter(Boolean)
                .join(' · ')
              return (
                <article key={item.lineKey || item.productId} className="ck-m__item">
                  <div className="ck-m__thumb">
                    <Image
                      src={item.image || '/images/aroma-variants.png'}
                      alt={item.name}
                      width={88}
                      height={88}
                    />
                  </div>
                  <div>
                    <h2>{item.name}</h2>
                    {variant ? <p className="ck-m__variant">{variant}</p> : null}
                    {Number(item.price) > 0 ? (
                      <label className="ck-m__qty">
                        Qty:
                        <select
                          aria-label={`Quantity for ${item.name}`}
                          value={item.quantity}
                          onChange={(e) =>
                            updateQty(item.lineKey || item.productId, Number(e.target.value))
                          }
                        >
                          {Array.from({ length: 20 }, (_, index) => index + 1).map((qty) => (
                            <option key={qty} value={qty}>
                              {qty}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : (
                      <p className="ck-m__qty">Qty: 1</p>
                    )}
                    <p className="ck-m__price">
                      {off > 0 ? <span className="ck-m__off">{off}% off</span> : null}
                      {off > 0 ? <s>{formatINR(compareAt)}</s> : null}
                      <strong>{formatINR(item.price)}</strong>
                    </p>
                  </div>
                </article>
              )
            })}
          </section>

          <section className="ck-m__block">
            <h2 className="ck-m__h">Price details</h2>
            <div className="ck-m__rows">
              <div>
                <span>Price (incl. of all taxes)</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              {discount > 0 ? (
                <div className="is-save">
                  <span>Coupon ({coupon.code})</span>
                  <span>−{formatINR(discount)}</span>
                </div>
              ) : null}
              {rewardOffers.map((offer) => (
                <div key={offer.label} className="is-save">
                  <span>{offer.label}</span>
                  <span>−{formatINR(offer.off)}</span>
                </div>
              ))}
              <div>
                <span>Shipping</span>
                <span className={shippingFee === 0 ? 'is-free' : ''}>
                  {shippingFee === 0 ? 'Free' : formatINR(shippingFee)}
                </span>
              </div>
            </div>

            <div className="ck-coupon">
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
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Coupon code"
                    aria-label="Coupon code"
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

            {saveAmount > 0 ? (
              <p className="ck-m__save">You&apos;ll save {formatINR(saveAmount)} on this order</p>
            ) : null}
          </section>
        </div>
      ) : null}

      {step === 'payment' ? (
        <div className="ck-m__pane">
          <section className="ck-section">
            <h2>Payment method</h2>
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
                  <strong>Cash on delivery</strong>
                  <span>Pay when the order arrives</span>
                </button>
              ) : null}
            </div>
            <label className="ck-terms">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => {
                  setAcceptTerms(e.target.checked)
                  clearField('terms')
                }}
              />
              <span>
                By confirming the order, I accept the{' '}
                <Link href="/policies">policies</Link> of Shreeji Divine.
              </span>
            </label>
            {fieldErrors.terms ? <p className="ck-field__error">{fieldErrors.terms}</p> : null}
          </section>
        </div>
      ) : null}

      {error ? (
        <p className="ck-m__error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="ck-m__dock">
        <div className="ck-m__due">
          <strong>{formatINR(total)}</strong>
        </div>
        <button type="button" className="ck-m__go" disabled={submitting} onClick={onContinue}>
          {continueLabel}
        </button>
      </div>
    </div>
  )
}
