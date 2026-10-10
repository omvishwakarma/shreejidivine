'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { adminApi, formatINR } from '../../../../lib/adminApi'
import { useAdminToasts } from '../../../../components/admin/adminToast'
import { plainTextToHtml } from '../../../../lib/productHtml'
import { RASHIS } from '../../../../lib/rashi'
import { applyCategoryAssignments, categoryAssignmentsForProduct } from '../../../../lib/productCategories'

const AdminRichTextEditor = dynamic(() => import('../../../../components/AdminRichTextEditor'), {
  ssr: false,
  loading: () => <div className="admin-rte admin-rte--loading">Loading editor…</div>,
})

const empty = {
  slug: '',
  name: '',
  tagline: '',
  price: 699,
  compareAt: '',
  purchaseCost: '',
  image: '',
  gallery: [],
  video: '',
  badge: '',
  tags: [],
  category: 'singles',
  categorySlug: '',
  subcategorySlug: '',
  categoryAssignments: [],
  stock: 50,
  stone: '',
  description: '',
  highlights: '',
  reviews: [],
  colours: [],
  fragrances: [],
  active: true,
  bestSeller: false,
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function assignmentLabel(tree, assignment) {
  const parent = (tree || []).find((item) => item.slug === assignment.categorySlug)
  if (!parent) {
    return assignment.subcategorySlug
      ? `${assignment.categorySlug} / ${assignment.subcategorySlug}`
      : assignment.categorySlug
  }
  if (!assignment.subcategorySlug) return parent.name
  const child = (parent.children || []).find((item) => item.slug === assignment.subcategorySlug)
  return `${parent.name} / ${child?.name || assignment.subcategorySlug}`
}

function CategoryPicker({ tree, value, onChange }) {
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)
  const assignments = Array.isArray(value) ? value : []

  useEffect(() => {
    function onPointerDown(event) {
      if (!boxRef.current?.contains(event.target)) setOpen(false)
    }
    function onKey(event) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const summary = assignments.length
    ? assignments.map((item) => assignmentLabel(tree, item)).join(', ')
    : 'Select categories'

  function toggleParent(slug) {
    const selected = assignments.some((item) => item.categorySlug === slug)
    onChange(selected ? assignments.filter((item) => item.categorySlug !== slug) : [...assignments, { categorySlug: slug, subcategorySlug: '' }])
  }

  function toggleChild(parentSlug, childSlug) {
    const selected = assignments.some(
      (item) => item.categorySlug === parentSlug && item.subcategorySlug === childSlug
    )
    if (selected) {
      onChange(
        assignments.filter(
          (item) => !(item.categorySlug === parentSlug && item.subcategorySlug === childSlug)
        )
      )
      return
    }
    onChange([
      ...assignments.filter((item) => !(item.categorySlug === parentSlug && !item.subcategorySlug)),
      { categorySlug: parentSlug, subcategorySlug: childSlug },
    ])
  }

  return (
    <div className="admin-cat-picker" ref={boxRef}>
      <button
        type="button"
        className="admin-cat-picker__button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{summary}</span>
        <span aria-hidden="true">{open ? '▴' : '▾'}</span>
      </button>
      {open ? (
        <div className="admin-cat-picker__menu">
          {tree.length === 0 ? (
            <p>No categories yet. Add them under Categories first.</p>
          ) : (
            tree.map((parent) => {
              const parentOn = assignments.some((item) => item.categorySlug === parent.slug)
              return (
                <div key={parent.id || parent.slug} className="admin-cat-picker__group">
                  <label>
                    <input
                      type="checkbox"
                      checked={parentOn}
                      onChange={() => toggleParent(parent.slug)}
                    />
                    <span>{parent.name}</span>
                  </label>
                  {(parent.children || []).map((child) => (
                    <label key={child.id || child.slug} className="is-child">
                      <input
                        type="checkbox"
                        checked={assignments.some(
                          (item) =>
                            item.categorySlug === parent.slug && item.subcategorySlug === child.slug
                        )}
                        onChange={() => toggleChild(parent.slug, child.slug)}
                      />
                      <span>{child.name}</span>
                    </label>
                  ))}
                </div>
              )
            })
          )}
        </div>
      ) : null}
    </div>
  )
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(empty)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  useAdminToasts(msg, error)
  const [uploading, setUploading] = useState('')
  const [saving, setSaving] = useState(false)
  const [addQty, setAddQty] = useState('')
  const [tagDraft, setTagDraft] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [activeFilter, setActiveFilter] = useState('all')
  const [catTree, setCatTree] = useState([])
  const [loading, setLoading] = useState(true)
  const [priceMode, setPriceMode] = useState(false)
  const [priceDrafts, setPriceDrafts] = useState({})
  const [savingPrices, setSavingPrices] = useState(false)
  const [savingPriceId, setSavingPriceId] = useState(null)
  const imageRef = useRef(null)
  const videoRef = useRef(null)
  const formRef = useRef(null)
  const imageInputId = useId()
  const videoInputId = useId()
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
          p.category === categoryFilter ||
          (p.categoryAssignments || []).some(
            (item) =>
              item.categorySlug === categoryFilter || item.subcategorySlug === categoryFilter
          )
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
        ...(p.tags || []),
        p.description,
        p.categorySlug,
        p.subcategorySlug,
        ...(p.categoryAssignments || []).flatMap((item) => [item.categorySlug, item.subcategorySlug]),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [products, search, categoryFilter, activeFilter])

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

  const knownTags = useMemo(() => {
    const map = new Map()
    for (const rashi of RASHIS) {
      map.set(rashi.name.toLowerCase(), {
        value: rashi.name,
        hint: rashi.english,
        symbol: rashi.symbol,
      })
    }
    for (const product of products) {
      for (const tag of product.tags || []) {
        const value = String(tag || '').trim()
        const key = value.toLowerCase()
        if (!value || map.has(key)) continue
        map.set(key, { value, hint: '', symbol: '' })
      }
    }
    return [...map.values()]
  }, [products])

  const tagSuggestions = useMemo(() => {
    const q = tagDraft.trim().toLowerCase()
    const taken = new Set((form.tags || []).map((tag) => tag.toLowerCase()))
    return knownTags.filter((item) => {
      if (taken.has(item.value.toLowerCase())) return false
      if (!q) return true
      return item.value.toLowerCase().includes(q) || item.hint.toLowerCase().includes(q)
    })
  }, [tagDraft, form.tags, knownTags])

  function addTag(value) {
    const tag = String(value || '').trim().replace(/\s+/g, ' ')
    if (!tag) return
    setForm((current) => {
      const tags = current.tags || []
      if (tags.some((item) => item.toLowerCase() === tag.toLowerCase())) return current
      return { ...current, tags: [...tags, tag].slice(0, 20) }
    })
    setTagDraft('')
  }

  function removeTag(tag) {
    setForm((current) => ({
      ...current,
      tags: (current.tags || []).filter((item) => item.toLowerCase() !== tag.toLowerCase()),
    }))
  }

  function openAdd() {
    setEditingId(null)
    setForm(empty)
    setAddQty('')
    setTagDraft('')
    slugTouched.current = false
    setError('')
    setMsg('')
    setFormOpen(true)
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  function openEdit(p) {
    setEditingId(p.id)
    setTagDraft('')
    slugTouched.current = true
    const gallery = Array.isArray(p.gallery) && p.gallery.length
      ? p.gallery
      : p.image
        ? [p.image]
        : []
    setForm({
      slug: p.slug,
      name: p.name,
      tagline: p.tagline || '',
      price: p.price,
      compareAt: p.compareAt ?? '',
      purchaseCost: p.purchaseCost ?? '',
      image: p.image || gallery[0] || '',
      gallery,
      video: p.video || '',
      badge: p.badge || '',
      tags: Array.isArray(p.tags) ? p.tags : [],
      category: p.category || 'singles',
      categorySlug: p.categorySlug || '',
      subcategorySlug: p.subcategorySlug || '',
      categoryAssignments: categoryAssignmentsForProduct(p),
      stock: p.stock,
      stone: p.stone || '',
      description: plainTextToHtml(p.description || ''),
      highlights: (p.highlights || []).join(', '),
      reviews: Array.isArray(p.reviews)
        ? p.reviews.map((review) => ({
            id: review.id || '',
            name: review.name || '',
            stars: review.stars || 5,
            text: review.text || '',
            images: review.images || [],
            video: review.video || '',
            instagram: review.instagram || '',
            status: review.status === 'pending' ? 'pending' : 'approved',
          }))
        : [],
      colours: Array.isArray(p.colours)
        ? p.colours.map((c) => ({
            name: c.name || '',
            hex: c.hex || '',
            image: c.image || '',
          }))
        : [],
      fragrances: Array.isArray(p.fragrances)
        ? p.fragrances.map((f) => ({
            name: f.name || '',
            price: f.price ?? '',
            image: f.image || '',
          }))
        : [],
      active: p.active !== false,
      bestSeller: p.bestSeller === true,
    })
    setAddQty('')
    setError('')
    setMsg('')
    setFormOpen(true)
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingId(null)
    setForm(empty)
    setAddQty('')
    slugTouched.current = false
    setError('')
    setMsg('')
  }

  async function uploadFiles(files, kind) {
    const list = Array.from(files || []).filter(Boolean)
    if (!list.length) return
    setError('')
    setMsg('')
    setUploading(kind)
    try {
      const urls = []
      for (const file of list) {
        const body = new FormData()
        body.append('file', file)
        body.append('kind', kind === 'video' ? 'video' : 'image')
        const data = await adminApi('/api/admin/upload', { method: 'POST', body })
        urls.push(data.url)
      }

      if (kind === 'video') {
        setForm((f) => ({ ...f, video: urls[0] || '' }))
        setMsg('Video uploaded')
      } else {
        setForm((f) => {
          const gallery = [...(f.gallery || []), ...urls].slice(0, 12)
          return {
            ...f,
            gallery,
            image: f.image || gallery[0] || '',
          }
        })
        setMsg(urls.length > 1 ? `${urls.length} images uploaded` : 'Image uploaded')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading('')
      if (imageRef.current) imageRef.current.value = ''
      if (videoRef.current) videoRef.current.value = ''
    }
  }

  async function uploadVariantImage(type, index, file) {
    if (!file) return
    const key = `${type}-${index}`
    setError('')
    setMsg('')
    setUploading(key)
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('kind', 'image')
      const data = await adminApi('/api/admin/upload', { method: 'POST', body })
      setForm((f) => {
        if (type === 'colour') {
          const colours = [...(f.colours || [])]
          colours[index] = { ...colours[index], image: data.url }
          return { ...f, colours }
        }
        const fragrances = [...(f.fragrances || [])]
        fragrances[index] = { ...fragrances[index], image: data.url }
        return { ...f, fragrances }
      })
      setMsg('Variation image uploaded')
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading('')
    }
  }

  async function approveReview(review, index) {
    if (review?.id && editingId) {
      try {
        await adminApi(`/api/products/${editingId}/reviews`, {
          method: 'PATCH',
          body: JSON.stringify({ id: review.id, status: 'approved' }),
        })
        updateReview(index, { status: 'approved' })
        setMsg('Review approved')
      } catch (err) {
        setError(err.message)
      }
      return
    }
    updateReview(index, { status: 'approved' })
  }

  function updateReview(index, patch) {
    setForm((current) => {
      const reviews = [...(current.reviews || [])]
      reviews[index] = { ...reviews[index], ...patch }
      return { ...current, reviews }
    })
  }

  async function uploadReviewFiles(index, files, kind) {
    const list = Array.from(files || []).filter(Boolean)
    if (!list.length) return
    const key = `review-${kind}-${index}`
    setError('')
    setMsg('')
    setUploading(key)
    try {
      const urls = []
      for (const file of list) {
        const body = new FormData()
        body.append('file', file)
        body.append('kind', kind)
        const data = await adminApi('/api/admin/upload', { method: 'POST', body })
        urls.push(data.url)
      }
      if (kind === 'video') {
        updateReview(index, { video: urls[0] || '' })
        setMsg('Review video uploaded')
      } else {
        setForm((current) => {
          const reviews = [...(current.reviews || [])]
          const images = [...(reviews[index]?.images || []), ...urls].slice(0, 8)
          reviews[index] = { ...reviews[index], images }
          return { ...current, reviews }
        })
        setMsg(urls.length > 1 ? `${urls.length} review images uploaded` : 'Review image uploaded')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading('')
    }
  }

  function removeGalleryImage(index) {
    setForm((f) => {
      const gallery = (f.gallery || []).filter((_, i) => i !== index)
      return {
        ...f,
        gallery,
        image: gallery[0] || '',
      }
    })
  }

  function setPrimaryImage(index) {
    setForm((f) => {
      const gallery = [...(f.gallery || [])]
      if (index < 0 || index >= gallery.length) return f
      const [picked] = gallery.splice(index, 1)
      gallery.unshift(picked)
      return { ...f, gallery, image: picked }
    })
  }

  function moveGalleryImage(index, dir) {
    setForm((f) => {
      const gallery = [...(f.gallery || [])]
      const j = index + dir
      if (j < 0 || j >= gallery.length) return f
      ;[gallery[index], gallery[j]] = [gallery[j], gallery[index]]
      return { ...f, gallery, image: gallery[0] || '' }
    })
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setMsg('')
    setSaving(true)
    const gallery = (form.gallery || []).filter(Boolean)
    if (!gallery.length && !form.image) {
      setError('Add at least one product image')
      setSaving(false)
      return
    }
    const image = form.image || gallery[0]
    const payload = applyCategoryAssignments({
      ...form,
      image,
      gallery: [...new Set([image, ...gallery].filter(Boolean))],
      video: form.video || '',
      price: Number(form.price),
      compareAt: form.compareAt === '' ? null : Number(form.compareAt),
      purchaseCost: form.purchaseCost === '' ? 0 : Number(form.purchaseCost),
      badge: form.badge || null,
      stock: Math.max(0, Math.floor(Number(form.stock) || 0)) + Math.max(0, Math.floor(Number(addQty) || 0)),
      highlights: String(form.highlights)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      colours: (form.colours || [])
        .map((c) => ({
          name: String(c.name || '').trim(),
          hex: String(c.hex || '').trim(),
          image: String(c.image || '').trim(),
        }))
        .filter((c) => c.name),
      fragrances: (form.fragrances || [])
        .map((f) => ({
          name: String(f.name || '').trim(),
          price: Number(f.price),
          image: String(f.image || '').trim(),
        }))
        .filter((f) => f.name && Number.isFinite(f.price) && f.price >= 0),
      reviews: (form.reviews || [])
        .map((review) => ({
          id: review.id || '',
          name: String(review.name || '').trim(),
          stars: Math.min(5, Math.max(1, Math.round(Number(review.stars) || 5))),
          text: String(review.text || '').trim(),
          images: (review.images || []).filter(Boolean).slice(0, 8),
          video: String(review.video || '').trim(),
          instagram: String(review.instagram || '').trim(),
          status: review.status === 'pending' ? 'pending' : 'approved',
        }))
        .filter((review) => review.text || review.images.length || review.video || review.instagram),
    })
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

  function openPriceMode() {
    const drafts = {}
    for (const product of products) {
      drafts[product.id] = {
        price: product.price ?? '',
        compareAt: product.compareAt ?? '',
      }
    }
    setPriceDrafts(drafts)
    setPriceMode(true)
    setError('')
    setMsg('')
  }

  function setPriceDraft(id, key, value) {
    setPriceDrafts((current) => ({
      ...current,
      [id]: {
        price: current[id]?.price ?? '',
        compareAt: current[id]?.compareAt ?? '',
        [key]: value,
      },
    }))
  }

  function readPriceDraft(product) {
    const draft = priceDrafts[product.id]
    if (!draft) return { error: `Enter a price for ${product.name}` }
    const price = Number(draft.price)
    const compareAt = draft.compareAt === '' ? null : Number(draft.compareAt)
    if (!Number.isFinite(price) || price < 0) {
      return { error: `Enter a valid price for ${product.name}` }
    }
    if (compareAt !== null && (!Number.isFinite(compareAt) || compareAt < 0)) {
      return { error: `Enter a valid compare-at price for ${product.name}` }
    }
    const previousCompare =
      product.compareAt == null || product.compareAt === '' ? null : Number(product.compareAt)
    const changed = price !== Number(product.price) || compareAt !== previousCompare
    return { price, compareAt, changed }
  }

  async function persistPrices(items) {
    await Promise.all(
      items.map((item) =>
        adminApi(`/api/products/${item.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ price: item.price, compareAt: item.compareAt }),
        })
      )
    )
    const saved = new Map(items.map((item) => [item.id, item]))
    setProducts((current) =>
      current.map((product) => {
        const next = saved.get(product.id)
        if (!next) return product
        return { ...product, price: next.price, compareAt: next.compareAt }
      })
    )
  }

  async function saveOnePrice(product) {
    const parsed = readPriceDraft(product)
    if (parsed.error) {
      setError(parsed.error)
      setMsg('')
      return
    }
    if (!parsed.changed) {
      setError('')
      setMsg(`No price change for ${product.name}`)
      return
    }
    setSavingPriceId(product.id)
    setError('')
    setMsg('')
    try {
      await persistPrices([{ id: product.id, price: parsed.price, compareAt: parsed.compareAt }])
      setMsg(`Saved price for ${product.name}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingPriceId(null)
    }
  }

  async function savePrices() {
    const changed = []
    for (const product of products) {
      const parsed = readPriceDraft(product)
      if (parsed.error) {
        setError(parsed.error)
        return
      }
      if (parsed.changed) changed.push({ id: product.id, price: parsed.price, compareAt: parsed.compareAt })
    }
    if (!changed.length) {
      setPriceMode(false)
      setMsg('No price changes')
      return
    }
    setSavingPrices(true)
    setError('')
    setMsg('')
    try {
      await persistPrices(changed)
      setPriceMode(false)
      setMsg(`Updated prices for ${changed.length} product${changed.length === 1 ? '' : 's'}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingPrices(false)
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
    const assignments = categoryAssignmentsForProduct(p)
    if (!assignments.length) return p.category || 'Uncategorized'
    return assignments.map((item) => assignmentLabel(catTree, item)).join(', ')
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
                    <div className="admin-field" style={{ gridColumn: '1 / -1' }}>
                      <span>Tags</span>
                      <div className="admin-tags">
                        {(form.tags || []).map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            className="admin-tags__chip"
                            onClick={() => removeTag(tag)}
                          >
                            {tag}
                            <span aria-hidden="true">×</span>
                          </button>
                        ))}
                        <input
                          value={tagDraft}
                          onChange={(e) => setTagDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addTag(tagDraft)
                            }
                          }}
                          placeholder="Type a tag or pick a Rashi"
                        />
                      </div>
                      {tagSuggestions.length ? (
                        <div className="admin-tags__suggest" role="listbox" aria-label="Tag suggestions">
                          {tagSuggestions.map((item) => (
                            <button
                              key={item.value.toLowerCase()}
                              type="button"
                              onClick={() => addTag(item.value)}
                            >
                              {item.symbol ? <span aria-hidden="true">{item.symbol}</span> : null}
                              {item.value}
                              {item.hint ? <em>{item.hint}</em> : null}
                            </button>
                          ))}
                        </div>
                      ) : null}
                      <small>
                        Rashi names and tags already used on products show here. A new tag is suggested next time after you save.
                      </small>
                    </div>
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
                      <span>Purchase cost (₹)</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.purchaseCost}
                        onChange={(e) => setForm((f) => ({ ...f, purchaseCost: e.target.value }))}
                      />
                      <small>Accounting only. This is not shown on the website.</small>
                    </label>
                    <label className="admin-field">
                      <span>Quantity</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={form.stock}
                        onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                      />
                    </label>
                    <label className="admin-field">
                      <span>Add quantity</span>
                      <span className="admin-qty-add">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={addQty}
                          placeholder="0"
                          onChange={(e) => setAddQty(e.target.value)}
                        />
                        <button
                          type="button"
                          className="admin-btn admin-btn-ghost"
                          onClick={() => {
                            const qty = Math.floor(Number(addQty))
                            if (!Number.isFinite(qty) || qty <= 0) {
                              setError('Enter a quantity greater than 0.')
                              return
                            }
                            setError('')
                            setForm((f) => ({
                              ...f,
                              stock: Math.max(0, Math.floor(Number(f.stock) || 0)) + qty,
                            }))
                            setAddQty('')
                          }}
                        >
                          Add
                        </button>
                      </span>
                      <small>Adds units to the quantity above, then save the product.</small>
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
                  <div className="admin-form-grid">
                    <div className="admin-field admin-field--full">
                      <span>Categories</span>
                      <CategoryPicker
                        tree={catTree}
                        value={form.categoryAssignments}
                        onChange={(categoryAssignments) =>
                          setForm((current) => ({ ...current, categoryAssignments }))
                        }
                      />
                      <small>
                        Tick every category or subcategory this product belongs to. A subcategory also
                        shows inside its parent category.
                      </small>
                    </div>
                  </div>
                </div>

                <div className="admin-form-section">
                  <h3>Details</h3>
                  <div className="admin-form-grid">
                    <div className="admin-field admin-field--full">
                      <span>Description</span>
                      <AdminRichTextEditor
                        value={form.description}
                        onChange={(html) => setForm((f) => ({ ...f, description: html }))}
                        placeholder="Write product description…"
                      />
                      <small>Use the toolbar for bold, headings, and lists</small>
                    </div>
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

                <div className="admin-form-section">
                  <div className="admin-variant-block__head">
                    <h3>Reviews <span className="admin-optional">(optional)</span></h3>
                    <button
                      type="button"
                      className="admin-btn admin-btn-ghost"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          reviews: [
                            ...(current.reviews || []),
                            { name: '', stars: 5, text: '', images: [], video: '', instagram: '', status: 'approved' },
                          ],
                        }))
                      }
                    >
                      + Add review
                    </button>
                  </div>
                  <p className="admin-page-sub" style={{ marginTop: 0 }}>
                    Customer reviews stay hidden until you approve them. Reviews you add here are shown on the product page after you save.
                  </p>
                  {(form.reviews || []).length === 0 ? (
                    <p className="admin-page-sub" style={{ margin: 0 }}>
                      No reviews yet.
                    </p>
                  ) : (
                    <div className="admin-review-list">
                      {(form.reviews || []).map((review, index) => (
                        <div key={`review-${index}`} className="admin-review-card">
                          <div className="admin-review-card__top">
                            <label className="admin-field">
                              <span>Name</span>
                              <input
                                value={review.name}
                                onChange={(e) => updateReview(index, { name: e.target.value })}
                                placeholder="Customer name"
                              />
                            </label>
                            <label className="admin-field">
                              <span>Stars</span>
                              <select
                                value={review.stars || 5}
                                onChange={(e) => updateReview(index, { stars: Number(e.target.value) })}
                              >
                                {[5, 4, 3, 2, 1].map((n) => (
                                  <option key={n} value={n}>
                                    {n} star{n === 1 ? '' : 's'}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <div className="admin-review-card__actions">
                              {review.status === 'pending' ? (
                                <button
                                  type="button"
                                  className="admin-btn admin-btn-primary"
                                  onClick={() => approveReview(review, index)}
                                >
                                  Approve
                                </button>
                              ) : (
                                <span className="admin-chip">Approved</span>
                              )}
                              <button
                                type="button"
                                className="admin-btn admin-btn-danger"
                                onClick={() =>
                                  setForm((current) => ({
                                    ...current,
                                    reviews: (current.reviews || []).filter((_, i) => i !== index),
                                  }))
                                }
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                          <label className="admin-field">
                            <span>Review text</span>
                            <textarea
                              rows={3}
                              value={review.text}
                              onChange={(e) => updateReview(index, { text: e.target.value })}
                              placeholder="What the customer said"
                            />
                          </label>
                          <label className="admin-field">
                            <span>Instagram link</span>
                            <input
                              value={review.instagram}
                              onChange={(e) => updateReview(index, { instagram: e.target.value })}
                              placeholder="https://www.instagram.com/reel/..."
                            />
                          </label>
                          <div className="admin-review-card__media">
                            <div>
                              <span>Photos</span>
                              <div className="admin-review-thumbs">
                                {(review.images || []).map((src, imageIndex) => (
                                  <div key={src} className="admin-review-thumbs__item">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={src} alt="" />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        updateReview(index, {
                                          images: review.images.filter((_, i) => i !== imageIndex),
                                        })
                                      }
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ))}
                              </div>
                              <label className="admin-btn admin-btn-ghost">
                                {uploading === `review-image-${index}` ? 'Uploading…' : 'Add photos'}
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp,image/gif"
                                  multiple
                                  disabled={!!uploading}
                                  onChange={(e) => {
                                    uploadReviewFiles(index, e.target.files, 'image')
                                    e.target.value = ''
                                  }}
                                />
                              </label>
                            </div>
                            <div>
                              <span>Video</span>
                              {review.video ? (
                                <video src={review.video} controls playsInline />
                              ) : (
                                <p className="admin-page-sub" style={{ margin: 0 }}>
                                  No video
                                </p>
                              )}
                              <div className="admin-row-actions">
                                <label className="admin-btn admin-btn-ghost">
                                  {uploading === `review-video-${index}` ? 'Uploading…' : 'Upload video'}
                                  <input
                                    type="file"
                                    accept="video/mp4,video/webm,video/quicktime"
                                    disabled={!!uploading}
                                    onChange={(e) => {
                                      uploadReviewFiles(index, e.target.files, 'video')
                                      e.target.value = ''
                                    }}
                                  />
                                </label>
                                {review.video ? (
                                  <button
                                    type="button"
                                    className="admin-btn admin-btn-ghost"
                                    onClick={() => updateReview(index, { video: '' })}
                                  >
                                    Remove video
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="admin-form-section">
                  <h3>Variations <span className="admin-optional">(optional)</span></h3>
                  <p className="admin-page-sub" style={{ marginTop: 0 }}>
                    Add colours and/or fragrances. Each fragrance can have its own price.
                  </p>

                  <div className="admin-variant-block">
                    <div className="admin-variant-block__head">
                      <strong>Colours</strong>
                      <button
                        type="button"
                        className="admin-btn admin-btn-ghost"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            colours: [...(f.colours || []), { name: '', hex: '', image: '' }],
                          }))
                        }
                      >
                        + Add colour
                      </button>
                    </div>
                    {(form.colours || []).length === 0 ? (
                      <p className="admin-page-sub" style={{ margin: 0 }}>
                        No colours — product sells without colour choice.
                      </p>
                    ) : (
                      <div className="admin-variant-rows">
                        {(form.colours || []).map((c, index) => (
                          <div key={`colour-${index}`} className="admin-variant-card">
                            <div className="admin-variant-card__media">
                              {c.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={c.image} alt="" />
                              ) : (
                                <span>No image</span>
                              )}
                              <label className="admin-variant-card__upload">
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp,image/gif"
                                  disabled={!!uploading}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) uploadVariantImage('colour', index, file)
                                    e.target.value = ''
                                  }}
                                />
                                {uploading === `colour-${index}` ? 'Uploading…' : c.image ? 'Change' : 'Upload'}
                              </label>
                              {c.image ? (
                                <button
                                  type="button"
                                  className="admin-btn admin-btn-ghost"
                                  onClick={() =>
                                    setForm((f) => {
                                      const colours = [...(f.colours || [])]
                                      colours[index] = { ...colours[index], image: '' }
                                      return { ...f, colours }
                                    })
                                  }
                                >
                                  Clear
                                </button>
                              ) : null}
                            </div>
                            <div className="admin-variant-card__fields">
                              <input
                                placeholder="Colour name"
                                value={c.name}
                                onChange={(e) =>
                                  setForm((f) => {
                                    const colours = [...(f.colours || [])]
                                    colours[index] = { ...colours[index], name: e.target.value }
                                    return { ...f, colours }
                                  })
                                }
                              />
                              <div className="admin-variant-card__row">
                                <input
                                  type="color"
                                  title="Swatch"
                                  value={c.hex && /^#/.test(c.hex) ? c.hex : '#8b5a2b'}
                                  onChange={(e) =>
                                    setForm((f) => {
                                      const colours = [...(f.colours || [])]
                                      colours[index] = { ...colours[index], hex: e.target.value }
                                      return { ...f, colours }
                                    })
                                  }
                                />
                                <button
                                  type="button"
                                  className="admin-btn admin-btn-danger"
                                  onClick={() =>
                                    setForm((f) => ({
                                      ...f,
                                      colours: (f.colours || []).filter((_, i) => i !== index),
                                    }))
                                  }
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="admin-variant-block" style={{ marginTop: '1rem' }}>
                    <div className="admin-variant-block__head">
                      <strong>Fragrances</strong>
                      <button
                        type="button"
                        className="admin-btn admin-btn-ghost"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            fragrances: [
                              ...(f.fragrances || []),
                              { name: '', price: f.price || '', image: '' },
                            ],
                          }))
                        }
                      >
                        + Add fragrance
                      </button>
                    </div>
                    {(form.fragrances || []).length === 0 ? (
                      <p className="admin-page-sub" style={{ margin: 0 }}>
                        No fragrances — base price above is used.
                      </p>
                    ) : (
                      <div className="admin-variant-rows">
                        {(form.fragrances || []).map((fr, index) => (
                          <div key={`frag-${index}`} className="admin-variant-card">
                            <div className="admin-variant-card__media">
                              {fr.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={fr.image} alt="" />
                              ) : (
                                <span>No image</span>
                              )}
                              <label className="admin-variant-card__upload">
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp,image/gif"
                                  disabled={!!uploading}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) uploadVariantImage('fragrance', index, file)
                                    e.target.value = ''
                                  }}
                                />
                                {uploading === `fragrance-${index}`
                                  ? 'Uploading…'
                                  : fr.image
                                    ? 'Change'
                                    : 'Upload'}
                              </label>
                              {fr.image ? (
                                <button
                                  type="button"
                                  className="admin-btn admin-btn-ghost"
                                  onClick={() =>
                                    setForm((f) => {
                                      const fragrances = [...(f.fragrances || [])]
                                      fragrances[index] = { ...fragrances[index], image: '' }
                                      return { ...f, fragrances }
                                    })
                                  }
                                >
                                  Clear
                                </button>
                              ) : null}
                            </div>
                            <div className="admin-variant-card__fields">
                              <input
                                placeholder="Fragrance name"
                                value={fr.name}
                                onChange={(e) =>
                                  setForm((f) => {
                                    const fragrances = [...(f.fragrances || [])]
                                    fragrances[index] = {
                                      ...fragrances[index],
                                      name: e.target.value,
                                    }
                                    return { ...f, fragrances }
                                  })
                                }
                              />
                              <div className="admin-variant-card__row">
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="Price ₹"
                                  value={fr.price}
                                  onChange={(e) =>
                                    setForm((f) => {
                                      const fragrances = [...(f.fragrances || [])]
                                      fragrances[index] = {
                                        ...fragrances[index],
                                        price: e.target.value,
                                      }
                                      return { ...f, fragrances }
                                    })
                                  }
                                />
                                <button
                                  type="button"
                                  className="admin-btn admin-btn-danger"
                                  onClick={() =>
                                    setForm((f) => ({
                                      ...f,
                                      fragrances: (f.fragrances || []).filter((_, i) => i !== index),
                                    }))
                                  }
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <aside className="admin-product-form__side">
                <div className="admin-form-section">
                  <h3>Images</h3>
                  <p className="admin-page-sub" style={{ marginTop: 0 }}>
                    Upload multiple photos. First image is the cover.
                  </p>
                  <div className="admin-gallery">
                    {(form.gallery || []).map((url, index) => (
                      <div key={`${url}-${index}`} className="admin-gallery__item">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" />
                        {index === 0 ? <span className="admin-gallery__badge">Cover</span> : null}
                        <div className="admin-gallery__actions">
                          <button
                            type="button"
                            className="admin-btn admin-btn-ghost"
                            disabled={index === 0}
                            onClick={() => moveGalleryImage(index, -1)}
                            aria-label="Move left"
                          >
                            ‹
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-ghost"
                            disabled={index >= (form.gallery || []).length - 1}
                            onClick={() => moveGalleryImage(index, 1)}
                            aria-label="Move right"
                          >
                            ›
                          </button>
                          {index !== 0 ? (
                            <button
                              type="button"
                              className="admin-btn admin-btn-ghost"
                              onClick={() => setPrimaryImage(index)}
                            >
                              Cover
                            </button>
                          ) : null}
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger"
                            onClick={() => removeGalleryImage(index)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <label
                    htmlFor={imageInputId}
                    className={`admin-dropzone ${uploading === 'image' ? 'is-busy' : ''}`}
                  >
                    <input
                      id={imageInputId}
                      ref={imageRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      multiple
                      onChange={(e) => {
                        uploadFiles(e.target.files, 'image')
                      }}
                      disabled={!!uploading}
                    />
                    <span className="admin-dropzone__title">
                      {uploading === 'image' ? 'Uploading images…' : 'Click to upload images'}
                    </span>
                    <span className="admin-dropzone__hint">
                      Multiple JPG / PNG / WEBP / GIF · max 5MB each · up to 12
                    </span>
                  </label>
                </div>

                <div className="admin-form-section">
                  <h3>Video</h3>
                  <p className="admin-page-sub" style={{ marginTop: 0 }}>
                    Optional — one product video.
                  </p>
                  {form.video ? (
                    <div className="admin-product-video">
                      <video src={form.video} controls playsInline muted preload="metadata" />
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger"
                        onClick={() => setForm((f) => ({ ...f, video: '' }))}
                      >
                        Remove video
                      </button>
                    </div>
                  ) : null}
                  <label
                    htmlFor={videoInputId}
                    className={`admin-dropzone ${uploading === 'video' ? 'is-busy' : ''}`}
                  >
                    <input
                      id={videoInputId}
                      ref={videoRef}
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) uploadFiles([file], 'video')
                      }}
                      disabled={!!uploading}
                    />
                    <span className="admin-dropzone__title">
                      {uploading === 'video'
                        ? 'Uploading video…'
                        : form.video
                          ? 'Replace video'
                          : 'Click to upload video'}
                    </span>
                    <span className="admin-dropzone__hint">MP4 / WEBM / MOV · max 80MB</span>
                  </label>
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
                  <label className="admin-toggle">
                    <input
                      type="checkbox"
                      checked={form.bestSeller}
                      onChange={(e) => setForm((f) => ({ ...f, bestSeller: e.target.checked }))}
                    />
                    <span>
                      <strong>Best seller</strong>
                      <small>Show this product in the homepage Best Sellers row</small>
                    </span>
                  </label>
                </div>
              </aside>
            </div>


            <div className="admin-sticky-actions">
              <p>{editingId ? 'Saving updates this product live.' : 'Create to add it to the catalog.'}</p>
              <div className="admin-row-actions">
                <button type="button" className="admin-btn admin-btn-ghost" onClick={closeForm}>
                  Cancel
                </button>
                <button
                  className="admin-btn admin-btn-primary"
                  type="submit"
                  disabled={!!uploading || saving}
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
          placeholder="Search name, slug, tag…"
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
              {priceMode
                ? 'Edit selling price and compare-at price, then save.'
                : `${filtered.length} of ${products.length} products`}
            </p>
          </div>
          {products.length > 0 ? (
            <div className="admin-row-actions">
              {priceMode ? (
                <>
                  <button
                    type="button"
                    className="admin-btn admin-btn-ghost"
                    onClick={() => setPriceMode(false)}
                    disabled={savingPrices}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn-primary"
                    onClick={savePrices}
                    disabled={savingPrices}
                  >
                    {savingPrices ? 'Saving…' : 'Save prices'}
                  </button>
                </>
              ) : (
                <button type="button" className="admin-btn admin-btn-primary" onClick={openPriceMode}>
                  Update price
                </button>
              )}
            </div>
          ) : null}
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
                  <th>Cost</th>
                  <th>Quantity</th>
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
                          {(p.tags || []).map((tag) => (
                            <span key={tag} className="admin-chip">
                              {tag}
                            </span>
                          ))}
                          {p.bestSeller ? <span className="admin-chip">Best seller</span> : null}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="admin-cat-pill">{categoryLabel(p)}</span>
                    </td>
                    <td>
                      {priceMode ? (
                        <div className="admin-price-edit">
                          <label>
                            <span>Price</span>
                            <input
                              type="number"
                              min="0"
                              value={priceDrafts[p.id]?.price ?? p.price ?? ''}
                              onChange={(e) => setPriceDraft(p.id, 'price', e.target.value)}
                            />
                          </label>
                          <label>
                            <span>Compare at</span>
                            <input
                              type="number"
                              min="0"
                              value={priceDrafts[p.id]?.compareAt ?? p.compareAt ?? ''}
                              onChange={(e) => setPriceDraft(p.id, 'compareAt', e.target.value)}
                            />
                          </label>
                        </div>
                      ) : (
                        <div className="admin-price-cell">
                          <strong>{formatINR(p.price)}</strong>
                          {p.compareAt ? (
                            <span className="admin-price-cell__compare">
                              {formatINR(p.compareAt)}
                            </span>
                          ) : null}
                        </div>
                      )}
                    </td>
                    <td>{formatINR(Number(p.purchaseCost) || 0)}</td>
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
                        {priceMode ? (
                          <button
                            type="button"
                            className="admin-btn admin-btn-primary"
                            onClick={() => saveOnePrice(p)}
                            disabled={savingPrices || savingPriceId === p.id}
                          >
                            {savingPriceId === p.id ? 'Saving…' : 'Save price'}
                          </button>
                        ) : null}
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
