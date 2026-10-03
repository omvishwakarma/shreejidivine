'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useCart } from '../context/CartContext'
import { trackMeta } from '../lib/meta'

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
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          const colours = product.colours || []
          const fragrances = product.fragrances || []
          const pickedColour = colour || (colours.length === 1 ? colours[0].name : '')
          const pickedFragrance =
            fragrance || (fragrances.length === 1 ? fragrances[0].name : '')
          const needsChoice =
            (colours.length > 1 && !pickedColour) ||
            (fragrances.length > 1 && !pickedFragrance)
          if (requireVariants && needsChoice) {
            router.push(`/shop/${product.slug}`)
            return
          }
          addItem(product, qty, { colour: pickedColour, fragrance: pickedFragrance })
          const unit = Number(product.price) || 0
          trackMeta('AddToCart', {
            content_ids: [String(product.id || product.slug || '')],
            content_name: product.name,
            content_type: 'product',
            value: unit * qty,
            currency: 'INR',
          })
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
