'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { adminApi, formatINR } from '../../../../lib/adminApi'

const empty = {
  slug: '',
  name: '',
  tagline: '',
  price: 699,
  compareAt: '',
  image: '/images/aroma-variants.png',
  badge: '',
  category: 'singles',
  stock: 50,
  stone: '',
  description: '',
  highlights: '',
  active: true,
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(empty)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [activeFilter, setActiveFilter] = useState('all')
  const fileRef = useRef(null)
  const formRef = useRef(null)

  async function load() {
    const data = await adminApi('/api/products/all')
    const list = [...(data.products || [])].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    )
    setProducts(list)
  }

  useEffect(() => {
    load().catch((err) => setError(err.message))
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      if (categoryFilter !== 'all' && (p.category || 'singles') !== categoryFilter) return false
      if (activeFilter === 'active' && p.active === false) return false
      if (activeFilter === 'inactive' && p.active !== false) return false
      if (!q) return true
      const hay = [p.name, p.slug, p.tagline, p.badge, p.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [products, search, categoryFilter, activeFilter])

  function openAdd() {
    setEditingId(null)
    setForm(empty)
    setError('')
    setMsg('')
    setFormOpen(true)
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  function openEdit(p) {
    setEditingId(p.id)
    setForm({
      slug: p.slug,
      name: p.name,
      tagline: p.tagline || '',
      price: p.price,
      compareAt: p.compareAt ?? '',
      image: p.image,
      badge: p.badge || '',
      category: p.category || 'singles',
      stock: p.stock,
      stone: p.stone || '',
      description: p.description || '',
      highlights: (p.highlights || []).join(', '),
      active: p.active !== false,
    })
    setError('')
    setMsg('')
    setFormOpen(true)
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingId(null)
    setForm(empty)
    setError('')
    setMsg('')
  }

  async function onUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setMsg('')
    setUploading(true)
    try {
      const body = new FormData()
      body.append('file', file)
      const data = await adminApi('/api/admin/upload', { method: 'POST', body })
      setForm((f) => ({ ...f, image: data.url }))
      setMsg('Image uploaded')
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setMsg('')
    const payload = {
      ...form,
      price: Number(form.price),
      compareAt: form.compareAt === '' ? null : Number(form.compareAt),
      badge: form.badge || null,
      stock: Number(form.stock),
      highlights: String(form.highlights)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      gallery: [form.image],
    }
    try {
      if (editingId) {
        await adminApi(`/api/products/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
      } else {
        await adminApi('/api/products', { method: 'POST', body: JSON.stringify(payload) })
      }
      closeForm()
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function remove(id) {
    if (!confirm('Delete this product?')) return
    await adminApi(`/api/products/${id}`, { method: 'DELETE' })
    if (editingId === id) closeForm()
    await load()
  }

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Products</h1>
          <p className="admin-page-sub" style={{ marginBottom: 0 }}>
            Create and manage catalog items
          </p>
        </div>
        {!formOpen ? (
          <button type="button" className="admin-btn admin-btn-primary" onClick={openAdd}>
            Add product
          </button>
        ) : null}
      </div>

      {formOpen ? (
        <div className="admin-card" ref={formRef}>
          <h2>{editingId ? 'Edit Product' : 'Add Product'}</h2>
          <form className="admin-form-grid" onSubmit={onSubmit}>
            <div className="admin-form-grid two">
              <div className="admin-field">
                <label>Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="admin-field">
                <label>Slug</label>
                <input
                  required
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                />
              </div>
            </div>
            <div className="admin-form-grid two">
              <div className="admin-field">
                <label>Price (INR)</label>
                <input
                  type="number"
                  required
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                />
              </div>
              <div className="admin-field">
                <label>Compare at</label>
                <input
                  type="number"
                  value={form.compareAt}
                  onChange={(e) => setForm((f) => ({ ...f, compareAt: e.target.value }))}
                />
              </div>
            </div>

            <div className="admin-field">
              <label>Product image</label>
              <div className="admin-image-upload">
                <div className="admin-image-upload__preview">
                  {form.image ? (
                    <Image
                      src={form.image}
                      alt="Product preview"
                      width={160}
                      height={160}
                      unoptimized
                    />
                  ) : (
                    <span>No image</span>
                  )}
                </div>
                <div className="admin-image-upload__controls">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={onUpload}
                    disabled={uploading}
                  />
                  <p className="admin-image-upload__hint">
                    {uploading ? 'Uploading…' : 'Browse JPG, PNG, WEBP, or GIF (max 5MB)'}
                  </p>
                  <label className="admin-image-upload__path-label">Or image path</label>
                  <input
                    required
                    value={form.image}
                    onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                    placeholder="/images/..."
                  />
                </div>
              </div>
            </div>

            <div className="admin-field">
              <label>Stock</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
              />
            </div>
            <div className="admin-field">
              <label>Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="admin-field">
              <label>Highlights (comma separated)</label>
              <input
                value={form.highlights}
                onChange={(e) => setForm((f) => ({ ...f, highlights: e.target.value }))}
              />
            </div>
            {error ? <p className="admin-error">{error}</p> : null}
            {msg ? <p className="admin-success">{msg}</p> : null}
            <div className="admin-row-actions">
              <button className="admin-btn admin-btn-primary" type="submit" disabled={uploading}>
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
          placeholder="Search name, slug, tagline…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">All categories</option>
          <option value="kits">Kits</option>
          <option value="singles">Oils &amp; Stones</option>
        </select>
        <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <span className="admin-toolbar__count">
          {filtered.length} / {products.length}
        </span>
      </div>

      <div className="admin-card">
        <h2>Catalog ({filtered.length})</h2>
        {products.length === 0 ? (
          <p className="admin-page-sub" style={{ marginBottom: 0 }}>
            No products yet. Click Add product to create one.
          </p>
        ) : filtered.length === 0 ? (
          <p className="admin-page-sub" style={{ marginBottom: 0 }}>
            No products match your search
          </p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Active</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.name}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--admin-muted)' }}>{p.slug}</div>
                  </td>
                  <td>{formatINR(p.price)}</td>
                  <td>{p.stock}</td>
                  <td>{p.active ? 'Yes' : 'No'}</td>
                  <td>
                    <div className="admin-row-actions">
                      <button
                        type="button"
                        className="admin-btn admin-btn-ghost"
                        onClick={() => openEdit(p)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger"
                        onClick={() => remove(p.id)}
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
