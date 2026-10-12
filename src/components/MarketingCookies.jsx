'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { flushMetaQueue } from '../lib/meta'

const VISITOR_COOKIE = 'sj_vid'
const MAX_AGE = 60 * 60 * 24 * 180
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || ''
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'G-9DBEZTWPJ5'

function readCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : ''
}

function writeCookie(name, value) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax${secure}`
}

function visitorId() {
  const existing = readCookie(VISITOR_COOKIE)
  if (existing) return existing
  const id = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`
  writeCookie(VISITOR_COOKIE, id)
  return id
}

function loadMeta(pixelId, externalId) {
  if (!pixelId || window.fbq) return
  ;(function (f, b, e, v, n, t, s) {
    if (f.fbq) return
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
    }
    if (!f._fbq) f._fbq = n
    n.push = n
    n.loaded = true
    n.version = '2.0'
    n.queue = []
    t = b.createElement(e)
    t.async = true
    t.src = v
    s = b.getElementsByTagName(e)[0]
    s.parentNode.insertBefore(t, s)
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
  window.fbq('init', pixelId, { external_id: externalId })
  window.fbq('track', 'PageView')
  flushMetaQueue()
}

function loadGoogle(id) {
  if (!id || window.__sjGtagLoaded) return
  window.__sjGtagLoaded = true
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', id)
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
  document.head.appendChild(script)
}

export default function MarketingCookies() {
  const pathname = usePathname() || '/'
  const trackedPath = useRef('')

  useEffect(() => {
    if (pathname.startsWith('/admin')) return
    loadMeta(META_PIXEL_ID, visitorId())
    loadGoogle(GOOGLE_ADS_ID)
    if (trackedPath.current === pathname) return
    const first = trackedPath.current === ''
    trackedPath.current = pathname
    if (first) return
    if (window.fbq) window.fbq('track', 'PageView')
    if (window.gtag && GOOGLE_ADS_ID) {
      window.gtag('event', 'page_view', { page_path: pathname })
    }
  }, [pathname])

  return null
}
