'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

function clientId() {
  const key = 'sj_pwa'
  const existing = window.localStorage.getItem(key)
  if (existing) return existing
  const id = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`
  window.localStorage.setItem(key, id)
  return id
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

function urlBase64ToUint8Array(value) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4)
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(base64)
  const output = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i)
  return output
}

async function saveDevice(body) {
  await fetch('/api/pwa/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export default function PwaClient() {
  const pathname = usePathname() || '/'

  useEffect(() => {
    if (pathname.startsWith('/admin')) return
    if (!('serviceWorker' in navigator)) return

    let cancelled = false
    const id = clientId()

    async function subscribe() {
      const ready = await navigator.serviceWorker.ready
      const keyRes = await fetch('/api/pwa/register')
      const keyData = await keyRes.json().catch(() => ({}))
      if (!keyData.publicKey || Notification.permission !== 'granted') return null
      let current = await ready.pushManager.getSubscription()
      if (!current) {
        current = await ready.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(keyData.publicKey),
        })
      }
      const json = current.toJSON()
      return json
    }

    async function record(extra = {}) {
      if (cancelled) return
      await saveDevice({
        clientId: id,
        installed: Boolean(extra.installed || isStandalone()),
        standalone: isStandalone(),
        userAgent: navigator.userAgent.slice(0, 300),
        subscription: extra.subscription || null,
      })
    }

    async function enablePush() {
      if (!isStandalone() || !('PushManager' in window) || !('Notification' in window)) return
      if (Notification.permission === 'denied') return
      if (Notification.permission === 'default') {
        const choice = await Notification.requestPermission()
        if (choice !== 'granted') return
      }
      const subscription = await subscribe()
      await record({ installed: true, subscription })
    }

    navigator.serviceWorker.register('/sw.js').catch(() => {})

    if (isStandalone()) {
      record({ installed: true }).catch(() => {})
      enablePush().catch(() => {})
    }

    function onInstalled() {
      record({ installed: true })
        .then(() => enablePush())
        .catch(() => {})
    }
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      cancelled = true
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [pathname])

  return null
}
