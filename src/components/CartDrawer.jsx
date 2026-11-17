'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useCart } from '../context/CartContext'
import CartPanel from './CartPanel'
import './CartDrawer.css'

export default function CartDrawer() {
  const pathname = usePathname() || '/'
  const { drawerOpen, closeCart, count } = useCart()

  useEffect(() => {
    closeCart()
  }, [pathname, closeCart])

  useEffect(() => {
    if (!drawerOpen) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') closeCart()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [drawerOpen, closeCart])

  const label = count === 1 ? 'Your Cart (1 item)' : `Your Cart (${count} items)`

  return (
    <>
      <div
        className={`cart-drawer-backdrop${drawerOpen ? ' is-open' : ''}`}
        onClick={closeCart}
        aria-hidden={!drawerOpen}
      />
      <aside
        className={`cart-drawer${drawerOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        aria-hidden={!drawerOpen}
      >
        <header className="cart-drawer__head">
          <h2 className="cart-drawer__title">{label}</h2>
          <button
            type="button"
            className="cart-drawer__close"
            aria-label="Close cart"
            onClick={closeCart}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3.2 3.2 12.8 12.8M12.8 3.2 3.2 12.8" />
            </svg>
          </button>
        </header>
        <div className="cart-drawer__body">
          {drawerOpen ? <CartPanel variant="drawer" /> : null}
        </div>
      </aside>
    </>
  )
}
