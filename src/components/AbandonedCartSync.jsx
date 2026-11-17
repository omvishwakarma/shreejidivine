'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { api } from '../lib/api'
import { normalizeWhatsappNumber } from '../lib/whatsapp/phone'

const PHONE_KEY = 'sj_abandon_phone'
const NAME_KEY = 'sj_abandon_name'

function syncKey(phone, items, subtotal) {
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

export default function AbandonedCartSync({ phone: phoneOverride = '', name: nameOverride = '' }) {
  const { user } = useAuth()
  const { items, subtotal, ready } = useCart()
  const lastKey = useRef('')
  const cronTimer = useRef(0)

  useEffect(() => {
    if (!ready) return undefined

    const phone =
      normalizeWhatsappNumber(phoneOverride) ||
      normalizeWhatsappNumber(user?.phone) ||
      readStoredPhone() ||
      ''
    if (!phone) {
      if (process.env.NODE_ENV === 'development' && items.length > 0) {
        console.info(
          '[abandoned-cart] phone missing — login with phone, or open checkout and enter phone'
        )
      }
      return undefined
    }

    const name = nameOverride || user?.name || readStoredName() || ''
    storeContact(phone, name)

    const key = syncKey(phone, items, subtotal)
    if (key === lastKey.current) return undefined
    lastKey.current = key

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
          if (!items.length) return

          // After idle delay, ask server to send WhatsApp for this phone.
          // Works on production without waiting for Vercel Cron.
          const delayMs = Number(process.env.NEXT_PUBLIC_ABANDONED_CART_DELAY_MS || 5 * 60 * 1000)
          window.clearTimeout(cronTimer.current)
          cronTimer.current = window.setTimeout(() => {
            api('/api/cart/abandoned/remind', {
              method: 'POST',
              body: JSON.stringify({ phone }),
              timeoutMs: 15000,
            })
              .then((summary) => {
                console.info('[abandoned-cart] remind', summary)
              })
              .catch((err) => {
                console.warn('[abandoned-cart] remind failed', err?.message || err)
              })
          }, Math.max(delayMs, 5000) + 5000)
        })
        .catch((err) => {
          console.warn('[abandoned-cart] sync failed', err?.message || err)
        })
    }, 1200)

    return () => {
      window.clearTimeout(timer)
      window.clearTimeout(cronTimer.current)
    }
  }, [ready, items, subtotal, user?.phone, user?.name, phoneOverride, nameOverride])

  return null
}
