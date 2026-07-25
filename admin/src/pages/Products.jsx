import { useEffect, useState } from 'react'
import { api, formatINR } from '../api'

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

export default function Products() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  async function load() {
    const data = await api('/api/products/all')
    setProducts(data.products || [])
  }

  useEffect(() => {
    load().catch((err) => setError(err.message))
  }, [])

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
        await api(`/api/products/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
        setMsg('Product updated')
      } else {
        await api('/api/products', { method: 'POST', body: JSON.stringify(payload) })
        setMsg('Product created')
      }
      setForm(empty)
      setEditingId(null)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  function edit(p) {
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
  }

  async function remove(id) {
    if (!confirm('Delete this product?')) return
    await api(`/api/products/${id}`, { method: 'DELETE' })
    await load()
  }

  return (
    <div>
      <h1 className="page-title">Products</h1>
      <p className="page-sub">Create and manage catalog items</p>

      <div className="card">
        <h2>{editingId ? 'Edit Product' : 'Add Product'}</h2>
        <form className="form-grid" onSubmit={onSubmit}>
          <div className="form-grid two">
            <div className="field">
              <label>Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="field">
              <label>Slug</label>
              <input
                required
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              />
            </div>
          </div>
          <div className="form-grid two">
            <div className="field">
              <label>Price (INR)</label>
              <input
                type="number"
                required
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
            </div>
            <div className="field">
              <label>Compare at</label>
              <input
                type="number"
                value={form.compareAt}
                onChange={(e) => setForm((f) => ({ ...f, compareAt: e.target.value }))}
              />
            </div>
          </div>
          <div className="form-grid two">
            <div className="field">
              <label>Image path</label>
              <input
                required
                value={form.image}
                onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
              />
            </div>
            <div className="field">
              <label>Stock</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
              />
            </div>
          </div>
          <div className="field">
            <label>Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="field">
            <label>Highlights (comma separated)</label>
            <input
              value={form.highlights}
              onChange={(e) => setForm((f) => ({ ...f, highlights: e.target.value }))}
            />
          </div>
          {error ? <p className="error">{error}</p> : null}
          {msg ? <p style={{ color: '#1b4332' }}>{msg}</p> : null}
          <div className="row-actions">
            <button className="btn btn-primary" type="submit">
              {editingId ? 'Update' : 'Create'}
            </button>
            {editingId ? (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setEditingId(null)
                  setForm(empty)
                }}
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Catalog ({products.length})</h2>
        <table>
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
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <strong>{p.name}</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{p.slug}</div>
                </td>
                <td>{formatINR(p.price)}</td>
                <td>{p.stock}</td>
                <td>{p.active ? 'Yes' : 'No'}</td>
                <td>
                  <div className="row-actions">
                    <button type="button" className="btn btn-ghost" onClick={() => edit(p)}>
                      Edit
                    </button>
                    <button type="button" className="btn btn-danger" onClick={() => remove(p.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
