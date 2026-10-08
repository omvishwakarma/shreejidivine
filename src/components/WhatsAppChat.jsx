'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import './WhatsAppChat.css'

const HIDDEN_PREFIXES = ['/admin']

export default function WhatsAppChat() {
  const pathname = usePathname() || '/'
  const [href, setHref] = useState('')

  useEffect(() => {
    let cancelled = false
    fetch('/api/whatsapp')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.href) return
        setHref(data.href)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  if (!href) return null
  if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return null

  return (
    <a
      className="wa-chat"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.15 6.4 2.15 11.83c0 1.74.46 3.44 1.34 4.94L2 22l5.39-1.41a10.1 10.1 0 0 0 4.65 1.12h.01c5.46 0 9.89-4.4 9.89-9.83C21.94 6.4 17.5 2 12.04 2Zm5.78 13.9c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.81-.11-.42-.14-.95-.31-1.64-.6-2.88-1.24-4.76-4.14-4.9-4.33-.14-.19-1.16-1.54-1.16-2.94 0-1.4.73-2.09 1-2.37.26-.28.57-.35.76-.35.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.57.81 1.97.88 2.11.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.16-.29.37-.41.49-.14.14-.28.29-.12.56.16.28.7 1.15 1.5 1.86 1.03.92 1.9 1.2 2.17 1.34.28.14.44.12.6-.07.16-.19.69-.8.87-1.08.19-.28.37-.23.62-.14.26.09 1.63.77 1.91.91.28.14.46.21.53.33.07.12.07.68-.17 1.36Z" />
      </svg>
      <span>Chat</span>
    </a>
  )
}
