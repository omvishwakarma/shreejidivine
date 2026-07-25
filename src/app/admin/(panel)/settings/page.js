'use client'

import { useEffect, useState } from 'react'
import { adminApi, formatINR } from '../../../../lib/adminApi'

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    shippingFee: 0,
    freeShippingMinOrder: 0,
  })
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  async function load() {
    const data = await adminApi('/api/admin/settings')
    setForm({
      shippingFee: data.settings?.shippingFee ?? 0,
      freeShippingMinOrder: data.settings?.freeShippingMinOrder ?? 0,
    })
    setNote(data.note || '')
  }

  useEffect(() => {
    load()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function onSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMsg('')
    try {
      const data = await adminApi('/api/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify({
          shippingFee: Number(form.shippingFee) || 0,
          freeShippingMinOrder: Number(form.freeShippingMinOrder) || 0,
        }),
      })
      setForm({
        shippingFee: data.settings.shippingFee,
        freeShippingMinOrder: data.settings.freeShippingMinOrder,
      })
      setNote(data.note || '')
      setMsg('Shipping settings saved')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="admin-page-sub">Loading settings…</p>
  }

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Settings</h1>
          <p className="admin-page-sub" style={{ marginBottom: 0 }}>
            Shipping charges and free-shipping threshold
          </p>
        </div>
      </div>

      {error ? <p className="admin-error">{error}</p> : null}
      {msg ? <p className="admin-success">{msg}</p> : null}

      <div className="admin-card" style={{ maxWidth: 520 }}>
        <h2>Shipping</h2>
        <form className="admin-form-grid" onSubmit={onSubmit}>
          <label>
            Shipping charge (₹)
            <input
              type="number"
              min="0"
              step="1"
              value={form.shippingFee}
              onChange={(e) => setForm((f) => ({ ...f, shippingFee: e.target.value }))}
              required
            />
            <small style={{ opacity: 0.7 }}>Set to 0 for free shipping on all orders</small>
          </label>

          <label>
            Free shipping above (₹)
            <input
              type="number"
              min="0"
              step="1"
              value={form.freeShippingMinOrder}
              onChange={(e) =>
                setForm((f) => ({ ...f, freeShippingMinOrder: e.target.value }))
              }
              required
            />
            <small style={{ opacity: 0.7 }}>
              Orders at or above this subtotal ship free. Set 0 to disable the threshold.
            </small>
          </label>

          {note ? (
            <p className="admin-page-sub" style={{ margin: 0 }}>
              Customer note: {note}
              {Number(form.shippingFee) > 0 ? (
                <>
                  {' '}
                  · Charge {formatINR(Number(form.shippingFee) || 0)} when under threshold
                </>
              ) : null}
            </p>
          ) : null}

          <div>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
