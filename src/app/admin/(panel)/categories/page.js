'use client'

import { useEffect, useMemo, useState } from 'react'
import { adminApi } from '../../../../lib/adminApi'

const empty = {
  name: '',
  slug: '',
  parent: '',
  description: '',
  image: '',
  sortOrder: 0,
  active: true,
  showInNav: true,
  showInHome: true,
}

export default function AdminCategoriesPage() {
  const [tree, setTree] = useState([])
  const [flat, setFlat] = useState([])
  const [form, setForm] = useState(empty)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  async function load() {
    const data = await adminApi('/api/admin/categories')
    setTree(data.categories || [])
    setFlat(data.flat || [])
  }

  useEffect(() => {
    load().catch((err) => setError(err.message))
  }, [])

  const parents = useMemo(() => flat.filter((c) => !c.parent), [flat])

  const rows = useMemo(() => {
    const list = []
    tree.forEach((p) => {
      list.push({ ...p, level: 0 })
      ;(p.children || []).forEach((c) => list.push({ ...c, level: 1, parentName: p.name }))
    })
    return list
  }, [tree])

  function openAdd(parentId = '') {
    setEditingId(null)
    setForm({ ...empty, parent: parentId || '' })
    setError('')
    setMsg('')
    setFormOpen(true)
  }

  function openEdit(c) {
    setEditingId(c.id)
    setForm({
      name: c.name,
      slug: c.slug,
      parent: c.parent || '',
      description: c.description || '',
      image: c.image || '',
      sortOrder: c.sortOrder || 0,
      active: c.active !== false,
      showInNav: c.showInNav !== false,
      showInHome: c.showInHome !== false,
    })
    setError('')
    setMsg('')
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingId(null)
    setForm(empty)
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setMsg('')
    const payload = {
      name: form.name,
      slug: form.slug || undefined,
      parent: form.parent || null,
      description: form.description,
      image: form.image,
      sortOrder: Number(form.sortOrder) || 0,
      active: form.active,
      showInNav: form.showInNav,
      showInHome: form.showInHome,
    }
    try {
      if (editingId) {
        await adminApi(`/api/admin/categories/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
        setMsg('Category updated')
      } else {
        await adminApi('/api/admin/categories', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        setMsg('Category created')
      }
      closeForm()
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function remove(id) {
    if (!confirm('Delete this category?')) return
    try {
      await adminApi(`/api/admin/categories/${id}`, { method: 'DELETE' })
      if (editingId === id) closeForm()
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Categories</h1>
          <p className="admin-page-sub" style={{ marginBottom: 0 }}>
            Manage parent categories (Divine, Lifestyle) and subcategories for shop &amp; nav
          </p>
        </div>
        <button type="button" className="admin-btn admin-btn-primary" onClick={() => openAdd()}>
          Add category
        </button>
      </div>

      {error ? <p className="admin-error">{error}</p> : null}
      {msg ? <p className="admin-success">{msg}</p> : null}

      {formOpen ? (
        <div className="admin-card" style={{ marginBottom: '1.25rem' }}>
          <h2>{editingId ? 'Edit category' : 'New category'}</h2>
          <form className="admin-form-grid" onSubmit={onSubmit}>
            <div className="admin-form-grid two">
              <label>
                Name
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </label>
              <label>
                Slug
                <input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="auto from name"
                />
              </label>
            </div>
            <div className="admin-form-grid two">
              <label>
                Parent (for subcategory)
                <select
                  value={form.parent}
                  onChange={(e) => setForm((f) => ({ ...f, parent: e.target.value }))}
                  disabled={!!editingId && rows.some((r) => r.id === editingId && r.level === 0 && (r.children || []).length)}
                >
                  <option value="">— Top level —</option>
                  {parents
                    .filter((p) => p.id !== editingId)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Sort order
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                />
              </label>
            </div>
            <label>
              Image URL
              <input
                value={form.image}
                onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                placeholder="/images/..."
              />
            </label>
            <label>
              Description
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </label>
            <div className="admin-form-grid two">
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                />
                Active
              </label>
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={form.showInNav}
                  onChange={(e) => setForm((f) => ({ ...f, showInNav: e.target.checked }))}
                />
                Show in nav
              </label>
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={form.showInHome}
                  onChange={(e) => setForm((f) => ({ ...f, showInHome: e.target.checked }))}
                />
                Show on homepage
              </label>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="admin-btn admin-btn-primary">
                {editingId ? 'Save' : 'Create'}
              </button>
              <button type="button" className="admin-btn admin-btn-ghost" onClick={closeForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Type</th>
              <th>Nav / Home</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td style={{ paddingLeft: c.level ? '1.75rem' : undefined }}>
                  {c.level ? '↳ ' : ''}
                  <strong>{c.name}</strong>
                  {c.parentName ? (
                    <span style={{ opacity: 0.55, marginLeft: 6 }}>({c.parentName})</span>
                  ) : null}
                </td>
                <td className="admin-mono">{c.slug}</td>
                <td>{c.level ? 'Subcategory' : 'Category'}</td>
                <td>
                  {c.showInNav !== false ? 'Nav' : '—'} / {c.showInHome !== false ? 'Home' : '—'}
                  {c.active === false ? ' · Off' : ''}
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {!c.level ? (
                    <button
                      type="button"
                      className="admin-btn admin-btn-ghost"
                      onClick={() => openAdd(c.id)}
                      style={{ marginRight: 6 }}
                    >
                      + Sub
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="admin-btn admin-btn-ghost"
                    onClick={() => openEdit(c)}
                    style={{ marginRight: 6 }}
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
