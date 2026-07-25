'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useCart } from '../context/CartContext'

export default function AddToCartButton({
  product,
  qty = 1,
  label = 'Add to Cart',
  className = '',
}) {
  const { addItem } = useCart()
  const [toast, setToast] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(false), 1800)
    return () => clearTimeout(t)
  }, [toast])

  return (
    <>
      <button
        type="button"
        className={`btn-sm btn-primary ${className}`.trim()}
        onClick={() => {
          addItem(product, qty)
          setToast(true)
        }}
      >
        {label}
      </button>
      {mounted && toast
        ? createPortal(<div className="toast">Added to cart</div>, document.body)
        : null}
    </>
  )
}
