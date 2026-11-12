'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
import './FreeGiftPopup.css'

const HIDDEN_PREFIXES = ['/admin', '/cart', '/checkout']
const STORAGE_KEY = 'sd_free_gift_claimed'
const SEEN_KEY = 'sd_free_gift_seen'
const OPEN_EVENT = 'sd:open-free-gift'
const AUTO_DELAY_MS = 10_000
const FREE_GIFT_PATH = '/shop/is-diwali-har-ghar-lakshmi-3-divine-products-free'

export function openFreeGiftPopup() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { force: true } }))
}

export default function FreeGiftPopup() {
  const pathname = usePathname() || '/'
  const router = useRouter()
  const { loginWithWhatsAppUser } = useAuth()
  const titleId = useId()
  const nameRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [lookingUp, setLookingUp] = useState(false)
  const [existingUser, setExistingUser] = useState(false)
  const [error, setError] = useState('')
  const nameTouchedRef = useRef(false)

  const hidden = HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  const close = useCallback(() => {
    setOpen(false)
    setError('')
  }, [])

  const openPopup = useCallback(
    ({ force = false } = {}) => {
      if (hidden) return
      setError('')
      setExistingUser(false)
      nameTouchedRef.current = false
      setOpen(true)
      if (!force) {
        try {
          sessionStorage.setItem(SEEN_KEY, '1')
        } catch {
          /* ignore */
        }
      }
    },
    [hidden]
  )

  useEffect(() => {
    if (!open) return undefined
    const digits = String(phone || '').replace(/\D/g, '')
    if (digits.length < 10) {
      setExistingUser(false)
      setLookingUp(false)
      return undefined
    }

    let cancelled = false
    const timer = window.setTimeout(() => {
      setLookingUp(true)
      fetch(`/api/free-gift/lookup?phone=${encodeURIComponent(phone.trim())}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (cancelled) return
          if (data?.found && data.name) {
            setExistingUser(true)
            if (!nameTouchedRef.current) {
              setName(String(data.name).trim())
            }
          } else {
            setExistingUser(false)
            if (!nameTouchedRef.current) setName('')
          }
        })
        .catch(() => {
          if (!cancelled) setExistingUser(false)
        })
        .finally(() => {
          if (!cancelled) setLookingUp(false)
        })
    }, 450)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [open, phone])

  // Focus WhatsApp field first so returning users can autofill name.
  useEffect(() => {
    if (!open) return undefined
    const focusTimer = window.setTimeout(() => {
      const phoneInput = document.querySelector('.free-gift-popup input[name="phone"]')
      if (phoneInput instanceof HTMLElement) phoneInput.focus()
      else nameRef.current?.focus()
    }, 40)
    return () => window.clearTimeout(focusTimer)
  }, [open])

  useEffect(() => {
    const onOpen = (event) => openPopup({ force: Boolean(event?.detail?.force) })
    window.addEventListener(OPEN_EVENT, onOpen)
    return () => window.removeEventListener(OPEN_EVENT, onOpen)
  }, [openPopup])

  useEffect(() => {
    if (hidden) return undefined

    try {
      if (sessionStorage.getItem(SEEN_KEY) === '1') return undefined
    } catch {
      /* ignore */
    }

    let cancelled = false
    const timer = window.setTimeout(() => {
      if (cancelled) return
      openPopup({ force: false })
    }, AUTO_DELAY_MS)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [hidden, openPopup, pathname])

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  async function onSubmit(e) {
    e.preventDefault()
    if (submitting) return
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/free-gift/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }
      try {
        localStorage.setItem(STORAGE_KEY, '1')
      } catch {
        /* ignore */
      }
      if (data.user && data.token) {
        loginWithWhatsAppUser(data.user, data.token)
      }
      const next = data.redirectTo || FREE_GIFT_PATH
      setOpen(false)
      router.push(next)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open || hidden) return null

  return (
    <div className="free-gift-popup" role="presentation" onClick={close}>
      <div
        className="free-gift-popup__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="free-gift-popup__close" aria-label="Close" onClick={close}>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M3.2 3.2 12.8 12.8M12.8 3.2 3.2 12.8" />
          </svg>
        </button>

        <div className="free-gift-popup__badge" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M12 7.2c.7-1.5 1.8-2.4 3.1-2.4 1.5 0 2.4 1 2.4 2.2 0 1.6-1.5 2.6-3.4 2.8H12V7.2Zm0 0C11.3 5.7 10.2 4.8 8.9 4.8 7.4 4.8 6.5 5.8 6.5 7c0 1.6 1.5 2.6 3.4 2.8H12V7.2ZM4 11.2h16v8.2a1.2 1.2 0 0 1-1.2 1.2H5.2A1.2 1.2 0 0 1 4 19.4v-8.2Zm7.1 0v9.4h1.8v-9.4h-1.8ZM3.2 9.2h17.6v2H3.2v-2Z" />
          </svg>
        </div>

        <h2 id={titleId} className="free-gift-popup__title">
          Claim your free gift
        </h2>
        <p className="free-gift-popup__lead">
          Enter your name and WhatsApp number to join Shreeji Divine and unlock exclusive FREE gift!
        </p>

        <form className="free-gift-popup__form" onSubmit={onSubmit}>
          
          <label className="free-gift-popup__field">
            <span>Name{lookingUp ? ' · looking up…' : existingUser ? ' · from your account' : ''}</span>
            <input
              ref={nameRef}
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => {
                nameTouchedRef.current = true
                setName(e.target.value)
              }}
              maxLength={80}
              required
            />
          </label>
          <label className="free-gift-popup__field">
            <span>WhatsApp number</span>
            <input
              type="tel"
              name="phone"
              autoComplete="tel"
              inputMode="numeric"
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={15}
              required
            />
          </label>
          {error ? <p className="free-gift-popup__error">{error}</p> : null}
          <button type="submit" className="free-gift-popup__submit" disabled={submitting}>
            {submitting ? 'Claiming…' : 'Claim gift'}
          </button>
        </form>
      </div>
    </div>
  )
}
