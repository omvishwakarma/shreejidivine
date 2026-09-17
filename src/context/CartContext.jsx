'use client'

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { cartLineKey, resolveVariantImage, resolveVariantPrice } from '../lib/productVariants'

const CartContext = createContext(null)
const STORAGE_KEY = 'shreeji_cart_v3'

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('shreeji_cart_v2')
      if (raw) {
        const parsed = JSON.parse(raw)
        setItems(
          (parsed || []).map((i) => ({
            ...i,
            colour: i.colour || '',
            fragrance: i.fragrance || '',
            lineKey: i.lineKey || cartLineKey(i.productId, i.colour, i.fragrance),
          }))
        )
      }
    } catch {
      /* ignore */
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items, ready])

  const addItem = useCallback((product, qty = 1, options = {}) => {
    const colour = String(options.colour || '').trim()
    const fragrance = String(options.fragrance || '').trim()
    const lineKey = cartLineKey(product.id, colour, fragrance)
    const price = resolveVariantPrice(product, fragrance)
    const image = resolveVariantImage(product, colour, fragrance) || product.image

    setItems((prev) => {
      const existing = prev.find((i) => i.lineKey === lineKey)
      if (existing) {
        return prev.map((i) =>
          i.lineKey === lineKey
            ? { ...i, quantity: Math.min(20, i.quantity + qty), price, image }
            : i
        )
      }
      return [
        ...prev,
        {
          lineKey,
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price,
          image,
          quantity: qty,
          colour,
          fragrance,
        },
      ]
    })
  }, [])

  const updateQty = useCallback((lineKey, quantity) => {
    setItems((prev) =>
      prev
        .map((i) =>
          (i.lineKey || i.productId) === lineKey
            ? { ...i, quantity: Math.max(0, Math.min(20, quantity)) }
            : i
        )
        .filter((i) => i.quantity > 0)
    )
  }, [])

  const removeItem = useCallback((lineKey) => {
    setItems((prev) => prev.filter((i) => (i.lineKey || i.productId) !== lineKey))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const count = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  )

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  )

  const value = useMemo(
    () => ({
      items,
      ready,
      count,
      subtotal,
      addItem,
      updateQty,
      removeItem,
      clearCart,
    }),
    [items, ready, count, subtotal, addItem, updateQty, removeItem, clearCart]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
