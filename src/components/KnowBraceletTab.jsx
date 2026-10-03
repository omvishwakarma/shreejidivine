'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import './KnowBraceletTab.css'

const HIDDEN_PREFIXES = ['/know-your-bracelet', '/admin']

export default function KnowBraceletTab() {
  const pathname = usePathname() || '/'
  if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return null

  return (
    <Link href="/know-your-bracelet" className="kyb-tab" aria-label="Know your Bracelet">
      <span className="kyb-tab__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M12 3.2c.4 2.2-.2 3.8-1.5 5.2C9 10 8.2 11.4 8.2 13.2a3.8 3.8 0 0 0 7.6 0c0-1.8-.8-3.2-2.3-4.8C12.2 7 11.6 5.4 12 3.2Z" />
        </svg>
      </span>
      <span className="kyb-tab__text">
        <span>Know your</span>
        <strong>Bracelet</strong>
      </span>
    </Link>
  )
}
