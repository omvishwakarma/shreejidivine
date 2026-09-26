'use client'

import { useEffect, useId, useState } from 'react'
import { adminApi, formatINR } from '../../../../lib/adminApi'

const EMPTY = {
  shippingFee: 0,
  freeShippingMinOrder: 0,
  heroVideoDesktop: '/videos/home.mp4',
  heroVideoMobile: '/videos/home.mp4',
  heroPoster: '/images/banners/royal-chandan.png',
  heroPosterMobile: '',
  heroHeadline: '',
  heroCtaText: 'Shop Now',
  heroCtaHref: '/shop',
  homeCategoryLabel: 'Shop by Category',
  homeCategoryTitle: 'For Every Ritual',
  homeCategoryLead:
    'Explore Divine and Lifestyle collections — fragrance for prayer, home, and gifting.',
  homeBestLabel: 'Customer favourites',
  homeBestTitle: 'Best Sellers',
  homeBestLead: 'Most-loved aroma stones and oils — ready for home rituals and gifting.',
  homeReviewsTitle: 'Testimonials',
  homeReviewsLead: 'Loved in homes across India',
  menuIconHome: '',
  menuIconShop: '',
  menuIconBracelet: '',
  menuIconBest: '',
  menuIconAbout: '',
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

function PosterSlot({ title, badge, hint, value, field, uploading, onUpload, onPathChange }) {
  const inputId = useId()
  const busy = uploading === field

  return (
    <div className="admin-media-card admin-media-card--compact">
      <div className="admin-media-card__head">
        <div>
          <p className="admin-media-card__badge">{badge}</p>
          <h3>{title}</h3>
          {hint ? <p className="admin-dropzone__hint">{hint}</p> : null}
        </div>
      </div>
      <div className="admin-cat-upload">
        <div className="admin-cat-upload__preview">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" />
          ) : (
            <span>No image</span>
          )}
        </div>
        <div className="admin-cat-upload__actions">
          <label htmlFor={inputId} className={`admin-dropzone admin-dropzone--sm ${busy ? 'is-busy' : ''}`}>
            <input
              id={inputId}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={!!uploading}
              onChange={(e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                onUpload(field, file)
              }}
            />
            <span className="admin-dropzone__title">{busy ? 'Uploading…' : value ? 'Change' : 'Upload'}</span>
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => onPathChange(e.target.value)}
            placeholder="Image URL"
            aria-label={`${title} path`}
          />
        </div>
      </div>
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
      heroPosterMobile: data.settings?.heroPosterMobile || '',
      heroHeadline: data.settings?.heroHeadline ?? '',
      heroCtaText: data.settings?.heroCtaText || EMPTY.heroCtaText,
      heroCtaHref: data.settings?.heroCtaHref || EMPTY.heroCtaHref,
      homeCategoryLabel: data.settings?.homeCategoryLabel || EMPTY.homeCategoryLabel,
      homeCategoryTitle: data.settings?.homeCategoryTitle || EMPTY.homeCategoryTitle,
      homeCategoryLead: data.settings?.homeCategoryLead || EMPTY.homeCategoryLead,
      homeBestLabel: data.settings?.homeBestLabel || EMPTY.homeBestLabel,
      homeBestTitle: data.settings?.homeBestTitle || EMPTY.homeBestTitle,
      homeBestLead: data.settings?.homeBestLead || EMPTY.homeBestLead,
      homeReviewsTitle: data.settings?.homeReviewsTitle || EMPTY.homeReviewsTitle,
      homeReviewsLead: data.settings?.homeReviewsLead || EMPTY.homeReviewsLead,
      menuIconHome: data.settings?.menuIconHome || '',
      menuIconShop: data.settings?.menuIconShop || '',
      menuIconBracelet: data.settings?.menuIconBracelet || '',
      menuIconBest: data.settings?.menuIconBest || '',
      menuIconAbout: data.settings?.menuIconAbout || '',
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
          heroPosterMobile: form.heroPosterMobile.trim(),
          heroHeadline: form.heroHeadline.trim(),
          heroCtaText: form.heroCtaText.trim() || 'Shop Now',
          heroCtaHref: form.heroCtaHref.trim() || '/shop',
          homeCategoryLabel: form.homeCategoryLabel.trim(),
          homeCategoryTitle: form.homeCategoryTitle.trim(),
          homeCategoryLead: form.homeCategoryLead.trim(),
          homeBestLabel: form.homeBestLabel.trim(),
          homeBestTitle: form.homeBestTitle.trim(),
          homeBestLead: form.homeBestLead.trim(),
          homeReviewsTitle: form.homeReviewsTitle.trim(),
          homeReviewsLead: form.homeReviewsLead.trim(),
          menuIconHome: form.menuIconHome.trim(),
          menuIconShop: form.menuIconShop.trim(),
          menuIconBracelet: form.menuIconBracelet.trim(),
          menuIconBest: form.menuIconBest.trim(),
          menuIconAbout: form.menuIconAbout.trim(),
        }),
      })
      setForm({
        shippingFee: data.settings.shippingFee,
        freeShippingMinOrder: data.settings.freeShippingMinOrder,
        heroVideoDesktop: data.settings.heroVideoDesktop,
        heroVideoMobile: data.settings.heroVideoMobile,
        heroPoster: data.settings.heroPoster,
        heroPosterMobile: data.settings.heroPosterMobile || '',
        heroHeadline: data.settings.heroHeadline ?? '',
        heroCtaText: data.settings.heroCtaText,
        heroCtaHref: data.settings.heroCtaHref,
        homeCategoryLabel: data.settings.homeCategoryLabel || EMPTY.homeCategoryLabel,
        homeCategoryTitle: data.settings.homeCategoryTitle || EMPTY.homeCategoryTitle,
        homeCategoryLead: data.settings.homeCategoryLead || EMPTY.homeCategoryLead,
        homeBestLabel: data.settings.homeBestLabel || EMPTY.homeBestLabel,
        homeBestTitle: data.settings.homeBestTitle || EMPTY.homeBestTitle,
        homeBestLead: data.settings.homeBestLead || EMPTY.homeBestLead,
        homeReviewsTitle: data.settings.homeReviewsTitle || EMPTY.homeReviewsTitle,
        homeReviewsLead: data.settings.homeReviewsLead || EMPTY.homeReviewsLead,
        menuIconHome: data.settings.menuIconHome || '',
        menuIconShop: data.settings.menuIconShop || '',
        menuIconBracelet: data.settings.menuIconBracelet || '',
        menuIconBest: data.settings.menuIconBest || '',
        menuIconAbout: data.settings.menuIconAbout || '',
      })
      setNote(data.note || '')
      setMsg('Settings saved successfully')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function uploadMedia(field, file, kind) {
    if (!file) return
    setUploading(field)
    setError('')
    setMsg('')
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('kind', kind)
      const data = await adminApi('/api/admin/upload', { method: 'POST', body })
      setForm((f) => ({ ...f, [field]: data.url }))
      const labels = {
        heroVideoDesktop: 'Desktop video',
        heroVideoMobile: 'Mobile video',
        heroPoster: 'Desktop poster',
        heroPosterMobile: 'Mobile poster',
        menuIconHome: 'Home icon',
        menuIconShop: 'Shop icon',
        menuIconBracelet: 'Know your Bracelet icon',
        menuIconBest: 'Best Sellers icon',
        menuIconAbout: 'About us icon',
      }
      setMsg(`${labels[field] || 'Image'} uploaded — click Save to apply`)
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
              onUpload={(field, file) => uploadMedia(field, file, 'video')}
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
              onUpload={(field, file) => uploadMedia(field, file, 'video')}
              onPathChange={(v) => setForm((f) => ({ ...f, heroVideoMobile: v }))}
            />
          </div>

          <div className="admin-card__divider" />

          <div className="admin-media-grid">
            <PosterSlot
              title="Desktop poster"
              badge="Before video"
              hint="Recommended 1920 × 823 px · 21:9 · JPG or WebP"
              value={form.heroPoster}
              field="heroPoster"
              uploading={uploading}
              onUpload={(field, file) => uploadMedia(field, file, 'image')}
              onPathChange={(v) => setForm((f) => ({ ...f, heroPoster: v }))}
            />
            <PosterSlot
              title="Mobile poster"
              badge="Before video"
              hint="Recommended 1080 × 1440 px · 3:4 · JPG or WebP"
              value={form.heroPosterMobile}
              field="heroPosterMobile"
              uploading={uploading}
              onUpload={(field, file) => uploadMedia(field, file, 'image')}
              onPathChange={(v) => setForm((f) => ({ ...f, heroPosterMobile: v }))}
            />
          </div>

          <div className="admin-card__divider" />

          <div className="admin-form-grid two">
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
              <h2>Mobile menu icons</h2>
              <p>Home, Shop, Know your Bracelet, Best Sellers, and About us. Clear the URL and save to keep the current icon.</p>
            </div>
          </div>
          <div className="admin-media-grid">
            <PosterSlot
              title="Home"
              badge="Menu"
              hint="Square image · JPG, PNG, or WebP"
              value={form.menuIconHome}
              field="menuIconHome"
              uploading={uploading}
              onUpload={(field, file) => uploadMedia(field, file, 'image')}
              onPathChange={(v) => setForm((f) => ({ ...f, menuIconHome: v }))}
            />
            <PosterSlot
              title="Shop"
              badge="Menu"
              hint="Square image · JPG, PNG, or WebP"
              value={form.menuIconShop}
              field="menuIconShop"
              uploading={uploading}
              onUpload={(field, file) => uploadMedia(field, file, 'image')}
              onPathChange={(v) => setForm((f) => ({ ...f, menuIconShop: v }))}
            />
            <PosterSlot
              title="Know your Bracelet"
              badge="Menu"
              hint="Square image · JPG, PNG, or WebP"
              value={form.menuIconBracelet}
              field="menuIconBracelet"
              uploading={uploading}
              onUpload={(field, file) => uploadMedia(field, file, 'image')}
              onPathChange={(v) => setForm((f) => ({ ...f, menuIconBracelet: v }))}
            />
            <PosterSlot
              title="Best Sellers"
              badge="Menu"
              hint="Square image · JPG, PNG, or WebP"
              value={form.menuIconBest}
              field="menuIconBest"
              uploading={uploading}
              onUpload={(field, file) => uploadMedia(field, file, 'image')}
              onPathChange={(v) => setForm((f) => ({ ...f, menuIconBest: v }))}
            />
            <PosterSlot
              title="About us"
              badge="Menu"
              hint="Square image · JPG, PNG, or WebP"
              value={form.menuIconAbout}
              field="menuIconAbout"
              uploading={uploading}
              onUpload={(field, file) => uploadMedia(field, file, 'image')}
              onPathChange={(v) => setForm((f) => ({ ...f, menuIconAbout: v }))}
            />
          </div>
        </section>

        <section className="admin-card admin-card--lg">
          <div className="admin-card__head">
            <div>
              <h2>Homepage sections</h2>
              <p>Edit the headings shown above Shop by Category, Best Sellers, and Testimonials.</p>
            </div>
          </div>

          <div className="admin-form-grid">
            <p className="admin-kicker">Shop by Category</p>
            <label className="admin-field">
              <span>Small label</span>
              <input
                type="text"
                value={form.homeCategoryLabel}
                onChange={(e) => setForm((f) => ({ ...f, homeCategoryLabel: e.target.value }))}
              />
            </label>
            <label className="admin-field">
              <span>Heading</span>
              <input
                type="text"
                value={form.homeCategoryTitle}
                onChange={(e) => setForm((f) => ({ ...f, homeCategoryTitle: e.target.value }))}
              />
            </label>
            <label className="admin-field">
              <span>Description</span>
              <textarea
                rows={2}
                value={form.homeCategoryLead}
                onChange={(e) => setForm((f) => ({ ...f, homeCategoryLead: e.target.value }))}
              />
            </label>

            <p className="admin-kicker">Best Sellers</p>
            <label className="admin-field">
              <span>Small label</span>
              <input
                type="text"
                value={form.homeBestLabel}
                onChange={(e) => setForm((f) => ({ ...f, homeBestLabel: e.target.value }))}
              />
            </label>
            <label className="admin-field">
              <span>Heading</span>
              <input
                type="text"
                value={form.homeBestTitle}
                onChange={(e) => setForm((f) => ({ ...f, homeBestTitle: e.target.value }))}
              />
            </label>
            <label className="admin-field">
              <span>Description</span>
              <textarea
                rows={2}
                value={form.homeBestLead}
                onChange={(e) => setForm((f) => ({ ...f, homeBestLead: e.target.value }))}
              />
            </label>

            <p className="admin-kicker">Testimonials</p>
            <label className="admin-field">
              <span>Heading</span>
              <input
                type="text"
                value={form.homeReviewsTitle}
                onChange={(e) => setForm((f) => ({ ...f, homeReviewsTitle: e.target.value }))}
              />
            </label>
            <label className="admin-field">
              <span>Description</span>
              <textarea
                rows={2}
                value={form.homeReviewsLead}
                onChange={(e) => setForm((f) => ({ ...f, homeReviewsLead: e.target.value }))}
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
