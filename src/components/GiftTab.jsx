'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import './GiftTab.css'

const HIDDEN_PREFIXES = ['/admin', '/cart', '/checkout']

function labelLines(text) {
  const words = String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (words.length <= 1) return [words[0] || '']
  const mid = Math.ceil(words.length / 2)
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')]
}

export default function GiftTab() {
  const pathname = usePathname() || '/'
  const [tab, setTab] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/gift-tab')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.text || !data?.href) return
        setTab({ text: data.text, href: data.href })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  if (!tab) return null
  if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return null
  if (pathname === tab.href) return null

  const [lead, emphasis] = labelLines(tab.text)

  return (
    <Link href={tab.href} className="gift-tab" aria-label={tab.text}>
      <span className="gift-tab__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M12 7.2c.7-1.5 1.8-2.4 3.1-2.4 1.5 0 2.4 1 2.4 2.2 0 1.6-1.5 2.6-3.4 2.8H12V7.2Zm0 0C11.3 5.7 10.2 4.8 8.9 4.8 7.4 4.8 6.5 5.8 6.5 7c0 1.6 1.5 2.6 3.4 2.8H12V7.2ZM4 11.2h16v8.2a1.2 1.2 0 0 1-1.2 1.2H5.2A1.2 1.2 0 0 1 4 19.4v-8.2Zm7.1 0v9.4h1.8v-9.4h-1.8ZM3.2 9.2h17.6v2H3.2v-2Z" />
        </svg>
      </span>
      <span className="gift-tab__text">
        <span>{lead}</span>
        {emphasis ? <strong>{emphasis}</strong> : null}
      </span>
    </Link>
  )
}
