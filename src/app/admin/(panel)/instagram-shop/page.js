'use client'

import { useEffect, useId, useMemo, useState } from 'react'
import { adminApi, formatINR } from '../../../../lib/adminApi'

function emptyLook(index = 0) {
  return {
    id: '',
    permalink: '',
    productSlug: '',
    badge: 'NEW',
    videoUrl: '',
    poster: '',
    active: true,
    sortOrder: index,
  }
}

export default function AdminInstagramShopPage() {
  const [enabled, setEnabled] = useState(true)
  const [looks, setLooks] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState('')
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [form, setForm] = useState(emptyLook())

  const productMap = useMemo(() => {
    const map = new Map()
    products.forEach((p) => map.set(p.slug, p))
    return map
  }, [products])

  async function load() {
    const data = await adminApi('/api/admin/instagram-shop')
    setEnabled(data.enabled !== false)
    setLooks(
      Array.isArray(data.looks) && data.looks.length
        ? data.looks.map((l, i) => ({ ...emptyLook(i), ...l, sortOrder: i }))
        : []
    )
    setProducts(Array.isArray(data.products) ? data.products : [])
  }

  useEffect(() => {
    load()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  function openAdd() {
    setEditingIndex(null)
    setForm(emptyLook(looks.length))
    setError('')
    setMsg('')
    setFormOpen(true)
  }

  function openEdit(index) {
    const look = looks[index]
    if (!look) return
    setEditingIndex(index)
    setForm({ ...emptyLook(index), ...look })
    setError('')
    setMsg('')
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingIndex(null)
    setForm(emptyLook())
  }

  async function persist(nextEnabled, nextLooks) {
    const payload = {
      enabled: nextEnabled,
      looks: nextLooks
        .map((look, i) => ({
          ...look,
          permalink: String(look.permalink || '').trim(),
          productSlug: String(look.productSlug || '').trim(),
          badge: String(look.badge || 'NEW').trim() || 'NEW',
          videoUrl: String(look.videoUrl || '').trim(),
          poster: String(look.poster || '').trim(),
          active: look.active !== false,
          sortOrder: i,
        }))
        .filter((look) => look.permalink),
    }

    const data = await adminApi('/api/admin/instagram-shop', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    setEnabled(data.enabled !== false)
    setLooks(data.looks.map((l, i) => ({ ...emptyLook(i), ...l, sortOrder: i })))
    return data
  }

  async function onToggleSection() {
    setError('')
    setMsg('')
    setSaving(true)
    try {
      await persist(!enabled, looks)
      setMsg(`Instagram Shop ${!enabled ? 'shown' : 'hidden'} on homepage`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function onSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMsg('')
    try {
      const nextLook = {
        ...form,
        permalink: form.permalink.trim(),
        productSlug: form.productSlug.trim(),
        badge: form.badge.trim() || 'NEW',
        videoUrl: form.videoUrl.trim(),
        poster: form.poster.trim(),
      }
      if (!nextLook.permalink) throw new Error('Instagram URL is required')

      const nextLooks = [...looks]
      if (editingIndex === null) {
        nextLooks.push({ ...nextLook, sortOrder: nextLooks.length })
      } else {
        nextLooks[editingIndex] = { ...nextLooks[editingIndex], ...nextLook }
      }

      await persist(enabled, nextLooks)
      closeForm()
      setMsg(editingIndex === null ? 'Look added' : 'Look updated')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function removeLook(index) {
    if (!confirm('Remove this Instagram look?')) return
    setSaving(true)
    setError('')
    setMsg('')
    try {
      const nextLooks = looks.filter((_, i) => i !== index)
      await persist(enabled, nextLooks)
      if (editingIndex === index) closeForm()
      else if (editingIndex !== null && editingIndex > index) {
        setEditingIndex(editingIndex - 1)
      }
      setMsg('Look removed')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function moveLook(index, dir) {
    const j = index + dir
    if (j < 0 || j >= looks.length) return
    setSaving(true)
    setError('')
    setMsg('')
    try {
      const nextLooks = [...looks]
      ;[nextLooks[index], nextLooks[j]] = [nextLooks[j], nextLooks[index]]
      await persist(enabled, nextLooks)
      if (editingIndex === index) setEditingIndex(j)
      else if (editingIndex === j) setEditingIndex(index)
      setMsg('Order updated')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(index) {
    setSaving(true)
    setError('')
    setMsg('')
    try {
      const nextLooks = looks.map((look, i) =>
        i === index ? { ...look, active: look.active === false } : look
      )
      await persist(enabled, nextLooks)
      if (editingIndex === index) {
        setForm((f) => ({ ...f, active: nextLooks[index].active }))
      }
      setMsg('Status updated')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function uploadField(field, file) {
    if (!file) return
    setUploading(field)
    setError('')
    setMsg('')
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('kind', field === 'videoUrl' ? 'video' : 'image')
      const data = await adminApi('/api/admin/upload', { method: 'POST', body })
      setForm((f) => ({ ...f, [field]: data.url }))
      setMsg(`${field === 'videoUrl' ? 'Video' : 'Poster'} uploaded — save the look to apply`)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading('')
    }
  }

  if (loading) {
    return <p className="admin-page-sub">Loading Instagram Shop…</p>
  }

  return (
    <div className="admin-settings">
      <div className="admin-page-head">
        <div>
          <p className="admin-kicker">Homepage</p>
          <h1 className="admin-page-title">Instagram Shop</h1>
          <p className="admin-page-sub" style={{ marginBottom: 0 }}>
            Manage “Shop the look” reels shown on the homepage
          </p>
        </div>
        <button type="button" className="admin-btn admin-btn-primary" onClick={openAdd}>
          + Add look
        </button>
      </div>

      {error ? <div className="admin-alert admin-alert--error">{error}</div> : null}
      {msg ? <div className="admin-alert admin-alert--success">{msg}</div> : null}

      <section className="admin-card admin-card--lg">
        <div className="admin-card__head">
          <div>
            <h2>Section</h2>
            <p>
              {looks.length} look{looks.length === 1 ? '' : 's'} ·{' '}
              {looks.filter((l) => l.active !== false).length} active
            </p>
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-ghost"
            disabled={saving}
            onClick={onToggleSection}
          >
            {enabled ? 'Hide on site' : 'Show on site'}
          </button>
        </div>
        <p className="admin-page-sub" style={{ margin: 0 }}>
          Status:{' '}
          <strong>{enabled ? 'Visible on homepage' : 'Hidden from homepage'}</strong>
        </p>
      </section>

      <section className="admin-card admin-card--lg">
        <div className="admin-card__head">
          <div>
            <h2>Looks list</h2>
            <p>Click Edit to change Instagram URL, product, or video.</p>
          </div>
        </div>

        {looks.length === 0 ? (
          <div className="admin-empty">
            <p>No Instagram looks yet.</p>
            <button type="button" className="admin-btn admin-btn-primary" onClick={openAdd}>
              Add first look
            </button>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table admin-table--products">
              <thead>
                <tr>
                  <th style={{ width: 56 }}>#</th>
                  <th>Look</th>
                  <th>Product</th>
                  <th>Badge</th>
                  <th>Video</th>
                  <th>Status</th>
                  <th style={{ width: 220 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {looks.map((look, index) => {
                  const product = productMap.get(look.productSlug)
                  const thumb = look.poster || product?.image || ''
                  return (
                    <tr key={`${look.id || look.permalink}-${index}`}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="admin-ig-look-cell">
                          <div className="admin-ig-look-cell__thumb">
                            {thumb ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={thumb} alt="" />
                            ) : (
                              <span>IG</span>
                            )}
                          </div>
                          <div className="admin-ig-look-cell__meta">
                            <strong>{look.id || `Look ${index + 1}`}</strong>
                            <a
                              href={look.permalink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="admin-ig-look-cell__link"
                            >
                              Open Instagram
                            </a>
                          </div>
                        </div>
                      </td>
                      <td>
                        {product ? (
                          <div className="admin-ig-look-cell">
                            {product.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={product.image}
                                alt=""
                                className="admin-ig-look-cell__product"
                              />
                            ) : null}
                            <div>
                              <div>{product.name}</div>
                              <small>{formatINR(product.price)}</small>
                            </div>
                          </div>
                        ) : (
                          <span className="admin-muted">{look.productSlug || '—'}</span>
                        )}
                      </td>
                      <td>
                        <span className="admin-chip">{look.badge || 'NEW'}</span>
                      </td>
                      <td>
                        <span className="admin-chip">
                          {look.videoUrl ? 'Hosted' : 'Auto IG'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`admin-status ${look.active !== false ? 'is-on' : 'is-off'}`}
                          disabled={saving}
                          onClick={() => toggleActive(index)}
                        >
                          {look.active !== false ? 'Active' : 'Off'}
                        </button>
                      </td>
                      <td>
                        <div className="admin-row-actions">
                          <button
                            type="button"
                            className="admin-btn admin-btn-ghost"
                            disabled={saving || index === 0}
                            onClick={() => moveLook(index, -1)}
                            aria-label="Move up"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-ghost"
                            disabled={saving || index >= looks.length - 1}
                            onClick={() => moveLook(index, 1)}
                            aria-label="Move down"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-ghost"
                            onClick={() => openEdit(index)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger"
                            disabled={saving}
                            onClick={() => removeLook(index)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {formOpen ? (
        <LookForm
          form={form}
          setForm={setForm}
          products={products}
          uploading={uploading}
          saving={saving}
          isEdit={editingIndex !== null}
          onClose={closeForm}
          onSubmit={onSubmit}
          onUpload={uploadField}
        />
      ) : null}
    </div>
  )
}

function LookForm({
  form,
  setForm,
  products,
  uploading,
  saving,
  isEdit,
  onClose,
  onSubmit,
  onUpload,
}) {
  const videoId = useId()
  const posterId = useId()
  const product = products.find((p) => p.slug === form.productSlug)

  return (
    <form className="admin-card admin-card--lg" onSubmit={onSubmit}>
      <div className="admin-card__head">
        <div>
          <h2>{isEdit ? 'Edit look' : 'Add look'}</h2>
          <p>Instagram URL + linked product. Hosted video is optional.</p>
        </div>
        <button type="button" className="admin-btn admin-btn-ghost" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="admin-form-grid two">
        <label className="admin-field" style={{ gridColumn: '1 / -1' }}>
          <span>Instagram post / reel URL</span>
          <input
            type="url"
            required
            placeholder="https://www.instagram.com/p/… or /reel/…"
            value={form.permalink}
            onChange={(e) => setForm((f) => ({ ...f, permalink: e.target.value }))}
          />
        </label>

        <label className="admin-field">
          <span>Linked product</span>
          <select
            value={form.productSlug}
            onChange={(e) => setForm((f) => ({ ...f, productSlug: e.target.value }))}
          >
            <option value="">Select product…</option>
            {products.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name} ({formatINR(p.price)})
              </option>
            ))}
          </select>
          {product ? <small>/shop/{product.slug}</small> : null}
        </label>

        <label className="admin-field">
          <span>Badge</span>
          <input
            type="text"
            value={form.badge}
            onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
            placeholder="NEW"
          />
        </label>

        <label className="admin-toggle" style={{ gridColumn: '1 / -1' }}>
          <input
            type="checkbox"
            checked={form.active !== false}
            onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
          />
          <span>
            <strong>Active on homepage</strong>
            <small>Turn off to keep the look saved but hidden</small>
          </span>
        </label>
      </div>

      <div className="admin-card__divider" />

      <div className="admin-media-grid">
        <div className="admin-media-card is-portrait">
          <div className="admin-media-card__head">
            <div>
              <p className="admin-media-card__badge">Optional</p>
              <h3>Hosted video</h3>
            </div>
            <span className="admin-chip">{form.videoUrl ? 'Custom' : 'Auto from IG'}</span>
          </div>
          <div className="admin-media-card__preview">
            {form.videoUrl ? (
              <video
                key={form.videoUrl}
                src={form.videoUrl}
                muted
                playsInline
                controls
                preload="metadata"
              />
            ) : (
              <div className="admin-empty-preview">Uses Instagram autoplay when blank</div>
            )}
          </div>
          <label
            htmlFor={videoId}
            className={`admin-dropzone ${uploading === 'videoUrl' ? 'is-busy' : ''}`}
          >
            <input
              id={videoId}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              disabled={!!uploading}
              onChange={(e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                onUpload('videoUrl', file)
              }}
            />
            <span className="admin-dropzone__title">
              {uploading === 'videoUrl' ? 'Uploading…' : 'Upload video (optional)'}
            </span>
            <span className="admin-dropzone__hint">More reliable than Instagram CDN</span>
          </label>
          <label className="admin-field">
            <span>Video path</span>
            <input
              type="text"
              value={form.videoUrl}
              onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
              placeholder="Leave blank to pull from Instagram"
            />
          </label>
        </div>

        <div className="admin-media-card is-portrait">
          <div className="admin-media-card__head">
            <div>
              <p className="admin-media-card__badge">Optional</p>
              <h3>Poster image</h3>
            </div>
            <span className="admin-chip">{form.poster ? 'Custom' : 'Auto'}</span>
          </div>
          <div className="admin-media-card__preview">
            {form.poster || product?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.poster || product?.image} alt="" />
            ) : (
              <div className="admin-empty-preview">Poster / product image</div>
            )}
          </div>
          <label
            htmlFor={posterId}
            className={`admin-dropzone ${uploading === 'poster' ? 'is-busy' : ''}`}
          >
            <input
              id={posterId}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={!!uploading}
              onChange={(e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                onUpload('poster', file)
              }}
            />
            <span className="admin-dropzone__title">
              {uploading === 'poster' ? 'Uploading…' : 'Upload poster (optional)'}
            </span>
            <span className="admin-dropzone__hint">Shown before video starts</span>
          </label>
          <label className="admin-field">
            <span>Poster path</span>
            <input
              type="text"
              value={form.poster}
              onChange={(e) => setForm((f) => ({ ...f, poster: e.target.value }))}
              placeholder="Leave blank for auto thumbnail"
            />
          </label>
        </div>
      </div>

      <div className="admin-sticky-actions">
        <button type="button" className="admin-btn admin-btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button
          type="submit"
          className="admin-btn admin-btn-primary"
          disabled={saving || !!uploading}
        >
          {saving ? 'Saving…' : isEdit ? 'Save look' : 'Add look'}
        </button>
      </div>
    </form>
  )
}
