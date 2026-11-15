'use client'

import { useEffect, useState } from 'react'

const DISMISS_KEY = 'sj_admin_pwa_dismiss'

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

export default function AdminPwaClient() {
  const [deferred, setDeferred] = useState(null)
  const [showBanner, setShowBanner] = useState(false)
  const [iosHint, setIosHint] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return undefined

    navigator.serviceWorker.register('/admin/sw.js', { scope: '/admin' }).catch(() => {})

    if (isStandalone()) return undefined
    if (window.localStorage.getItem(DISMISS_KEY) === '1') return undefined

    function onPrompt(e) {
      e.preventDefault()
      setDeferred(e)
      setShowBanner(true)
      setIosHint(false)
    }

    window.addEventListener('beforeinstallprompt', onPrompt)

    if (isIos()) {
      setIosHint(true)
      setShowBanner(true)
    }

    function onInstalled() {
      setDeferred(null)
      setShowBanner(false)
      setIosHint(false)
    }
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  function dismiss() {
    window.localStorage.setItem(DISMISS_KEY, '1')
    setShowBanner(false)
    setDeferred(null)
  }

  async function install() {
    if (!deferred) return
    deferred.prompt()
    const result = await deferred.userChoice.catch(() => null)
    setDeferred(null)
    if (result?.outcome === 'accepted') {
      setShowBanner(false)
    }
  }

  if (!showBanner) return null

  return (
    <div className="admin-pwa-banner" role="dialog" aria-label="Install admin app">
      <div className="admin-pwa-banner__text">
        <strong>Install Admin App</strong>
        {iosHint && !deferred ? (
          <span>Share → Add to Home Screen for quick access.</span>
        ) : (
          <span>Home screen pe lagao — orders jaldi manage karo.</span>
        )}
      </div>
      <div className="admin-pwa-banner__actions">
        {deferred ? (
          <button type="button" className="admin-btn admin-btn-primary" onClick={install}>
            Install
          </button>
        ) : null}
        <button type="button" className="admin-btn" onClick={dismiss}>
          Later
        </button>
      </div>
    </div>
  )
}
