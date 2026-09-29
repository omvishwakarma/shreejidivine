'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '../context/CartContext'
import { formatINR } from '../lib/products'
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

export default function CartDock() {
  const pathname = usePathname() || '/'
  const { items, count, subtotal, ready } = useCart()
  const hidden = HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  const visible = ready && count > 0 && !hidden
  const thumbs = items.slice(0, 3)
  const label = count === 1 ? '1 item added' : `${count} items added`

  useEffect(() => {
    const root = document.documentElement
    if (visible) root.style.setProperty('--cart-dock-offset', '5.25rem')
    else root.style.removeProperty('--cart-dock-offset')
    return () => root.style.removeProperty('--cart-dock-offset')
  }, [visible])

  if (!visible) return null

  return (
    <div className="cart-dock" role="region" aria-label="Cart">
      <div className="cart-dock__meta">
        <div className="cart-dock__thumbs" aria-hidden="true">
          {thumbs.map((item) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={item.lineKey || item.productId} src={item.image} alt="" />
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
