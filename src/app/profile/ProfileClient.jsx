'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import ShopNav from '../../components/ShopNav'
import Footer from '../../components/Footer'
import { useAuth } from '../../context/AuthContext'
import { formatINR } from '../../lib/products'
import '../ecom.css'

export default function ProfileClient() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const search = useSearchParams()
  const tab = search.get('tab') || 'orders'
  const [orders, setOrders] = useState([])
  const [addresses, setAddresses] = useState([])
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [addrForm, setAddrForm] = useState({
    label: 'Home',
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: true,
  })

  useEffect(() => {
    if (!loading && !user) router.replace('/login?next=/profile')
  }, [loading, user, router])

  useEffect(() => {
    if (!user) return
    fetch('/api/orders')
      .then((r) => (r.ok ? r.json() : { orders: [] }))
      .then((d) => setOrders(d.orders || []))
      .catch(() => {})
    fetch('/api/addresses')
      .then((r) => (r.ok ? r.json() : { addresses: [] }))
      .then((d) => setAddresses(d.addresses || []))
      .catch(() => {})
    setAddrForm((f) => ({
      ...f,
      fullName: user.name || '',
      phone: user.phone || '',
    }))
  }, [user])

  async function saveAddress(e) {
    e.preventDefault()
    setError('')
    setMsg('')
    const res = await fetch('/api/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addrForm),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Failed')
      return
    }
    setAddresses((prev) => [data.address, ...prev])
    setMsg('Address saved')
  }

  async function removeAddress(id) {
    const res = await fetch(`/api/addresses/${id}`, { method: 'DELETE' })
    if (res.ok) setAddresses((prev) => prev.filter((a) => a.id !== id))
  }

  if (loading || !user) {
    return (
      <div className="ecom-page">
        <ShopNav />
        <div className="empty-state">Loading…</div>
      </div>
    )
  }

  return (
    <div className="ecom-page">
      <ShopNav />
      <div className="ecom-wrap">
        <header className="ecom-hero">
          <p className="section-label">Account</p>
          <h1 className="ecom-title">My Profile</h1>
          <p className="ecom-lead">
            Track orders, manage addresses, and keep your divine essentials close.
          </p>
        </header>

        <div className="profile-layout">
          <aside className="profile-side">
            <div className="profile-side__user">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
            <Link href="/profile?tab=orders" className={tab === 'orders' ? 'is-active' : ''}>
              Orders
            </Link>
            <Link
              href="/profile?tab=addresses"
              className={tab === 'addresses' ? 'is-active' : ''}
            >
              Addresses
            </Link>
            <Link href="/profile?tab=details" className={tab === 'details' ? 'is-active' : ''}>
              Details
            </Link>
            <button
              type="button"
              onClick={async () => {
                await logout()
                router.push('/')
              }}
            >
              Logout
            </button>
          </aside>

          <div>
            {tab === 'orders' ? (
              <div>
                <div className="panel-head" style={{ border: 'none', paddingTop: 0 }}>
                  <h2 className="ecom-title" style={{ fontSize: '1.6rem' }}>
                    Past Orders
                  </h2>
                </div>
                {orders.length === 0 ? (
                  <div className="empty-state">
                    <p>No orders yet.</p>
                    <Link href="/shop" className="btn-sm btn-primary">
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  orders.map((o) => (
                    <Link key={o.id} href={`/profile/orders/${o.id}`} className="order-card">
                      <div className="order-card__top">
                        <span className="order-card__id">{o.orderNumber}</span>
                        <span className="order-status">{o.status}</span>
                      </div>
                      <p className="cart-line__meta" style={{ marginTop: '0.55rem' }}>
                        {new Date(o.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}{' '}
                        · {o.items.length} item{o.items.length > 1 ? 's' : ''} ·{' '}
                        {formatINR(o.total)}
                      </p>
                    </Link>
                  ))
                )}
              </div>
            ) : null}

            {tab === 'addresses' ? (
              <div>
                <div className="panel-head" style={{ border: 'none', paddingTop: 0 }}>
                  <h2 className="ecom-title" style={{ fontSize: '1.6rem' }}>
                    Saved Addresses
                  </h2>
                </div>
                {addresses.length === 0 ? (
                  <div className="empty-state" style={{ marginBottom: '1.25rem' }}>
                    <p>No saved addresses yet. Add one below.</p>
                  </div>
                ) : null}
                {addresses.map((a) => (
                  <div key={a.id} className="address-card">
                    {a.isDefault ? <span className="address-card__default">Default</span> : null}
                    <p className="address-card__label">{a.label}</p>
                    <p>
                      <strong>{a.fullName}</strong> · {a.phone}
                    </p>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem', lineHeight: 1.5 }}>
                      {a.line1}
                      {a.line2 ? `, ${a.line2}` : ''}
                      <br />
                      {a.city}, {a.state} — {a.pincode}
                    </p>
                    <button
                      type="button"
                      className="btn-sm btn-ghost"
                      style={{ marginTop: '0.85rem' }}
                      onClick={() => removeAddress(a.id)}
                    >
                      Delete
                    </button>
                  </div>
                ))}

                <form
                  className="panel form-stack"
                  onSubmit={saveAddress}
                  style={{ marginTop: '1.5rem', padding: '1.5rem' }}
                >
                  <h3 className="ecom-title" style={{ fontSize: '1.35rem' }}>
                    Add Address
                  </h3>
                  <div className="form-row-2">
                    <div className="form-field">
                      <label htmlFor="a-label">Label</label>
                      <input
                        id="a-label"
                        required
                        value={addrForm.label}
                        onChange={(e) => setAddrForm((f) => ({ ...f, label: e.target.value }))}
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="a-fullName">Full name</label>
                      <input
                        id="a-fullName"
                        required
                        value={addrForm.fullName}
                        onChange={(e) => setAddrForm((f) => ({ ...f, fullName: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="form-field">
                    <label htmlFor="a-phone">Phone</label>
                    <input
                      id="a-phone"
                      required
                      value={addrForm.phone}
                      onChange={(e) => setAddrForm((f) => ({ ...f, phone: e.target.value }))}
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="a-line1">Address line 1</label>
                    <input
                      id="a-line1"
                      required
                      value={addrForm.line1}
                      onChange={(e) => setAddrForm((f) => ({ ...f, line1: e.target.value }))}
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="a-line2">Address line 2</label>
                    <input
                      id="a-line2"
                      value={addrForm.line2}
                      onChange={(e) => setAddrForm((f) => ({ ...f, line2: e.target.value }))}
                    />
                  </div>
                  <div className="form-row-2">
                    <div className="form-field">
                      <label htmlFor="a-city">City</label>
                      <input
                        id="a-city"
                        required
                        value={addrForm.city}
                        onChange={(e) => setAddrForm((f) => ({ ...f, city: e.target.value }))}
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="a-state">State</label>
                      <input
                        id="a-state"
                        required
                        value={addrForm.state}
                        onChange={(e) => setAddrForm((f) => ({ ...f, state: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="form-field">
                    <label htmlFor="a-pincode">PIN code</label>
                    <input
                      id="a-pincode"
                      required
                      value={addrForm.pincode}
                      onChange={(e) => setAddrForm((f) => ({ ...f, pincode: e.target.value }))}
                    />
                  </div>
                  <label className="form-check">
                    <input
                      type="checkbox"
                      checked={addrForm.isDefault}
                      onChange={(e) => setAddrForm((f) => ({ ...f, isDefault: e.target.checked }))}
                    />
                    Set as default address
                  </label>
                  {error ? <p className="form-error">{error}</p> : null}
                  {msg ? <p className="form-ok">{msg}</p> : null}
                  <button type="submit" className="btn-sm btn-primary">
                    Save Address
                  </button>
                </form>
              </div>
            ) : null}

            {tab === 'details' ? (
              <div className="panel" style={{ padding: '1.5rem' }}>
                <h2 className="ecom-title" style={{ fontSize: '1.5rem' }}>
                  Profile Details
                </h2>
                <div style={{ marginTop: '1.35rem', display: 'grid', gap: '0.85rem' }}>
                  <p>
                    <span className="product-card__tag">Name</span>
                    <br />
                    <strong style={{ fontSize: '1.1rem' }}>{user.name}</strong>
                  </p>
                  <p>
                    <span className="product-card__tag">Email</span>
                    <br />
                    <strong style={{ fontSize: '1.1rem' }}>{user.email}</strong>
                  </p>
                  <p>
                    <span className="product-card__tag">Phone</span>
                    <br />
                    <strong style={{ fontSize: '1.1rem' }}>{user.phone || '—'}</strong>
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
