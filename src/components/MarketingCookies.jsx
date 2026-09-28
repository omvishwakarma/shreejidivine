'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

const CONSENT_COOKIE = 'sj_consent'
const VISITOR_COOKIE = 'sj_vid'
const MAX_AGE = 60 * 60 * 24 * 180
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || ''
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || ''

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
}

function loadGoogle(id) {
  if (!id || window.__sjGtagLoaded) return
  window.__sjGtagLoaded = true
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
  document.head.appendChild(script)
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', id)
}

function enableMarketing() {
  const id = visitorId()
  loadMeta(META_PIXEL_ID, id)
  loadGoogle(GOOGLE_ADS_ID)
}

export default function MarketingCookies() {
  const pathname = usePathname() || '/'
  const [choice, setChoice] = useState('')
  const [ready, setReady] = useState(false)
  const [more, setMore] = useState(false)
  const trackedPath = useRef('')

  useEffect(() => {
    const saved = readCookie(CONSENT_COOKIE)
    setChoice(saved === 'marketing' || saved === 'essential' ? saved : '')
    setReady(true)
  }, [])

  useEffect(() => {
    if (choice !== 'marketing') return
    enableMarketing()
    if (trackedPath.current === pathname) return
    const first = trackedPath.current === ''
    trackedPath.current = pathname
    if (first) return
    if (window.fbq) window.fbq('track', 'PageView')
    if (window.gtag && GOOGLE_ADS_ID) {
      window.gtag('event', 'page_view', { page_path: pathname })
    }
  }, [pathname, choice])

  function choose(next) {
    writeCookie(CONSENT_COOKIE, next)
    setChoice(next)
    if (next === 'marketing') enableMarketing()
  }

  if (!ready || pathname.startsWith('/admin') || choice) return null

  return (
    <div className="mkt-banner" role="dialog" aria-label="Cookies Consent">
      <div className="mkt-banner__copy">
        <p className="mkt-banner__title">
          <span className="mkt-banner__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path
                fill="currentColor"
                d="M12 2a10 10 0 1 0 9.5 13.1 1.2 1.2 0 0 0-1.4-.7 2.4 2.4 0 0 1-2.9-2.9 1.2 1.2 0 0 0-.7-1.4A10 10 0 0 0 12 2Zm-3.2 6.2a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Zm6.5 2.1a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM8.6 14a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3Zm4.3.6a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z"
              />
            </svg>
          </span>
          Cookies Consent
        </p>
        <p>
          This website use cookies to help you have a superior and more admissible browsing
          experience on the website.{' '}
          <button type="button" className="mkt-banner__more" onClick={() => setMore((open) => !open)}>
            {more ? 'Read less' : 'Read more'}
          </button>
        </p>
        {more ? (
          <p>
            Essential cookies keep the shop working. Marketing cookies remember this browser so we
            can show you relevant ads on your next visit.
          </p>
        ) : null}
      </div>
      <div className="mkt-banner__actions">
        <button type="button" className="mkt-banner__ghost" onClick={() => choose('essential')}>
          Only essential
        </button>
        <button type="button" className="mkt-banner__accept" onClick={() => choose('marketing')}>
          Accept all
        </button>
      </div>
    </div>
  )
}
