'use client'

import { useEffect, useState } from 'react'
import './BootSplash.css'

export default function BootSplash() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (window.location.pathname.startsWith('/admin')) return undefined
    if (sessionStorage.getItem('sj_boot')) return undefined

    setVisible(true)
    let hidden = false
    const hide = () => {
      if (hidden) return
      hidden = true
      sessionStorage.setItem('sj_boot', '1')
      setVisible(false)
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

  if (!visible) return null

  return (
    <div id="sj-splash" aria-hidden="true">
      <img src="/images/logo-splash.webp" alt="" width="168" height="168" />
    </div>
  )
}
