'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
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
  categorySlug: '',
  subcategorySlug: '',
  stock: 50,
  stone: '',
  description: '',
  highlights: '',
  active: true,
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(empty)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [activeFilter, setActiveFilter] = useState('all')
  const [catTree, setCatTree] = useState([])
  const [loading, setLoading] = useState(true)
  const fileRef = useRef(null)
  const formRef = useRef(null)
  const fileInputId = useId()
  const slugTouched = useRef(false)

  async function load() {
    const [data, cats] = await Promise.all([
      adminApi('/api/products/all'),
      adminApi('/api/admin/categories'),
    ])
    const list = [...(data.products || [])].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    )
    setProducts(list)
    setCatTree(cats.categories || [])
  }

  useEffect(() => {
    load()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      if (categoryFilter !== 'all') {
        const match =
          p.categorySlug === categoryFilter ||
          p.subcategorySlug === categoryFilter ||
          p.category === categoryFilter
        if (!match) return false
      }
      if (activeFilter === 'active' && p.active === false) return false
      if (activeFilter === 'inactive' && p.active !== false) return false
      if (!q) return true
      const hay = [
        p.name,
        p.slug,
        p.tagline,
        p.badge,
        p.description,
        p.categorySlug,
        p.subcategorySlug,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [products, search, categoryFilter, activeFilter])

  const selectedParent = useMemo(
    () => catTree.find((c) => c.slug === form.categorySlug),
    [catTree, form.categorySlug]
  )

  const stats = useMemo(() => {
    const active = products.filter((p) => p.active !== false).length
    const lowStock = products.filter((p) => Number(p.stock) <= 5).length
    return {
      total: products.length,
      active,
      inactive: products.length - active,
      lowStock,
    }
  }, [products])

  function openAdd() {
    setEditingId(null)
    setForm(empty)
    slugTouched.current = false
    setError('')
    setMsg('')
    setFormOpen(true)
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  function openEdit(p) {
    setEditingId(p.id)
    slugTouched.current = true
    setForm({
      slug: p.slug,
      name: p.name,
      tagline: p.tagline || '',
      price: p.price,
      compareAt: p.compareAt ?? '',
      image: p.image,
      badge: p.badge || '',
      category: p.category || 'singles',
      categorySlug: p.categorySlug || '',
      subcategorySlug: p.subcategorySlug || '',
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
    slugTouched.current = false
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
    setSaving(true)
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
        setMsg('Product updated')
      } else {
        await adminApi('/api/products', { method: 'POST', body: JSON.stringify(payload) })
        setMsg('Product created')
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
    if (!confirm('Delete this product?')) return
    try {
      await adminApi(`/api/products/${id}`, { method: 'DELETE' })
      if (editingId === id) closeForm()
      await load()
      setMsg('Product deleted')
    } catch (err) {
      setError(err.message)
    }
  }

  function categoryLabel(p) {
    return (
      [p.categorySlug, p.subcategorySlug].filter(Boolean).join(' / ') || p.category || 'Uncategorized'
    )
  }

  if (loading) {
    return <p className="admin-page-sub">Loading products…</p>
  }

  return (
    <div className="admin-products">
      <div className="admin-page-head">
        <div>
          <p className="admin-kicker">Catalog</p>
          <h1 className="admin-page-title">Products</h1>
          <p className="admin-page-sub" style={{ marginBottom: 0 }}>
            Create, edit, and organize your aroma stone catalog
          </p>
        </div>
        {!formOpen ? (
          <button type="button" className="admin-btn admin-btn-primary" onClick={openAdd}>
            Add product
          </button>
        ) : null}
      </div>

      {error ? <div className="admin-alert admin-alert--error">{error}</div> : null}
      {msg && !formOpen ? <div className="admin-alert admin-alert--success">{msg}</div> : null}

      <div className="admin-stats admin-stats--products">
        <div className="admin-stat-card">
          <span>Total</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="admin-stat-card">
          <span>Active</span>
          <strong>{stats.active}</strong>
        </div>
        <div className="admin-stat-card">
          <span>Inactive</span>
          <strong>{stats.inactive}</strong>
        </div>
        <div className="admin-stat-card">
          <span>Low stock</span>
          <strong>{stats.lowStock}</strong>
        </div>
      </div>

      {formOpen ? (
        <section className="admin-card admin-card--lg admin-product-form" ref={formRef}>
          <div className="admin-card__head">
            <div>
              <h2>{editingId ? 'Edit product' : 'Add product'}</h2>
              <p>
                {editingId
                  ? 'Update pricing, media, and category details.'
                  : 'Fill in the essentials to publish a new catalog item.'}
              </p>
            </div>
            <button type="button" className="admin-btn admin-btn-ghost" onClick={closeForm}>
              Close
            </button>
          </div>

          <form onSubmit={onSubmit}>
            <div className="admin-product-form__layout">
              <div className="admin-product-form__main">
                <div className="admin-form-section">
                  <h3>Basics</h3>
                  <div className="admin-form-grid two">
                    <label className="admin-field">
                      <span>Name</span>
                      <input
                        required
                        value={form.name}
                        onChange={(e) => {
                          const name = e.target.value
                          setForm((f) => ({
                            ...f,
                            name,
                            slug: slugTouched.current ? f.slug : slugify(name),
                          }))
                        }}
                      />
                    </label>
                    <label className="admin-field">
                      <span>Slug</span>
                      <input
                        required
                        value={form.slug}
                        onChange={(e) => {
                          slugTouched.current = true
                          setForm((f) => ({ ...f, slug: e.target.value }))
                        }}
                      />
                    </label>
                    <label className="admin-field" style={{ gridColumn: '1 / -1' }}>
                      <span>Tagline</span>
                      <input
                        value={form.tagline}
                        onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
                        placeholder="Short line under the product name"
                      />
                    </label>
                  </div>
                </div>

                <div className="admin-form-section">
                  <h3>Pricing & stock</h3>
                  <div className="admin-form-grid two">
                    <label className="admin-field">
                      <span>Price (₹)</span>
                      <input
                        type="number"
                        required
                        min="0"
                        value={form.price}
                        onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                      />
                    </label>
                    <label className="admin-field">
                      <span>Compare at (₹)</span>
                      <input
                        type="number"
                        min="0"
                        value={form.compareAt}
                        onChange={(e) => setForm((f) => ({ ...f, compareAt: e.target.value }))}
                      />
                    </label>
                    <label className="admin-field">
                      <span>Stock</span>
                      <input
                        type="number"
                        min="0"
                        value={form.stock}
                        onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                      />
                    </label>
                    <label className="admin-field">
                      <span>Badge</span>
                      <input
                        value={form.badge}
                        onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
                        placeholder="Best seller, New…"
                      />
                    </label>
                  </div>
                </div>

                <div className="admin-form-section">
                  <h3>Organization</h3>
                  <div className="admin-form-grid two">
                    <label className="admin-field">
                      <span>Category</span>
                      <select
                        value={form.categorySlug}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            categorySlug: e.target.value,
                            subcategorySlug: '',
                            category: e.target.value === 'divine' ? 'kits' : 'singles',
                          }))
                        }
                      >
                        <option value="">— Select —</option>
                        {catTree.map((c) => (
                          <option key={c.id} value={c.slug}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="admin-field">
                      <span>Subcategory</span>
                      <select
                        value={form.subcategorySlug}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, subcategorySlug: e.target.value }))
                        }
                        disabled={!selectedParent}
                      >
                        <option value="">— Optional —</option>
                        {(selectedParent?.children || []).map((c) => (
                          <option key={c.id} value={c.slug}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>

                <div className="admin-form-section">
                  <h3>Details</h3>
                  <div className="admin-form-grid">
                    <label className="admin-field">
                      <span>Description</span>
                      <textarea
                        rows={4}
                        value={form.description}
                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      />
                    </label>
                    <label className="admin-field">
                      <span>Highlights</span>
                      <input
                        value={form.highlights}
                        onChange={(e) => setForm((f) => ({ ...f, highlights: e.target.value }))}
                        placeholder="Comma separated, e.g. Smoke-free, Gift ready"
                      />
                      <small>Shown as short bullets on the product page</small>
                    </label>
                  </div>
                </div>
              </div>

              <aside className="admin-product-form__side">
                <div className="admin-form-section">
                  <h3>Media</h3>
                  <div className="admin-product-media">
                    <div className="admin-product-media__preview">
                      {form.image ? (
                        <Image
                          src={form.image}
                          alt="Product preview"
                          width={320}
                          height={320}
                          unoptimized
                        />
                      ) : (
                        <span>No image</span>
                      )}
                    </div>
                    <label
                      htmlFor={fileInputId}
                      className={`admin-dropzone ${uploading ? 'is-busy' : ''}`}
                    >
                      <input
                        id={fileInputId}
                        ref={fileRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={onUpload}
                        disabled={uploading}
                      />
                      <span className="admin-dropzone__title">
                        {uploading ? 'Uploading…' : 'Click to upload image'}
                      </span>
                      <span className="admin-dropzone__hint">JPG, PNG, WEBP, GIF · max 5MB</span>
                    </label>
                    <label className="admin-field">
                      <span>Image path</span>
                      <input
                        required
                        value={form.image}
                        onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                        placeholder="/images/..."
                      />
                    </label>
                  </div>
                </div>

                <div className="admin-form-section">
                  <h3>Visibility</h3>
                  <label className="admin-toggle">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                    />
                    <span>
                      <strong>{form.active ? 'Active' : 'Inactive'}</strong>
                      <small>
                        {form.active
                          ? 'Visible in shop and homepage'
                          : 'Hidden from the storefront'}
                      </small>
                    </span>
                  </label>
                </div>
              </aside>
            </div>

            {error ? <div className="admin-alert admin-alert--error">{error}</div> : null}
            {msg ? <div className="admin-alert admin-alert--success">{msg}</div> : null}

            <div className="admin-sticky-actions">
              <p>{editingId ? 'Saving updates this product live.' : 'Create to add it to the catalog.'}</p>
              <div className="admin-row-actions">
                <button type="button" className="admin-btn admin-btn-ghost" onClick={closeForm}>
                  Cancel
                </button>
                <button
                  className="admin-btn admin-btn-primary"
                  type="submit"
                  disabled={uploading || saving}
                >
                  {saving ? 'Saving…' : editingId ? 'Update product' : 'Create product'}
                </button>
              </div>
            </div>
          </form>
        </section>
      ) : null}

      <div className="admin-toolbar admin-toolbar--card">
        <input
          className="admin-search"
          type="search"
          placeholder="Search name, slug, tagline…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">All categories</option>
          {catTree.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
          <option value="kits">Legacy: Kits</option>
          <option value="singles">Legacy: Singles</option>
        </select>
        <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <span className="admin-toolbar__count">
          {filtered.length} shown
        </span>
      </div>

      <section className="admin-card admin-card--lg">
        <div className="admin-card__head">
          <div>
            <h2>Catalog</h2>
            <p>
              {filtered.length} of {products.length} products
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="admin-empty">
            <strong>No products yet</strong>
            <p>Create your first aroma stone or fragrance kit.</p>
            <button type="button" className="admin-btn admin-btn-primary" onClick={openAdd}>
              Add product
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">
            <strong>No matches</strong>
            <p>Try a different search or clear the filters.</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table admin-table--products">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="admin-product-cell">
                        <div className="admin-product-cell__thumb">
                          {p.image ? (
                            <Image
                              src={p.image}
                              alt=""
                              width={56}
                              height={56}
                              unoptimized
                            />
                          ) : null}
                        </div>
                        <div>
                          <strong>{p.name}</strong>
                          <div className="admin-product-cell__meta">{p.slug}</div>
                          {p.badge ? <span className="admin-chip">{p.badge}</span> : null}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="admin-cat-pill">{categoryLabel(p)}</span>
                    </td>
                    <td>
                      <div className="admin-price-cell">
                        <strong>{formatINR(p.price)}</strong>
                        {p.compareAt ? (
                          <span className="admin-price-cell__compare">
                            {formatINR(p.compareAt)}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`admin-stock ${
                          Number(p.stock) <= 5 ? 'is-low' : ''
                        }`}
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`admin-status ${
                          p.active !== false ? 'is-active' : 'is-inactive'
                        }`}
                      >
                        {p.active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
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
          </div>
        )}
      </section>
    </div>
  )
}
