'use client'

import { useEffect, useId, useState } from 'react'
import { adminApi } from '../../../../lib/adminApi'
import { useAdminToasts } from '../../../../components/admin/adminToast'
import { instagramHandleFromUrl } from '../../../../lib/testimonials'

function emptyReview(index = 0) {
  return {
    id: '',
    title: '',
    quote: '',
    name: '',
    handle: '',
    photo: '',
    video: '',
    instagram: '',
    active: true,
    sortOrder: index,
  }
}

export default function AdminTestimonialsPage() {
  const [enabled, setEnabled] = useState(true)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  useAdminToasts(msg, error)
  const [formOpen, setFormOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [form, setForm] = useState(emptyReview())

  async function load() {
    const data = await adminApi('/api/admin/testimonials')
    setEnabled(data.enabled !== false)
    const list = Array.isArray(data.reviews) ? data.reviews : []
    setReviews(list.map((r, i) => ({ ...emptyReview(i), ...r, sortOrder: i })))
  }

  useEffect(() => {
    load()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  function openAdd() {
    setEditingIndex(null)
    setForm(emptyReview(reviews.length))
    setError('')
    setMsg('')
    setFormOpen(true)
  }

  function openEdit(index) {
    const review = reviews[index]
    if (!review) return
    setEditingIndex(index)
    setForm({ ...emptyReview(index), ...review })
    setError('')
    setMsg('')
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingIndex(null)
    setForm(emptyReview())
  }

  async function persist(nextEnabled, nextReviews) {
    const payload = {
      enabled: nextEnabled,
      reviews: nextReviews
        .map((review, i) => ({
          ...review,
          title: String(review.title || '').trim(),
          quote: String(review.quote || '').trim(),
          name: String(review.name || '').trim(),
          handle: String(review.handle || '').trim(),
          photo: String(review.photo || '').trim(),
          video: String(review.video || '').trim(),
          instagram: String(review.instagram || '').trim(),
          active: review.active !== false,
          sortOrder: i,
        }))
        .filter((review) => review.name && (review.video || review.quote || review.instagram)),
    }

    const data = await adminApi('/api/admin/testimonials', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    setEnabled(data.enabled !== false)
    setReviews(data.reviews.map((r, i) => ({ ...emptyReview(i), ...r, sortOrder: i })))
    return data
  }

  async function onToggleSection() {
    setSaving(true)
    setError('')
    setMsg('')
    try {
      await persist(!enabled, reviews)
      setMsg(`Testimonials ${!enabled ? 'shown' : 'hidden'} on homepage`)
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
      const instagram = form.instagram.trim()
      const video = form.video.trim()
      const handle = instagramHandleFromUrl(instagram)
      const nextReview = {
        ...form,
        title: '',
        quote: '',
        name: form.name.trim(),
        handle,
        photo: form.photo.trim(),
        video,
        instagram,
        id: form.id || handle.replace(/^@/, '') || `review-${Date.now()}`,
      }
      if (!nextReview.name) throw new Error('Name is required')
      if (!nextReview.video) throw new Error('Review video link is required')

      const nextReviews = [...reviews]
      if (editingIndex === null) nextReviews.push(nextReview)
      else nextReviews[editingIndex] = { ...nextReviews[editingIndex], ...nextReview }

      await persist(enabled, nextReviews)
      closeForm()
      setMsg(editingIndex === null ? 'Review added' : 'Review updated')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function removeReview(index) {
    if (!confirm('Remove this review?')) return
    setSaving(true)
    setError('')
    setMsg('')
    try {
      const nextReviews = reviews.filter((_, i) => i !== index)
      await persist(enabled, nextReviews)
      if (editingIndex === index) closeForm()
      setMsg('Review removed')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function moveReview(index, dir) {
    const j = index + dir
    if (j < 0 || j >= reviews.length) return
    setSaving(true)
    setError('')
    setMsg('')
    try {
      const nextReviews = [...reviews]
      ;[nextReviews[index], nextReviews[j]] = [nextReviews[j], nextReviews[index]]
      await persist(enabled, nextReviews)
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
      const nextReviews = reviews.map((review, i) =>
        i === index ? { ...review, active: review.active === false } : review
      )
      await persist(enabled, nextReviews)
      setMsg('Status updated')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function uploadPhoto(file) {
    if (!file) return
    setUploading(true)
    setError('')
    setMsg('')
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('kind', 'image')
      const data = await adminApi('/api/admin/upload', { method: 'POST', body })
      setForm((f) => ({ ...f, photo: data.url }))
      setMsg('Photo uploaded — save the review to apply')
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return <p className="admin-page-sub">Loading testimonials…</p>
  }

  return (
    <div className="admin-settings">
      <div className="admin-page-head">
        <div>
          <p className="admin-kicker">Homepage</p>
          <h1 className="admin-page-title">Testimonials</h1>
          <p className="admin-page-sub" style={{ marginBottom: 0 }}>
            Name, review video, and Instagram profile for the homepage
          </p>
        </div>
        <button type="button" className="admin-btn admin-btn-primary" onClick={openAdd}>
          + Add review
        </button>
      </div>


      <section className="admin-card admin-card--lg">
        <div className="admin-card__head">
          <div>
            <h2>Section</h2>
            <p>
              {reviews.length} review{reviews.length === 1 ? '' : 's'} ·{' '}
              {reviews.filter((r) => r.active !== false).length} active
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
            <h2>Reviews list</h2>
            <p>Name, review video link, and profile link.</p>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="admin-empty">
            <p>No reviews yet.</p>
            <button type="button" className="admin-btn admin-btn-primary" onClick={openAdd}>
              Add first review
            </button>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table admin-table--products">
              <thead>
                <tr>
                  <th style={{ width: 48 }}>#</th>
                  <th>Customer</th>
                  <th>Video</th>
                  <th>Profile</th>
                  <th>Status</th>
                  <th style={{ width: 220 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review, index) => (
                  <tr key={`${review.id}-${index}`}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="admin-ig-look-cell">
                        <div className="admin-ig-look-cell__thumb" style={{ width: 44, height: 44 }}>
                          {review.photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={review.photo} alt="" />
                          ) : (
                            <span>{(review.name || '?').slice(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="admin-ig-look-cell__meta">
                          <strong>{review.name}</strong>
                          <span className="admin-muted">{review.handle || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      {review.video ? (
                        <a
                          href={review.video}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-ig-look-cell__link"
                        >
                          Video
                        </a>
                      ) : (
                        <span className="admin-muted">—</span>
                      )}
                    </td>
                    <td>
                      {review.instagram ? (
                        <a
                          href={review.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-ig-look-cell__link"
                        >
                          Open
                        </a>
                      ) : (
                        <span className="admin-muted">—</span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`admin-status ${review.active !== false ? 'is-on' : 'is-off'}`}
                        disabled={saving}
                        onClick={() => toggleActive(index)}
                      >
                        {review.active !== false ? 'Active' : 'Off'}
                      </button>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          className="admin-btn admin-btn-ghost"
                          disabled={saving || index === 0}
                          onClick={() => moveReview(index, -1)}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn-ghost"
                          disabled={saving || index >= reviews.length - 1}
                          onClick={() => moveReview(index, 1)}
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
                          onClick={() => removeReview(index)}
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

      {formOpen ? (
        <ReviewForm
          form={form}
          setForm={setForm}
          uploading={uploading}
          saving={saving}
          isEdit={editingIndex !== null}
          onClose={closeForm}
          onSubmit={onSubmit}
          onUpload={uploadPhoto}
        />
      ) : null}
    </div>
  )
}

function ReviewForm({ form, setForm, uploading, saving, isEdit, onClose, onSubmit, onUpload }) {
  const photoId = useId()

  return (
    <form className="admin-card admin-card--lg" onSubmit={onSubmit}>
      <div className="admin-card__head">
        <div>
          <h2>{isEdit ? 'Edit review' : 'Add review'}</h2>
          <p>Name, the review video link, and the Instagram profile link.</p>
        </div>
        <button type="button" className="admin-btn admin-btn-ghost" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="admin-form-grid two">
        <label className="admin-field">
          <span>Name</span>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </label>
        <label className="admin-field" style={{ gridColumn: '1 / -1' }}>
          <span>Review video link</span>
          <input
            type="url"
            required
            placeholder="https://www.instagram.com/reel/…"
            value={form.video}
            onChange={(e) => setForm((f) => ({ ...f, video: e.target.value }))}
          />
        </label>
        <label className="admin-field" style={{ gridColumn: '1 / -1' }}>
          <span>Profile link</span>
          <input
            type="url"
            placeholder="https://www.instagram.com/username/"
            value={form.instagram}
            onChange={(e) => {
              const instagram = e.target.value
              setForm((f) => ({
                ...f,
                instagram,
                handle: instagramHandleFromUrl(instagram),
              }))
            }}
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
            <small>Turn off to keep saved but hidden</small>
          </span>
        </label>
      </div>

      <div className="admin-card__divider" />

      <div className="admin-media-card" style={{ maxWidth: 320 }}>
        <div className="admin-media-card__head">
          <div>
            <p className="admin-media-card__badge">Photo</p>
            <h3>Profile photo</h3>
          </div>
        </div>
        <div className="admin-media-card__preview">
          {form.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.photo} alt="" />
          ) : (
            <div className="admin-empty-preview">Upload a square photo</div>
          )}
        </div>
        <label htmlFor={photoId} className={`admin-dropzone ${uploading ? 'is-busy' : ''}`}>
          <input
            id={photoId}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              onUpload(file)
            }}
          />
          <span className="admin-dropzone__title">
            {uploading ? 'Uploading…' : 'Click to upload photo'}
          </span>
        </label>
        <label className="admin-field">
          <span>Photo path</span>
          <input
            type="text"
            value={form.photo}
            onChange={(e) => setForm((f) => ({ ...f, photo: e.target.value }))}
          />
        </label>
      </div>

      <div className="admin-sticky-actions">
        <button type="button" className="admin-btn admin-btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button
          type="submit"
          className="admin-btn admin-btn-primary"
          disabled={saving || uploading}
        >
          {saving ? 'Saving…' : isEdit ? 'Save review' : 'Add review'}
        </button>
      </div>
    </form>
  )
}
