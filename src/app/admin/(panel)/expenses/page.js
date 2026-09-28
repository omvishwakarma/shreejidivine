'use client'

import { useEffect, useMemo, useState } from 'react'
import { adminApi, formatINR } from '../../../../lib/adminApi'
import { adminToast, useAdminToasts } from '../../../../components/admin/adminToast'

const TYPES = [
  { value: 'ads', label: 'Ads' },
  { value: 'packaging', label: 'Packaging' },
  { value: 'website', label: 'Website' },
  { value: 'product', label: 'Product' },
  { value: 'other', label: 'Other' },
]

const PEOPLE = ['Sanket', 'Om', 'Vikrant']

function todayInput() {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

function emptyForm() {
  return {
    name: '',
    type: 'ads',
    amount: '',
    image: '',
    date: todayInput(),
    spentBy: 'Sanket',
  }
}

function typeLabel(value) {
  return TYPES.find((item) => item.value === value)?.label || value
}

function dateInputValue(value) {
  if (!value) return todayInput()
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return todayInput()
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function AdminExpensesPage() {
  const [expenses, setExpenses] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [typeFilter, setTypeFilter] = useState('all')
  const [personFilter, setPersonFilter] = useState('all')
  useAdminToasts('', error)

  async function load() {
    const data = await adminApi('/api/admin/expenses')
    setExpenses(data.expenses || [])
  }

  useEffect(() => {
    load()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return expenses.filter((item) => {
      if (typeFilter !== 'all' && item.type !== typeFilter) return false
      if (personFilter !== 'all' && item.spentBy !== personFilter) return false
      return true
    })
  }, [expenses, typeFilter, personFilter])

  const total = filtered.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm())
    setError('')
    setFormOpen(true)
  }

  function openEdit(item) {
    setEditingId(item.id)
    setForm({
      name: item.name || '',
      type: item.type,
      amount: item.amount,
      image: item.image || '',
      date: dateInputValue(item.date),
      spentBy: item.spentBy,
    })
    setError('')
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingId(null)
    setForm(emptyForm())
    setError('')
  }

  async function uploadImage(file) {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('kind', 'image')
      const data = await adminApi('/api/admin/upload', { method: 'POST', body })
      setForm((current) => ({ ...current, image: data.url }))
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) {
      setError('Enter an expense name.')
      return
    }
    const amount = Number(form.amount)
    if (!Number.isFinite(amount) || amount < 0) {
      setError('Enter a valid amount.')
      return
    }
    if (!form.date) {
      setError('Choose a date.')
      return
    }
    const payload = {
      name: form.name.trim(),
      type: form.type,
      amount,
      image: form.image || '',
      date: form.date,
      spentBy: form.spentBy,
    }
    setSaving(true)
    try {
      if (editingId) {
        await adminApi(`/api/admin/expenses/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
        adminToast('Expense updated')
      } else {
        await adminApi('/api/admin/expenses', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        adminToast('Expense added')
      }
      closeForm()
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function remove(id) {
    if (!confirm('Delete this expense?')) return
    try {
      await adminApi(`/api/admin/expenses/${id}`, { method: 'DELETE' })
      adminToast('Expense deleted')
      if (editingId === id) closeForm()
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return <p className="admin-page-sub">Loading expenses…</p>
  }

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <p className="admin-kicker">Accounts</p>
          <h1 className="admin-page-title">Expenses</h1>
          <p className="admin-page-sub" style={{ marginBottom: 0 }}>
            Track internal spending by type, date, and person
          </p>
        </div>
        {!formOpen ? (
          <button type="button" className="admin-btn admin-btn-primary" onClick={openAdd}>
            Add expense
          </button>
        ) : null}
      </div>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <span>Entries</span>
          <strong>{filtered.length}</strong>
        </div>
        <div className="admin-stat-card">
          <span>Total</span>
          <strong>{formatINR(total)}</strong>
        </div>
      </div>

      {formOpen ? (
        <div className="admin-card" style={{ marginBottom: '1.25rem' }}>
          <h2>{editingId ? 'Edit expense' : 'Add expense'}</h2>
          <form className="admin-form-grid" onSubmit={onSubmit}>
            <div className="admin-form-grid two">
              <div className="admin-field" style={{ gridColumn: '1 / -1' }}>
                <label>Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                  placeholder="Facebook ads, boxes, domain…"
                />
              </div>
              <div className="admin-field">
                <label>Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((current) => ({ ...current, type: e.target.value }))}
                >
                  {TYPES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-field">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm((current) => ({ ...current, amount: e.target.value }))}
                />
              </div>
              <div className="admin-field">
                <label>Date</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm((current) => ({ ...current, date: e.target.value }))}
                />
              </div>
              <div className="admin-field">
                <label>Expense by</label>
                <select
                  value={form.spentBy}
                  onChange={(e) => setForm((current) => ({ ...current, spentBy: e.target.value }))}
                >
                  {PEOPLE.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-field" style={{ gridColumn: '1 / -1' }}>
                <label>Bill image</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    e.target.value = ''
                    uploadImage(file)
                  }}
                />
                {uploading ? <small>Uploading…</small> : null}
                {form.image ? (
                  <a href={form.image} target="_blank" rel="noreferrer" className="admin-expense-preview">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.image} alt="Expense bill" />
                  </a>
                ) : null}
              </div>
            </div>
            <div className="admin-row-actions">
              <button type="submit" className="admin-btn admin-btn-primary" disabled={saving || uploading}>
                {saving ? 'Saving…' : editingId ? 'Update expense' : 'Save expense'}
              </button>
              <button type="button" className="admin-btn admin-btn-ghost" onClick={closeForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <section className="admin-card">
        <div className="admin-toolbar">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All types</option>
            {TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <select value={personFilter} onChange={(e) => setPersonFilter(e.target.value)}>
            <option value="all">Everyone</option>
            {PEOPLE.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="admin-empty">
            <strong>No expenses yet</strong>
            <p>Add a bill to start the expense list.</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>By</th>
                  <th>Bill</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDate(item.date)}</td>
                    <td>
                      <strong>{item.name}</strong>
                    </td>
                    <td>{typeLabel(item.type)}</td>
                    <td>
                      <strong>{formatINR(item.amount)}</strong>
                    </td>
                    <td>{item.spentBy}</td>
                    <td>
                      {item.image ? (
                        <a href={item.image} target="_blank" rel="noreferrer">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.image} alt="" className="admin-expense-thumb" />
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          className="admin-btn admin-btn-ghost"
                          onClick={() => openEdit(item)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn-danger"
                          onClick={() => remove(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
