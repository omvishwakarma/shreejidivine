'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { api } from '../lib/api'
import { normalizeWhatsappNumber } from '../lib/whatsapp/phone'

const PHONE_KEY = 'sj_abandon_phone'
const NAME_KEY = 'sj_abandon_name'
const DEFAULT_DELAY_MS = 5 * 60 * 1000

function cartFingerprint(phone, items, subtotal) {
  return JSON.stringify({
    phone,
    subtotal,
    items: (items || []).map((i) => [
      i.productId,
      i.quantity,
      i.colour,
      i.fragrance,
      i.price,
    ]),
  })
}

function readStoredPhone() {
  try {
    return normalizeWhatsappNumber(window.localStorage.getItem(PHONE_KEY) || '')
  } catch {
    return ''
  }
}

function readStoredName() {
  try {
    return String(window.localStorage.getItem(NAME_KEY) || '').trim()
  } catch {
    return ''
  }
}

function storeContact(phone, name) {
  try {
    if (phone) window.localStorage.setItem(PHONE_KEY, phone)
    if (name) window.localStorage.setItem(NAME_KEY, name)
  } catch {
    /* ignore */
  }
}

function delayMs() {
  const raw = Number(process.env.NEXT_PUBLIC_ABANDONED_CART_DELAY_MS || DEFAULT_DELAY_MS)
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_DELAY_MS
}

export default function AbandonedCartSync({ phone: phoneOverride = '', name: nameOverride = '' }) {
  const { user } = useAuth()
  const { items, subtotal, ready } = useCart()
  const lastSyncKey = useRef('')
  const remindTimer = useRef(0)
  const remindForKey = useRef('')
  const phoneRef = useRef('')

  // Keep latest phone for timers / visibility checks
  useEffect(() => {
    phoneRef.current =
      normalizeWhatsappNumber(phoneOverride) ||
      normalizeWhatsappNumber(user?.phone) ||
      readStoredPhone() ||
      ''
  }, [phoneOverride, user?.phone])

  // Sync cart → server whenever cart/phone changes
  useEffect(() => {
    if (!ready) return undefined

    const phone =
      normalizeWhatsappNumber(phoneOverride) ||
      normalizeWhatsappNumber(user?.phone) ||
      readStoredPhone() ||
      ''

    if (!phone) {
      console.info(
        '[abandoned-cart] phone missing — login with phone, or open checkout and enter phone'
      )
      return undefined
    }

    const name = nameOverride || user?.name || readStoredName() || ''
    storeContact(phone, name)

    const key = cartFingerprint(phone, items, subtotal)
    if (key === lastSyncKey.current) return undefined
    lastSyncKey.current = key

    const timer = window.setTimeout(() => {
      api('/api/cart/abandoned', {
        method: 'POST',
        body: JSON.stringify({
          phone,
          name,
          items: items.map((i) => ({
            productId: i.productId,
            slug: i.slug,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            colour: i.colour,
            fragrance: i.fragrance,
            image: i.image,
          })),
          subtotal,
          clear: items.length === 0,
        }),
        timeoutMs: 8000,
      })
        .then((data) => {
          console.info('[abandoned-cart] synced', data)
        })
        .catch((err) => {
          console.warn('[abandoned-cart] sync failed', err?.message || err)
        })
    }, 800)

    return () => window.clearTimeout(timer)
  }, [ready, items, subtotal, user?.phone, user?.name, phoneOverride, nameOverride])

  // Schedule WhatsApp remind — survives cart sync re-renders
  useEffect(() => {
    if (!ready) return undefined

    const phone =
      normalizeWhatsappNumber(phoneOverride) ||
      normalizeWhatsappNumber(user?.phone) ||
      readStoredPhone() ||
      ''

    if (!phone || items.length === 0) {
      window.clearTimeout(remindTimer.current)
      remindForKey.current = ''
      return undefined
    }

    const key = cartFingerprint(phone, items, subtotal)
    // Same cart already scheduled — keep existing timer
    if (key === remindForKey.current && remindTimer.current) return undefined

    remindForKey.current = key
    window.clearTimeout(remindTimer.current)

    const wait = delayMs() + 3000
    console.info('[abandoned-cart] remind scheduled in', Math.round(wait / 1000), 's')

    remindTimer.current = window.setTimeout(() => {
      fetch('/api/cart/abandoned/remind', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(typeof window !== 'undefined' && window.localStorage.getItem('shreeji_token')
            ? { Authorization: `Bearer ${window.localStorage.getItem('shreeji_token')}` }
            : {}),
        },
        body: JSON.stringify({ phone }),
      })
        .then(async (res) => {
          const summary = await res.json().catch(() => ({}))
          console.info('[abandoned-cart] remind', summary)
          if (!summary?.ok) {
            console.warn('[abandoned-cart] remind not sent', summary?.reason || summary?.error || res.status)
          }
        })
        .catch((err) => {
          console.warn('[abandoned-cart] remind failed', err?.message || err)
        })
    }, wait)

    // Do NOT clear remindTimer on dep churn — only on unmount / empty cart
    return undefined
  }, [ready, items, subtotal, user?.phone, phoneOverride])

  // Clear remind only on unmount
  useEffect(() => {
    return () => window.clearTimeout(remindTimer.current)
  }, [])

  // If tab hidden then visible again after delay, retry remind
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState !== 'visible') return
      const phone = phoneRef.current
      if (!phone) return
      fetch('/api/cart/abandoned/remind', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(window.localStorage.getItem('shreeji_token')
            ? { Authorization: `Bearer ${window.localStorage.getItem('shreeji_token')}` }
            : {}),
        },
        body: JSON.stringify({ phone }),
      })
        .then(async (res) => {
          const summary = await res.json().catch(() => ({}))
          console.info('[abandoned-cart] remind (focus)', summary)
        })
        .catch(() => {})
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  return null
}
