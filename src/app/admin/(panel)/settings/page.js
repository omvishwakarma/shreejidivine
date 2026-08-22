'use client'

import { useEffect, useId, useState } from 'react'
import { adminApi, formatINR } from '../../../../lib/adminApi'

const EMPTY = {
  shippingFee: 0,
  freeShippingMinOrder: 0,
  heroVideoDesktop: '/videos/home.mp4',
  heroVideoMobile: '/videos/home.mp4',
  heroPoster: '/images/banners/royal-chandan.png',
  heroHeadline: '',
  heroCtaText: 'Shop Now',
  heroCtaHref: '/shop',
}

function VideoSlot({
  title,
  badge,
  hint,
  value,
  field,
  portrait,
  uploading,
  onUpload,
  onPathChange,
}) {
  const inputId = useId()
  const busy = uploading === field

  return (
    <div className={`admin-media-card ${portrait ? 'is-portrait' : ''}`}>
      <div className="admin-media-card__head">
        <div>
          <p className="admin-media-card__badge">{badge}</p>
          <h3>{title}</h3>
        </div>
        <span className="admin-chip">{busy ? 'Uploading…' : 'Ready'}</span>
      </div>

      <div className="admin-media-card__preview">
        <video
          key={value}
          src={value}
          muted
          playsInline
          controls
          preload="metadata"
        />
      </div>

      <label htmlFor={inputId} className={`admin-dropzone ${busy ? 'is-busy' : ''}`}>
        <input
          id={inputId}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          disabled={!!uploading}
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            onUpload(field, file)
          }}
        />
        <span className="admin-dropzone__title">
          {busy ? 'Uploading video…' : 'Click to upload video'}
        </span>
        <span className="admin-dropzone__hint">{hint}</span>
      </label>

      <label className="admin-field">
        <span>Video path</span>
        <input type="text" value={value} onChange={(e) => onPathChange(e.target.value)} />
      </label>
    </div>
  )
}

