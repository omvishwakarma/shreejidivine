'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '../../../../lib/adminApi'

const DEFAULT_COPY = {
  label: 'Follow us on Instagram',
  handle: '@shreeji.divine',
  url: 'https://www.instagram.com/shreeji.divine',
  cta: 'Visit Instagram',
}

function emptyPost(index = 0) {
  return {
    id: '',
    image: '',
    video: '',
    permalink: '',
    active: true,
    sortOrder: index,
  }
}

function isInstagramPostLink(value) {
  return /instagram\.com\/(?:[\w.-]+\/)?(?:p|reel|tv)\//i.test(String(value || '').trim())
}

export default function AdminInstagramFeedPage() {
  const [copy, setCopy] = useState(DEFAULT_COPY)
  const [posts, setPosts] = useState([])
  const [usingDefaults, setUsingDefaults] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [form, setForm] = useState(emptyPost())

  function apply(data) {
    setCopy({
      label: data.label || DEFAULT_COPY.label,
      handle: data.handle || DEFAULT_COPY.handle,
      url: data.url || DEFAULT_COPY.url,
      cta: data.cta || DEFAULT_COPY.cta,
    })
    setUsingDefaults(Boolean(data.usingDefaults))
    setPosts(
      Array.isArray(data.posts)
        ? data.posts.map((post, i) => ({ ...emptyPost(i), ...post, sortOrder: i }))
        : []
    )
  }

  useEffect(() => {
    adminApi('/api/admin/instagram-strip')
      .then(apply)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  function openAdd() {
    setEditingIndex(null)
    setForm(emptyPost(posts.length))
    setError('')
    setMsg('')
    setFormOpen(true)
  }

  function openEdit(index) {
    const post = posts[index]
    if (!post) return
    setEditingIndex(index)
    setForm({ ...emptyPost(index), ...post })
    setError('')
    setMsg('')
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingIndex(null)
    setForm(emptyPost())
  }

  async function persist(nextCopy, nextPosts) {
    const data = await adminApi('/api/admin/instagram-strip', {
      method: 'PUT',
      body: JSON.stringify({
        ...nextCopy,
        posts: nextPosts.map((post, i) => ({
          id: post.id,
          permalink: String(post.permalink || '').trim(),
          active: post.active !== false,
          sortOrder: i,
        })),
      }),
    })
    apply(data)
  }

  async function onSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMsg('')
    try {
      let nextPosts = posts
      if (formOpen) {
        const link = String(form.permalink || '').trim()
        if (!isInstagramPostLink(link)) {
          setError('Paste a post or reel link, like https://www.instagram.com/reel/…')
          setSaving(false)
          return
        }
        const item = { ...form, permalink: link, id: form.id || '' }
        nextPosts =
          editingIndex == null
            ? [...posts, item]
            : posts.map((post, i) => (i === editingIndex ? item : post))
      }
      await persist(copy, nextPosts)
      closeForm()
      setMsg('Instagram feed saved. Photos and videos load from these links.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function removePost(index) {
    setSaving(true)
    setError('')
    setMsg('')
    try {
      await persist(
        copy,
        posts.filter((_, i) => i !== index)
      )
      if (editingIndex === index) closeForm()
      setMsg('Post removed')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function movePost(index, dir) {
    const j = index + dir
    if (j < 0 || j >= posts.length) return
    const next = [...posts]
    ;[next[index], next[j]] = [next[j], next[index]]
    setSaving(true)
    setError('')
    try {
      await persist(copy, next)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="admin-page-sub">Loading Instagram feed…</p>

  return (
    <form className="admin-settings" onSubmit={onSave}>
      <div className="admin-page-head">
        <div>
          <p className="admin-kicker">Homepage</p>
          <h1 className="admin-page-title">Instagram feed</h1>
          <p className="admin-page-sub">
            Paste an Instagram post or reel link. The photo and video load from that link.
          </p>
        </div>
        <button type="button" className="admin-btn" onClick={openAdd} disabled={formOpen}>
          Add link
        </button>
      </div>

      {error ? <div className="admin-alert admin-alert--error">{error}</div> : null}
      {msg ? <div className="admin-alert admin-alert--success">{msg}</div> : null}

      <section className="admin-card admin-card--lg">
        <div className="admin-card__head">
          <div>
            <h2>Section text</h2>
            <p>Shown above the photo row.</p>
          </div>
        </div>
        <div className="admin-form-grid two">
          <label className="admin-field">
            <span>Small label</span>
            <input
              type="text"
              value={copy.label}
              onChange={(e) => setCopy((c) => ({ ...c, label: e.target.value }))}
            />
          </label>
          <label className="admin-field">
            <span>Handle</span>
            <input
              type="text"
              value={copy.handle}
              onChange={(e) => setCopy((c) => ({ ...c, handle: e.target.value }))}
            />
          </label>
          <label className="admin-field">
            <span>Profile link</span>
            <input
              type="url"
              value={copy.url}
              onChange={(e) => setCopy((c) => ({ ...c, url: e.target.value }))}
            />
          </label>
          <label className="admin-field">
            <span>Button text</span>
            <input
              type="text"
              value={copy.cta}
              onChange={(e) => setCopy((c) => ({ ...c, cta: e.target.value }))}
            />
          </label>
        </div>
      </section>

      <section className="admin-card admin-card--lg">
        <div className="admin-card__head">
          <div>
            <h2>Posts</h2>
            <p>
              {usingDefaults
                ? 'These are the links already showing on the homepage. Edit them, then save.'
                : 'Homepage loads the image or video from each link.'}
            </p>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <tbody>
              {posts.map((post, index) => (
                <tr key={post.id || post.permalink || index}>
                  <td>
                    <strong>{post.active === false ? 'Hidden' : `Post ${index + 1}`}</strong>
                    <div className="admin-product-cell__meta">{post.permalink}</div>
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <button
                        type="button"
                        className="admin-btn"
                        onClick={() => movePost(index, -1)}
                        disabled={index === 0 || saving}
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        className="admin-btn"
                        onClick={() => movePost(index, 1)}
                        disabled={index === posts.length - 1 || saving}
                      >
                        Down
                      </button>
                      <button type="button" className="admin-btn" onClick={() => openEdit(index)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger"
                        onClick={() => removePost(index)}
                        disabled={saving}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {formOpen ? (
          <div className="admin-form-grid" style={{ marginTop: '1.25rem' }}>
            <p className="admin-kicker">{editingIndex == null ? 'New link' : 'Edit link'}</p>
            <label className="admin-field">
              <span>Instagram post or reel link</span>
              <input
                type="url"
                value={form.permalink}
                placeholder="https://www.instagram.com/reel/…"
                onChange={(e) => setForm((f) => ({ ...f, permalink: e.target.value }))}
                required
              />
              <small>Image and video come from this link. No separate upload.</small>
            </label>
            <label className="admin-toggle">
              <input
                type="checkbox"
                checked={form.active !== false}
                onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
              />
              <span>
                <strong>{form.active === false ? 'Hidden' : 'Visible'}</strong>
                <small>Hidden links stay saved but do not show on the homepage.</small>
              </span>
            </label>
            <div className="admin-row-actions">
              <button type="button" className="admin-btn" onClick={closeForm}>
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <div className="admin-sticky-actions">
        <p>Save to update the homepage row.</p>
        <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save feed'}
        </button>
      </div>
    </form>
  )
}
