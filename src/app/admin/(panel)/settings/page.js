'use client'

import { useEffect, useId, useState } from 'react'
import { adminApi, formatINR } from '../../../../lib/adminApi'
import { useAdminToasts } from '../../../../components/admin/adminToast'

const EMPTY = {
  shippingFee: 0,
  freeShippingMinOrder: 0,
  codEnabled: true,
  cartRewards: [],
  heroVideoDesktop: '/videos/home.mp4',
  heroVideoMobile: '/videos/home.mp4',
  heroPoster: '/images/banners/royal-chandan.png',
  heroPosterMobile: '',
  heroImagesDesktop: [],
  heroImagesMobile: [],
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
  authBanner: '/images/hero-banner.png',
  giftTabText: 'Claim your Free Diwali Gift',
  giftTabSlug: '',
  productDetailInstagramEnabled: false,
  productDetailRelatedEnabled: false,
  whatsappNumber: '8882301900',
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

function HeroSlides({
  title,
  hint,
  images,
  field,
  portrait,
  uploading,
  onUpload,
  onRemove,
  onMove,
  onChange,
}) {
  const inputId = useId()
  const busy = uploading === field

  return (
    <div className="admin-hero-slides">
      <div className="admin-hero-slides__head">
        <div>
          <h3>{title}</h3>
          <p>{hint}</p>
        </div>
        <label htmlFor={inputId} className={`admin-dropzone admin-dropzone--sm ${busy ? 'is-busy' : ''}`}>
          <input
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            disabled={!!uploading || images.length >= 8}
            onChange={(e) => {
              const files = Array.from(e.target.files || [])
              e.target.value = ''
              onUpload(field, files)
            }}
          />
          <span className="admin-dropzone__title">{busy ? 'Uploading…' : 'Add images'}</span>
        </label>
      </div>
      {images.length ? (
        <div className={`admin-hero-slides__list${portrait ? ' is-portrait' : ''}`}>
          {images.map((slide, index) => (
            <article key={`${slide.src}-${index}`} className="admin-hero-slide">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={slide.src} alt="" />
              <div className="admin-hero-slide__fields">
                <label>
                  <span>Small line</span>
                  <input
                    type="text"
                    maxLength={80}
                    placeholder="SHREEJI DIVINE"
                    value={slide.eyebrow || ''}
                    onChange={(e) => onChange(field, index, 'eyebrow', e.target.value)}
                  />
                </label>
                <label>
                  <span>Headline</span>
                  <input
                    type="text"
                    maxLength={160}
                    placeholder="A fragrance of divinity"
                    value={slide.headline || ''}
                    onChange={(e) => onChange(field, index, 'headline', e.target.value)}
                  />
                </label>
                <div className="admin-hero-slide__row">
                  <label>
                    <span>Button</span>
                    <input
                      type="text"
                      maxLength={40}
                      placeholder="Shop Now"
                      value={slide.ctaText || ''}
                      onChange={(e) => onChange(field, index, 'ctaText', e.target.value)}
                    />
                  </label>
                  <label>
                    <span>Button link</span>
                    <input
                      type="text"
                      maxLength={200}
                      placeholder="/shop"
                      value={slide.ctaHref || ''}
                      onChange={(e) => onChange(field, index, 'ctaHref', e.target.value)}
                    />
                  </label>
                </div>
                <div className="admin-hero-slide__actions">
                  <button type="button" disabled={index === 0} onClick={() => onMove(field, index, -1)}>
                    ←
                  </button>
                  <button
                    type="button"
                    disabled={index === images.length - 1}
                    onClick={() => onMove(field, index, 1)}
                  >
                    →
                  </button>
                  <button type="button" onClick={() => onRemove(field, index)}>
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="admin-hero-slides__empty">No slider images yet. The video banner stays until you add some.</p>
      )}
    </div>
  )
}

export default function AdminSettingsPage() {
  const [form, setForm] = useState(EMPTY)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  useAdminToasts(msg, error)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState('')
  const [products, setProducts] = useState([])

  async function load() {
    const data = await adminApi('/api/admin/settings')
    setForm({
      shippingFee: data.settings?.shippingFee ?? 0,
      freeShippingMinOrder: data.settings?.freeShippingMinOrder ?? 0,
      codEnabled: data.settings?.codEnabled !== false,
      cartRewards: data.settings?.cartRewards || [],
      heroVideoDesktop: data.settings?.heroVideoDesktop || EMPTY.heroVideoDesktop,
      heroVideoMobile: data.settings?.heroVideoMobile || EMPTY.heroVideoMobile,
      heroPoster: data.settings?.heroPoster || EMPTY.heroPoster,
      heroPosterMobile: data.settings?.heroPosterMobile || '',
      heroImagesDesktop: data.settings?.heroImagesDesktop || [],
      heroImagesMobile: data.settings?.heroImagesMobile || [],
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
      authBanner: data.settings?.authBanner || EMPTY.authBanner,
      giftTabText: data.settings?.giftTabText ?? EMPTY.giftTabText,
      giftTabSlug: data.settings?.giftTabSlug || '',
      productDetailInstagramEnabled: data.settings?.productDetailInstagramEnabled === true,
      productDetailRelatedEnabled: data.settings?.productDetailRelatedEnabled === true,
      whatsappNumber: data.settings?.whatsappNumber || '',
    })
    setNote(data.note || '')
  }

  useEffect(() => {
    Promise.all([
      load(),
      adminApi('/api/products/all')
        .then((data) => {
          const list = Array.isArray(data.products) ? data.products : []
          setProducts(
            list
              .filter((product) => product.slug && product.active !== false)
              .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
          )
        })
        .catch(() => setProducts([])),
    ])
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
          codEnabled: form.codEnabled !== false,
          cartRewards: (form.cartRewards || [])
            .map((reward) => ({
              amount: Number(reward.amount) || 0,
              label: String(reward.label || '').trim(),
              icon: reward.icon || 'gift',
            }))
            .filter((reward) => reward.amount > 0 && reward.label),
          heroVideoDesktop: form.heroVideoDesktop.trim(),
          heroVideoMobile: form.heroVideoMobile.trim(),
          heroPoster: form.heroPoster.trim(),
          heroPosterMobile: form.heroPosterMobile.trim(),
          heroImagesDesktop: form.heroImagesDesktop || [],
          heroImagesMobile: form.heroImagesMobile || [],
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
          authBanner: form.authBanner.trim() || EMPTY.authBanner,
          giftTabText: form.giftTabText.trim(),
          giftTabSlug: form.giftTabSlug.trim(),
          productDetailInstagramEnabled: form.productDetailInstagramEnabled === true,
          productDetailRelatedEnabled: form.productDetailRelatedEnabled === true,
          whatsappNumber: form.whatsappNumber.trim(),
        }),
      })
      setForm({
        shippingFee: data.settings.shippingFee,
        freeShippingMinOrder: data.settings.freeShippingMinOrder,
        codEnabled: data.settings.codEnabled !== false,
        cartRewards: data.settings.cartRewards || [],
        heroVideoDesktop: data.settings.heroVideoDesktop,
        heroVideoMobile: data.settings.heroVideoMobile,
        heroPoster: data.settings.heroPoster,
        heroPosterMobile: data.settings.heroPosterMobile || '',
        heroImagesDesktop: data.settings.heroImagesDesktop || [],
        heroImagesMobile: data.settings.heroImagesMobile || [],
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
        authBanner: data.settings.authBanner || EMPTY.authBanner,
        giftTabText: data.settings.giftTabText ?? EMPTY.giftTabText,
        giftTabSlug: data.settings.giftTabSlug || '',
        productDetailInstagramEnabled: data.settings.productDetailInstagramEnabled === true,
        productDetailRelatedEnabled: data.settings.productDetailRelatedEnabled === true,
        whatsappNumber: data.settings.whatsappNumber || '',
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
        menuIconBracelet: 'Know your Product icon',
        menuIconBest: 'Best Sellers icon',
        menuIconAbout: 'About us icon',
        authBanner: 'Login banner',
      }
      setMsg(`${labels[field] || 'Image'} uploaded — click Save to apply`)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading('')
    }
  }

  async function uploadSlides(field, files) {
    const list = Array.from(files || []).slice(0, 8)
    if (!list.length) return
    setUploading(field)
    setError('')
    setMsg('')
    try {
      const urls = []
      for (const file of list) {
        const body = new FormData()
        body.append('file', file)
        body.append('kind', 'image')
        const data = await adminApi('/api/admin/upload', { method: 'POST', body })
        if (data.url) urls.push(data.url)
      }
      setForm((current) => {
        const next = [...(current[field] || []), ...urls.map((src) => ({
          src,
          eyebrow: '',
          headline: '',
          ctaText: '',
          ctaHref: '',
        }))].filter((slide) => slide?.src).slice(0, 8)
        return { ...current, [field]: next }
      })
      setMsg('Slider images uploaded — click Save to apply')
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading('')
    }
  }

  function removeSlide(field, index) {
    setForm((current) => ({
      ...current,
      [field]: (current[field] || []).filter((_, i) => i !== index),
    }))
  }

  function moveSlide(field, index, dir) {
    setForm((current) => {
      const images = [...(current[field] || [])]
      const next = index + dir
      if (next < 0 || next >= images.length) return current
      const [item] = images.splice(index, 1)
      images.splice(next, 0, item)
      return { ...current, [field]: images }
    })
  }

  function updateSlide(field, index, key, value) {
    setForm((current) => ({
      ...current,
      [field]: (current[field] || []).map((slide, i) =>
        i === index ? { ...slide, [key]: value } : slide
      ),
    }))
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

      <section className="admin-card admin-card--lg">
        <div className="admin-card__head">
          <div>
            <h2>Meta catalog feed</h2>
            <p>
              Paste this URL in Meta Commerce Manager as the catalog data feed. Product IDs match the
              pixel events for Advantage+ catalog ads.
            </p>
          </div>
        </div>
        <p className="admin-page-sub" style={{ margin: 0 }}>
          <strong>https://www.shreejidivine.co/feeds/meta-catalog.csv</strong>
        </p>
      </section>

      <form className="admin-settings__form" onSubmit={onSubmit}>
        <section className="admin-card admin-card--lg">
          <div className="admin-card__head">
            <div>
              <h2>Product page</h2>
              <p>Show or hide these blocks under a product. They stay off until you turn them on.</p>
            </div>
          </div>
          <div className="admin-toggle-list">
            <label className="admin-toggle">
              <input
                type="checkbox"
                checked={form.productDetailInstagramEnabled === true}
                onChange={(e) =>
                  setForm((f) => ({ ...f, productDetailInstagramEnabled: e.target.checked }))
                }
              />
              <span>
                <strong>Shop the look on Instagram</strong>
                <small>The Instagram strip on the product detail page.</small>
              </span>
            </label>
            <label className="admin-toggle">
              <input
                type="checkbox"
                checked={form.productDetailRelatedEnabled === true}
                onChange={(e) =>
                  setForm((f) => ({ ...f, productDetailRelatedEnabled: e.target.checked }))
                }
              />
              <span>
                <strong>Diwali Offer Sale</strong>
                <small>The other products grid under the product details.</small>
              </span>
            </label>
          </div>
        </section>

        <section className="admin-card admin-card--lg">
          <div className="admin-card__head">
            <div>
              <h2>Free gift button</h2>
              <p>
                Left sticky button, same style as Know your Product. Leave the product empty to hide it.
              </p>
            </div>
          </div>
          <div className="admin-form-grid two">
            <label className="admin-field">
              <span>Button text</span>
              <input
                type="text"
                maxLength={80}
                value={form.giftTabText}
                onChange={(e) => setForm((f) => ({ ...f, giftTabText: e.target.value }))}
              />
            </label>
            <label className="admin-field">
              <span>Linked product</span>
              <select
                value={form.giftTabSlug}
                onChange={(e) => setForm((f) => ({ ...f, giftTabSlug: e.target.value }))}
              >
                <option value="">Hidden — no product</option>
                {form.giftTabSlug && !products.some((product) => product.slug === form.giftTabSlug) ? (
                  <option value={form.giftTabSlug}>{form.giftTabSlug}</option>
                ) : null}
                {products.map((product) => (
                  <option key={product.id || product.slug} value={product.slug}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="admin-card admin-card--lg">
          <div className="admin-card__head">
            <div>
              <h2>WhatsApp chat</h2>
              <p>Sticky chat button on the store. Leave the number empty to hide it.</p>
            </div>
          </div>
          <div className="admin-form-grid two">
            <label className="admin-field">
              <span>WhatsApp number</span>
              <input
                type="tel"
                inputMode="tel"
                maxLength={20}
                placeholder="8882301900"
                value={form.whatsappNumber}
                onChange={(e) => setForm((f) => ({ ...f, whatsappNumber: e.target.value }))}
              />
              <small>10-digit mobile. Country code is added automatically.</small>
            </label>
          </div>
        </section>

        <section className="admin-card admin-card--lg">
          <div className="admin-card__head">
            <div>
              <h2>Hero banner</h2>
              <p>Video stays as the fallback. Add desktop and mobile images to run an auto slider instead.</p>
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

          <div className="admin-hero-slides-grid">
            <HeroSlides
              title="Desktop slider"
              hint="Wide images, 21:9 works best. Each slide can have its own line, headline, and button."
              images={form.heroImagesDesktop}
              field="heroImagesDesktop"
              uploading={uploading}
              onUpload={uploadSlides}
              onRemove={removeSlide}
              onMove={moveSlide}
              onChange={updateSlide}
            />
            <HeroSlides
              title="Mobile slider"
              hint="Portrait 4:5 images. Each slide can have its own line, headline, and button."
              images={form.heroImagesMobile}
              field="heroImagesMobile"
              portrait
              uploading={uploading}
              onUpload={uploadSlides}
              onRemove={removeSlide}
              onMove={moveSlide}
              onChange={updateSlide}
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
              <h2>Login & signup banner</h2>
              <p>The large photo on the left of the login and signup pages.</p>
            </div>
          </div>
          <PosterSlot
            title="Banner image"
            badge="Auth"
            hint="Recommended 1400 × 1800 px · portrait · JPG or WebP"
            value={form.authBanner}
            field="authBanner"
            uploading={uploading}
            onUpload={(field, file) => uploadMedia(field, file, 'image')}
            onPathChange={(v) => setForm((f) => ({ ...f, authBanner: v }))}
          />
        </section>

        <section className="admin-card admin-card--lg">
          <div className="admin-card__head">
            <div>
              <h2>Mobile menu icons</h2>
              <p>Home, Shop, Know your Product, Best Sellers, and About us. Clear the URL and save to keep the current icon.</p>
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
              title="Know your Product"
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
            <label className="admin-toggle" style={{ gridColumn: '1 / -1' }}>
              <input
                type="checkbox"
                checked={form.codEnabled !== false}
                onChange={(e) => setForm((f) => ({ ...f, codEnabled: e.target.checked }))}
              />
              <span>
                <strong>{form.codEnabled === false ? 'COD off' : 'Cash on delivery'}</strong>
                <small>Turn off to hide COD at checkout. Online payment stays available.</small>
              </span>
            </label>
          </div>

          <div className="admin-rewards">
            <div className="admin-variant-block__head">
              <strong>Cart reward bar</strong>
              <button
                type="button"
                className="admin-btn admin-btn-ghost"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    cartRewards: [
                      ...(current.cartRewards || []),
                      { amount: '', label: '', icon: 'shipping' },
                    ].slice(0, 6),
                  }))
                }
              >
                + Add reward
              </button>
            </div>
            <p className="admin-page-sub" style={{ marginTop: 0 }}>
              Shown on the cart, and applied at checkout. A label like ₹99 off comes off the bill once the cart reaches that amount. The truck icon makes shipping free.
            </p>
            {(form.cartRewards || []).length === 0 ? (
              <p className="admin-page-sub" style={{ margin: 0 }}>
                No custom rewards saved yet. The cart still shows the default milestones until you add your own and save.
              </p>
            ) : (
              <div className="admin-rewards__list">
                {(form.cartRewards || []).map((reward, index) => (
                  <div key={index} className="admin-rewards__row">
                    <label className="admin-field">
                      <span>Cart amount (₹)</span>
                      <input
                        type="number"
                        min="1"
                        value={reward.amount}
                        onChange={(e) =>
                          setForm((current) => {
                            const cartRewards = [...(current.cartRewards || [])]
                            cartRewards[index] = { ...cartRewards[index], amount: e.target.value }
                            return { ...current, cartRewards }
                          })
                        }
                      />
                    </label>
                    <label className="admin-field">
                      <span>Reward</span>
                      <input
                        value={reward.label}
                        placeholder="Free Shipping"
                        onChange={(e) =>
                          setForm((current) => {
                            const cartRewards = [...(current.cartRewards || [])]
                            cartRewards[index] = { ...cartRewards[index], label: e.target.value }
                            return { ...current, cartRewards }
                          })
                        }
                      />
                    </label>
                    <label className="admin-field">
                      <span>Icon</span>
                      <select
                        value={reward.icon || 'gift'}
                        onChange={(e) =>
                          setForm((current) => {
                            const cartRewards = [...(current.cartRewards || [])]
                            cartRewards[index] = { ...cartRewards[index], icon: e.target.value }
                            return { ...current, cartRewards }
                          })
                        }
                      >
                        <option value="shipping">Truck</option>
                        <option value="discount">Rupee</option>
                        <option value="gift">Gift</option>
                        <option value="rupee">Offer</option>
                      </select>
                    </label>
                    <button
                      type="button"
                      className="admin-btn admin-btn-danger"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          cartRewards: (current.cartRewards || []).filter((_, i) => i !== index),
                        }))
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
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
