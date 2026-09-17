'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useCart } from '../context/CartContext'

export default function AddToCartButton({
  product,
  qty = 1,
  label = 'Add to Cart',
  className = '',
  colour = '',
  fragrance = '',
  requireVariants = true,
  disabled = false,
}) {
  const { addItem } = useCart()
  const router = useRouter()
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
        disabled={disabled}
        onClick={() => {
          const needsColour = (product.colours || []).length > 0 && !colour
          const needsFragrance = (product.fragrances || []).length > 0 && !fragrance
          if (requireVariants && (needsColour || needsFragrance)) {
            router.push(`/shop/${product.slug}`)
            return
          }
          addItem(product, qty, { colour, fragrance })
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
