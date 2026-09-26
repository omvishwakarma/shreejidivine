'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import ShopNav from '../../components/ShopNav'
import Footer from '../../components/Footer'
import AddToCartButton from '../../components/AddToCartButton'
import { api } from '../../lib/api'
import { formatINR, toTitleCase, discountPct } from '../../lib/products'
import '../ecom.css'

export default function ShopClient() {
  const searchParams = useSearchParams()
  const category = searchParams.get('category') || ''
  const subcategory = searchParams.get('subcategory') || ''

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [sort, setSort] = useState('featured')
  const [priceFilter, setPriceFilter] = useState('all')
  const searchRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    const qs = new URLSearchParams()
    if (subcategory) qs.set('subcategory', subcategory)
    else if (category) qs.set('category', category)
    const path = qs.toString() ? `/api/products?${qs}` : '/api/products'

    Promise.all([api(path), fetch('/api/categories?nav=1').then((r) => r.json())])
      .then(([prod, cats]) => {
        setProducts(prod.products || [])
        setCategories(cats.categories || [])
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [category, subcategory])

  const title = useMemo(() => {
    if (!category && !subcategory) return 'All Products'
    const parent = categories.find((c) => c.slug === category)
    if (subcategory && parent) {
      const child = (parent.children || []).find((c) => c.slug === subcategory)
      return child?.name || parent.name
    }
    return parent?.name || 'Shop'
  }, [categories, category, subcategory])

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 1) return []
    return products
      .filter((p) => `${p.name || ''} ${p.tagline || ''}`.toLowerCase().includes(q))
      .slice(0, 6)
  }, [products, query])

  useEffect(() => {
    function onPointerDown(event) {
      if (!searchRef.current?.contains(event.target)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = products.filter((p) => {
      if (q) {
        const hay = `${p.name || ''} ${p.tagline || ''}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      const price = Number(p.price) || 0
      if (priceFilter === 'sale') return Boolean(p.compareAt && p.compareAt > price)
      if (priceFilter === 'under500') return price < 500
      if (priceFilter === '500to999') return price >= 500 && price < 1000
      if (priceFilter === '1000plus') return price >= 1000
      return true
    })
    list = [...list]
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price)
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price)
    else if (sort === 'name-asc') list.sort((a, b) => String(a.name).localeCompare(String(b.name)))
    else if (sort === 'name-desc') list.sort((a, b) => String(b.name).localeCompare(String(a.name)))
    return list
  }, [products, query, sort, priceFilter])

  const filtersActive = Boolean(query.trim()) || sort !== 'featured' || priceFilter !== 'all'

  function clearTools() {
    setQuery('')
    setSearchOpen(false)
    setSort('featured')
    setPriceFilter('all')
  }

  const filterLinks = useMemo(() => {
    const links = [{ href: '/shop', label: 'All', active: !category && !subcategory, image: '' }]
    categories.forEach((c) => {
      links.push({
        href: `/shop?category=${c.slug}`,
        label: c.name,
        image: c.image || '',
        active: category === c.slug && !subcategory,
      })
      if (category === c.slug && c.children?.length) {
        c.children.forEach((child) => {
          links.push({
            href: `/shop?category=${c.slug}&subcategory=${child.slug}`,
            label: child.name,
            image: child.image || c.image || '',
            active: subcategory === child.slug,
            sub: true,
          })
        })
      }
    })
    return links
  }, [categories, category, subcategory])

  return (
    <div className="ecom-page">
      <ShopNav />
      <div className="ecom-wrap ecom-wrap--shop">
        <p className="breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true"> / </span>
          {category || subcategory ? (
            <>
              <Link href="/shop">Shop</Link>
              <span aria-hidden="true"> / </span>
              <span>{title}</span>
            </>
          ) : (
            <span>Shop</span>
          )}
        </p>

        <div className="shop-filters" role="navigation" aria-label="Shop categories">
          {filterLinks.map((link) => (
            <Link
              key={link.href + link.label}
              href={link.href}
              className={`${link.active ? 'is-active' : ''} ${link.sub ? 'is-sub' : ''}`.trim()}
            >
              {link.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={link.image} alt="" className="shop-filters__icon" />
              ) : (
                <span className="shop-filters__icon shop-filters__icon--all" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" fill="currentColor" />
                    <rect x="13.5" y="3.5" width="7" height="7" rx="1.2" fill="currentColor" />
                    <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" fill="currentColor" />
                    <rect x="13.5" y="13.5" width="7" height="7" rx="1.2" fill="currentColor" />
                  </svg>
                </span>
              )}
              {link.label}
            </Link>
          ))}
        </div>

        <div className="shop-tools">
          <div className="shop-tools__search" ref={searchRef}>
            <label>
              <span className="sr-only">Search products</span>
              <svg className="shop-tools__search-icon" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.75" />
                <path d="M16 16.5 20 20.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSearchOpen(true)
                }}
                onFocus={() => setSearchOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setSearchOpen(false)
                }}
                placeholder="Search products"
                autoComplete="off"
                role="combobox"
                aria-expanded={searchOpen && query.trim().length > 0}
                aria-controls="shop-search-suggestions"
                aria-autocomplete="list"
              />
            </label>
            {searchOpen && query.trim() ? (
              <ul id="shop-search-suggestions" className="shop-suggest" role="listbox">
                {suggestions.length === 0 ? (
                  <li className="shop-suggest__empty">No matching products</li>
                ) : (
                  suggestions.map((p) => (
                    <li key={p.id} role="option">
                      <Link
                        href={`/shop/${p.slug}`}
                        className="shop-suggest__item"
                        onClick={() => setSearchOpen(false)}
                      >
                        <Image src={p.image} alt="" width={72} height={90} />
                        <span className="shop-suggest__meta">
                          <span className="shop-suggest__name">{toTitleCase(p.name)}</span>
                          <span className="shop-suggest__price">{formatINR(p.price)}</span>
                        </span>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            ) : null}
          </div>
          <label className="shop-tools__select">
            <span>Filter</span>
            <select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}>
              <option value="all">All prices</option>
              <option value="sale">On sale</option>
              <option value="under500">Under ₹500</option>
              <option value="500to999">₹500 – ₹999</option>
              <option value="1000plus">₹1000+</option>
            </select>
          </label>
          <label className="shop-tools__select">
            <span>Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A–Z</option>
              <option value="name-desc">Name: Z–A</option>
            </select>
          </label>
          {!loading && !error ? (
            <p className="shop-tools__count">
              {visible.length} {visible.length === 1 ? 'product' : 'products'}
            </p>
          ) : null}
          {filtersActive ? (
            <button type="button" className="shop-tools__clear" onClick={clearTools}>
              Clear
            </button>
          ) : null}
        </div>

        {loading ? <div className="empty-state">Loading products…</div> : null}
        {error ? (
          <div className="empty-state">
            <p>Could not load products: {error}</p>
          </div>
        ) : null}

        {!loading && !error ? (
          products.length === 0 ? (
            <div className="empty-state">
              <p>No products in this category yet.</p>
              <Link href="/shop" className="btn-sm btn-primary">
                View all
              </Link>
            </div>
          ) : visible.length === 0 ? (
            <div className="empty-state">
              <p>No products match your search or filter.</p>
              <button type="button" className="btn-sm btn-primary" onClick={clearTools}>
                Clear
              </button>
            </div>
          ) : (
            <div className="ecom-grid">
              {visible.map((p) => {
                const off = discountPct(p.price, p.compareAt)
                return (
                <article key={p.id} className="product-card">
                  <Link href={`/shop/${p.slug}`} className="product-card__media">
                    {p.badge ? <span className="product-card__badge">{p.badge}</span> : null}
                    <Image
                      src={p.image}
                      alt={p.name}
                      width={700}
                      height={600}
                      sizes="(max-width:560px) 50vw, (max-width:960px) 45vw, 360px"
                    />
                  </Link>
                  <div className="product-card__body">
                    <Link href={`/shop/${p.slug}`}>
                      <h2 className="product-card__name">{toTitleCase(p.name)}</h2>
                    </Link>
                    <div className="product-card__price">
                      <strong>{formatINR(p.price)}</strong>
                      {p.compareAt ? <s>{formatINR(p.compareAt)}</s> : null}
                      {off > 0 ? <span className="product-card__save">{off}% off</span> : null}
                    </div>
                    <div className="product-card__actions">
                      <AddToCartButton product={p} />
                    </div>
                  </div>
                </article>
                )
              })}
            </div>
          )
        ) : null}
      </div>
      <Footer />
    </div>
  )
}
