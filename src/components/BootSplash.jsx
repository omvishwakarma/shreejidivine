'use client'

import { useEffect } from 'react'

export default function BootSplash() {
  useEffect(() => {
    const el = document.getElementById('sj-splash')
    if (!el) return undefined
    if (window.location.pathname.startsWith('/admin')) {
      el.remove()
      return undefined
    }

    if (sessionStorage.getItem('sj_boot')) {
      el.remove()
      return undefined
    }

    let hidden = false
    const hide = () => {
      if (hidden) return
      hidden = true
      sessionStorage.setItem('sj_boot', '1')
      el.classList.add('is-done')
      window.setTimeout(() => el.remove(), 320)
    }

    const max = window.setTimeout(hide, 900)
    const ready = () => window.setTimeout(hide, 280)
    if (document.readyState === 'complete') ready()
    else window.addEventListener('load', ready, { once: true })

    return () => {
      window.clearTimeout(max)
      window.removeEventListener('load', ready)
    }
  }, [])

  return null
}
