'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { api, getToken } from '../lib/api'
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

function authHeaders() {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function cartPayload(phone, name, items, subtotal) {
  return {
    phone,
    name,
    items: (items || []).map((i) => ({
      productId: i.productId,
      slug: i.slug,
      name: i.name,
      price: Number(i.price) || 0,
      quantity: Number(i.quantity) || 1,
      colour: i.colour || '',
      fragrance: i.fragrance || '',
      image: i.image || '',
    })),
    subtotal: Number(subtotal) || 0,
  }
}

async function postRemind(body) {
  const res = await fetch('/api/cart/abandoned/remind', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  return res.json().catch(() => ({}))
}

export default function AbandonedCartSync({ phone: phoneOverride = '', name: nameOverride = '' }) {
  const { user } = useAuth()
  const { items, subtotal, ready } = useCart()
  const lastSyncKey = useRef('')
  const remindTimer = useRef(0)
  const remindForKey = useRef('')
  const latestRef = useRef({ phone: '', name: '', items: [], subtotal: 0 })

  const resolvePhone = () =>
    normalizeWhatsappNumber(phoneOverride) ||
    normalizeWhatsappNumber(user?.phone) ||
    readStoredPhone() ||
    ''

  const resolveName = () => nameOverride || user?.name || readStoredName() || ''

  // Keep latest cart snapshot for timers / focus
  useEffect(() => {
    const phone = resolvePhone()
    const name = resolveName()
    if (phone) storeContact(phone, name)
    latestRef.current = {
      phone,
      name,
      items,
      subtotal,
    }
  }, [phoneOverride, user?.phone, user?.name, nameOverride, items, subtotal])

  // Sync cart → server
  useEffect(() => {
    if (!ready) return undefined

    const phone = resolvePhone()
    if (!phone) {
      console.info(
        '[abandoned-cart] phone missing — login with phone, or open checkout and enter phone'
      )
      return undefined
    }

    // Don't wipe server cart during brief empty states before hydration settles
    if (!items.length) return undefined

    const name = resolveName()
    storeContact(phone, name)

    const key = cartFingerprint(phone, items, subtotal)
    if (key === lastSyncKey.current) return undefined
    lastSyncKey.current = key

    const timer = window.setTimeout(() => {
      const payload = cartPayload(phone, name, items, subtotal)
      api('/api/cart/abandoned', {
        method: 'POST',
        body: JSON.stringify(payload),
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

  // Schedule WhatsApp remind with full cart payload
  useEffect(() => {
    if (!ready) return undefined

    const phone = resolvePhone()
    if (!phone || items.length === 0) {
      window.clearTimeout(remindTimer.current)
      remindTimer.current = 0
      remindForKey.current = ''
      return undefined
    }

    const key = cartFingerprint(phone, items, subtotal)
    if (key === remindForKey.current && remindTimer.current) return undefined

    remindForKey.current = key
    window.clearTimeout(remindTimer.current)

    const wait = delayMs() + 3000
    console.info('[abandoned-cart] remind scheduled in', Math.round(wait / 1000), 's')

    const snapshot = cartPayload(phone, resolveName(), items, subtotal)

    remindTimer.current = window.setTimeout(() => {
      postRemind(snapshot)
        .then((summary) => {
          console.info('[abandoned-cart] remind', summary)
          if (!summary?.ok) {
            console.warn(
              '[abandoned-cart] remind not sent',
              summary?.reason || summary?.error || 'unknown'
            )
          }
        })
        .catch((err) => {
          console.warn('[abandoned-cart] remind failed', err?.message || err)
        })
    }, wait)

    return undefined
  }, [ready, items, subtotal, user?.phone, phoneOverride, nameOverride, user?.name])

  useEffect(() => {
    return () => window.clearTimeout(remindTimer.current)
  }, [])

  // On tab focus: sync + remind with current cart
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState !== 'visible') return
      const { phone, name, items: cartItems, subtotal: cartSubtotal } = latestRef.current
      if (!phone || !cartItems?.length) return

      const payload = cartPayload(phone, name, cartItems, cartSubtotal)
      api('/api/cart/abandoned', {
        method: 'POST',
        body: JSON.stringify(payload),
        timeoutMs: 8000,
      })
        .catch(() => {})
        .finally(() => {
          postRemind(payload)
            .then((summary) => {
              console.info('[abandoned-cart] remind (focus)', summary)
            })
            .catch(() => {})
        })
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  return null
}