export default function AdminSettingsPage() {
  const [form, setForm] = useState(EMPTY)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState('')

  async function load() {
    const data = await adminApi('/api/admin/settings')
    setForm({
      shippingFee: data.settings?.shippingFee ?? 0,
      freeShippingMinOrder: data.settings?.freeShippingMinOrder ?? 0,
      heroVideoDesktop: data.settings?.heroVideoDesktop || EMPTY.heroVideoDesktop,
      heroVideoMobile: data.settings?.heroVideoMobile || EMPTY.heroVideoMobile,
      heroPoster: data.settings?.heroPoster || EMPTY.heroPoster,
      heroHeadline: data.settings?.heroHeadline ?? '',
      heroCtaText: data.settings?.heroCtaText || EMPTY.heroCtaText,
      heroCtaHref: data.settings?.heroCtaHref || EMPTY.heroCtaHref,
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
          heroVideoDesktop: form.heroVideoDesktop.trim(),
          heroVideoMobile: form.heroVideoMobile.trim(),
          heroPoster: form.heroPoster.trim(),
          heroHeadline: form.heroHeadline.trim(),
          heroCtaText: form.heroCtaText.trim() || 'Shop Now',
          heroCtaHref: form.heroCtaHref.trim() || '/shop',
        }),
      })
      setForm({
        shippingFee: data.settings.shippingFee,
        freeShippingMinOrder: data.settings.freeShippingMinOrder,
        heroVideoDesktop: data.settings.heroVideoDesktop,
        heroVideoMobile: data.settings.heroVideoMobile,
        heroPoster: data.settings.heroPoster,
        heroHeadline: data.settings.heroHeadline ?? '',
        heroCtaText: data.settings.heroCtaText,
        heroCtaHref: data.settings.heroCtaHref,
      })
      setNote(data.note || '')
      setMsg('Settings saved successfully')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function uploadVideo(field, file) {
    if (!file) return
    setUploading(field)
    setError('')
    setMsg('')
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('kind', 'video')
      const data = await adminApi('/api/admin/upload', { method: 'POST', body })
      setForm((f) => ({ ...f, [field]: data.url }))
      setMsg(
        `${field === 'heroVideoDesktop' ? 'Desktop' : 'Mobile'} video uploaded — click Save to apply`
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading('')
    }
  }

  if (loading) {
    return <p className="admin-page-sub">Loading settings…</p>
  }

  return (
    <div className="admin-settings">
      <div className="admin-page-head">
        <div>
          <p className="admin-kicker">Store</p>
          <h1 className="admin-page-title">Settings</h1>
          <p className="admin-page-sub" style={{ marginBottom: 0 }}>
            Manage homepage hero videos, CTA copy, and shipping rules
          </p>
        </div>
      </div>

      {error ? <div className="admin-alert admin-alert--error">{error}</div> : null}
      {msg ? <div className="admin-alert admin-alert--success">{msg}</div> : null}

      <form className="admin-settings__form" onSubmit={onSubmit}>
        <section className="admin-card admin-card--lg">
          <div className="admin-card__head">
            <div>
              <h2>Hero banner</h2>
              <p>One homepage video. Upload separate desktop and mobile files.</p>
            </div>
          </div>

          <div className="admin-media-grid">
            <VideoSlot
              title="Desktop video"
              badge="Landscape"
              hint="MP4 / WEBM / MOV · max 80MB · 16:9 recommended"
              value={form.heroVideoDesktop}
              field="heroVideoDesktop"
              uploading={uploading}
              onUpload={uploadVideo}
              onPathChange={(v) => setForm((f) => ({ ...f, heroVideoDesktop: v }))}
            />
            <VideoSlot
              title="Mobile video"
              badge="Portrait"
              hint="Portrait 9:16 or 3:4 works best on phones"
              value={form.heroVideoMobile}
              field="heroVideoMobile"
              portrait
              uploading={uploading}
              onUpload={uploadVideo}
              onPathChange={(v) => setForm((f) => ({ ...f, heroVideoMobile: v }))}
            />
          </div>

          <div className="admin-card__divider" />

          <div className="admin-form-grid two">
            <label className="admin-field">
              <span>Poster image path</span>
              <input
                type="text"
                value={form.heroPoster}
                onChange={(e) => setForm((f) => ({ ...f, heroPoster: e.target.value }))}
              />
            </label>
            <label className="admin-field">
              <span>Headline</span>
              <input
                type="text"
                value={form.heroHeadline}
                onChange={(e) => setForm((f) => ({ ...f, heroHeadline: e.target.value }))}
                placeholder="Leave blank for site tagline"
              />
            </label>
            <label className="admin-field">
              <span>CTA button text</span>
              <input
                type="text"
                value={form.heroCtaText}
                onChange={(e) => setForm((f) => ({ ...f, heroCtaText: e.target.value }))}
              />
            </label>
            <label className="admin-field">
              <span>CTA link</span>
              <input
                type="text"
                value={form.heroCtaHref}
                onChange={(e) => setForm((f) => ({ ...f, heroCtaHref: e.target.value }))}
              />
            </label>
          </div>
        </section>

        <section className="admin-card admin-card--lg">
          <div className="admin-card__head">
            <div>
              <h2>Shipping</h2>
              <p>Flat fee and free-shipping threshold shown at checkout.</p>
            </div>
          </div>

          <div className="admin-form-grid two">
            <label className="admin-field">
              <span>Shipping charge (₹)</span>
              <input
                type="number"
                min="0"
                step="1"
                value={form.shippingFee}
                onChange={(e) => setForm((f) => ({ ...f, shippingFee: e.target.value }))}
                required
              />
              <small>Set 0 for free shipping on all orders</small>
            </label>
            <label className="admin-field">
              <span>Free shipping above (₹)</span>
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
              <small>Set 0 to disable the free-shipping threshold</small>
            </label>
          </div>

          {note ? (
            <div className="admin-note">
              <span>Customer sees</span>
              <strong>
                {note}
                {Number(form.shippingFee) > 0
                  ? ` · Charge ${formatINR(Number(form.shippingFee) || 0)} under threshold`
                  : ''}
              </strong>
            </div>
          ) : null}
        </section>

        <div className="admin-sticky-actions">
          <p>Changes apply to the live storefront after save.</p>
          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={saving || !!uploading}
          >
            {saving ? 'Saving…' : 'Save settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
