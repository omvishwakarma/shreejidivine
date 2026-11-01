'use client'

import { useLayoutEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '../context/CartContext'
import { formatINR } from '../lib/products'
import { storeImageSrc } from '../lib/storeImage'
import './CartDock.css'

const HIDDEN_PREFIXES = [
  '/cart',
  '/checkout',
  '/admin',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
]

const DOCK_GAP = 10

export default function CartDock() {
  const pathname = usePathname() || '/'
  const { items, count, subtotal, ready } = useCart()
  const hidden = HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  const visible = ready && count > 0 && !hidden
  const thumbs = items.slice(0, 3)
  const label = count === 1 ? '1 item added' : `${count} items added`
  const dockRef = useRef(null)

  useLayoutEffect(() => {
    const root = document.documentElement
    if (!visible) {
      root.style.removeProperty('--cart-dock-offset')
      return undefined
    }

    const update = () => {
      const el = dockRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const offset = Math.ceil(window.innerHeight - rect.top + DOCK_GAP)
      root.style.setProperty('--cart-dock-offset', `${Math.max(offset, 0)}px`)
    }

    update()
    const ro = new ResizeObserver(update)
    if (dockRef.current) ro.observe(dockRef.current)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
      root.style.removeProperty('--cart-dock-offset')
    }
  }, [visible, label, count])

  if (!visible) return null

  return (
    <div className="cart-dock" ref={dockRef} role="region" aria-label="Cart">
      <div className="cart-dock__meta">
        <div className="cart-dock__thumbs" aria-hidden="true">
          {thumbs.map((item) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={item.lineKey || item.productId} src={storeImageSrc(item.image, 96)} alt="" />
          ))}
        </div>
        <span>{label}</span>
      </div>
      <div className="cart-dock__end">
        <strong>{formatINR(subtotal)}</strong>
        <Link href="/checkout" className="cart-dock__go">
          Checkout
        </Link>
      </div>
    </div>
  )
}
