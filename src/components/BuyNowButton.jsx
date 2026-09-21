'use client'

import { useRouter } from 'next/navigation'
import { useCart } from '../context/CartContext'

export default function BuyNowButton({
  product,
  qty = 1,
  label = 'Buy',
  className = '',
  colour = '',
  fragrance = '',
  disabled = false,
}) {
  const { addItem } = useCart()
  const router = useRouter()

  return (
    <button
      type="button"
      className={`btn-sm btn-primary product-detail__bar-buy ${className}`.trim()}
      disabled={disabled}
      onClick={() => {
        addItem(product, qty, { colour, fragrance })
        router.push('/checkout')
      }}
    >
      {label}
    </button>
  )
}
