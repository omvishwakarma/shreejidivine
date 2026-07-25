'use client'

import { useEffect, useMemo, useState } from 'react'
import { adminApi, formatINR } from '../../../../lib/adminApi'

const empty = {
  code: '',
  type: 'PERCENT',
  value: 10,
  maxUses: 0,
  expiresAt: '',
  minOrderAmount: 0,
  description: '',
  active: true,
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([])
  const [form, setForm] = useState(empty)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  async function load() {
    const data = await adminApi('/api/admin/coupons')
    setCoupons(data.coupons || [])
  }

  useEffect(() => {
    load().catch((err) => setError(err.message))
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return coupons.filter((c) => {
      if (typeFilter !== 'all' && c.type !== typeFilter) return false
      if (!q) return true
      return [c.code, c.description].filter(Boolean).join(' ').toLowerCase().includes(q)
    })
  }, [coupons, search, typeFilter])

  function openAdd() {
    setEditingId(null)
    setForm(empty)
    setError('')
    setFormOpen(true)
  }

  function openEdit(c) {
    setEditingId(c.id)
    setForm({
      code: c.code,
      type: c.type,
      value: c.value,
      maxUses: c.maxUses,
      expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString().slice(0, 10) : '',
      minOrderAmount: c.minOrderAmount || 0,
      description: c.description || '',
      active: c.active !== false,
    })
    setError('')
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingId(null)
    setForm(empty)
    setError('')
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    const payload = {
      code: form.code,
      type: form.type,
      value: Number(form.value),
      maxUses: Number(form.maxUses) || 0,
      expiresAt: form.expiresAt || null,
      minOrderAmount: Number(form.minOrderAmount) || 0,
      description: form.description,
      active: form.active,
    }
    try {
      if (editingId) {
        await adminApi(`/api/admin/coupons/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
      } else {
        await adminApi('/api/admin/coupons', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
      }
      closeForm()
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function remove(id) {
    if (!confirm('Delete this coupon?')) return
    await adminApi(`/api/admin/coupons/${id}`, { method: 'DELETE' })
    if (editingId === id) closeForm()
    await load()
  }

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Coupons</h1>
          <p className="admin-page-sub" style={{ marginBottom: 0 }}>
            Fixed or percentage discounts with expiry and usage limits
          </p>
        </div>
        {!formOpen ? (
          <button type="button" className="admin-btn admin-btn-primary" onClick={openAdd}>
            Add coupon
          </button>
        ) : null}
      </div>

      {formOpen ? (
        <div className="admin-card">
          <h2>{editingId ? 'Edit coupon' : 'Add coupon'}</h2>
          <form className="admin-form-grid" onSubmit={onSubmit}>
            <div className="admin-form-grid two">
              <div className="admin-field">
                <label>Code</label>
                <input
                  required
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="WELCOME10"
                />
              </div>
              <div className="admin-field">
                <label>Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                >
                  <option value="PERCENT">Percentage (%)</option>
                  <option value="FIXED">Fixed (₹)</option>
                </select>
              </div>
            </div>
            <div className="admin-form-grid two">
              <div className="admin-field">
                <label>{form.type === 'PERCENT' ? 'Percent value' : 'Fixed amount (INR)'}</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={form.type === 'PERCENT' ? 100 : undefined}
                  value={form.value}
                  onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                />
              </div>
              <div className="admin-field">
                <label>Max uses (0 = unlimited)</label>
                <input
                  type="number"
                  min="0"
                  value={form.maxUses}
                  onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                />
              </div>
            </div>
            <div className="admin-form-grid two">
              <div className="admin-field">
                <label>Expires on</label>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                />
              </div>
              <div className="admin-field">
                <label>Min order amount (INR)</label>
                <input
                  type="number"
                  min="0"
                  value={form.minOrderAmount}
                  onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: e.target.value }))}
                />
              </div>
            </div>
            <div className="admin-field">
              <label>Description</label>
              <input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional note"
              />
            </div>
            <label className="admin-check">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
              />
              Active
            </label>
            {error ? <p className="admin-error">{error}</p> : null}
            <div className="admin-row-actions">
              <button type="submit" className="admin-btn admin-btn-primary">
                {editingId ? 'Update' : 'Create'}
              </button>
              <button type="button" className="admin-btn admin-btn-ghost" onClick={closeForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="admin-toolbar">
        <input
          className="admin-search"
          type="search"
          placeholder="Search code…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">All types</option>
          <option value="PERCENT">Percentage</option>
          <option value="FIXED">Fixed</option>
        </select>
        <span className="admin-toolbar__count">
          {filtered.length} / {coupons.length}
        </span>
      </div>

      <div className="admin-card">
        <h2>Coupons ({filtered.length})</h2>
        {coupons.length === 0 ? (
          <p className="admin-page-sub" style={{ marginBottom: 0 }}>
            No coupons yet
          </p>
        ) : filtered.length === 0 ? (
          <p className="admin-page-sub" style={{ marginBottom: 0 }}>
            No coupons match
          </p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Uses</th>
                <th>Expires</th>
                <th>Active</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.code}</strong>
                    {c.description ? (
                      <div style={{ fontSize: '0.8rem', color: 'var(--admin-muted)' }}>
                        {c.description}
                      </div>
                    ) : null}
                  </td>
                  <td>
                    {c.type === 'PERCENT' ? `${c.value}%` : formatINR(c.value)}
                    {c.minOrderAmount > 0 ? (
                      <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)' }}>
                        Min {formatINR(c.minOrderAmount)}
                      </div>
                    ) : null}
                  </td>
                  <td>
                    {c.usedCount}
                    {c.maxUses > 0 ? ` / ${c.maxUses}` : ' / ∞'}
                  </td>
                  <td>
                    {c.expiresAt
                      ? new Date(c.expiresAt).toLocaleDateString('en-IN')
                      : 'No expiry'}
                  </td>
                  <td>{c.active ? 'Yes' : 'No'}</td>
                  <td>
                    <div className="admin-row-actions">
                      <button
                        type="button"
                        className="admin-btn admin-btn-ghost"
                        onClick={() => openEdit(c)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger"
                        onClick={() => remove(c.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
