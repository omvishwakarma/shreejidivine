'use client'

import Link from 'next/link'
import Image from 'next/image'
import ShopNav from '../../components/ShopNav'
import Footer from '../../components/Footer'
import { useCart } from '../../context/CartContext'
import { formatINR, FREE_SHIPPING_NOTE, SHIPPING_FEE } from '../../lib/products'
import '../ecom.css'

export default function CartPage() {
  const { items, updateQty, removeItem, subtotal, ready, count } = useCart()

  return (
    <div className="ecom-page">
      <ShopNav />
      <div className="ecom-wrap">
        <header className="ecom-hero">
          <p className="section-label">Your Selection</p>
          <h1 className="ecom-title">Shopping Cart</h1>
          <p className="ecom-lead">{FREE_SHIPPING_NOTE}</p>
        </header>

        {!ready ? (
          <div className="empty-state">Loading cart…</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <p>Your cart is empty.</p>
            <Link href="/shop" className="btn-sm btn-primary">
              Browse the Shop
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="panel">
              <div className="panel-head">
                <h2>
                  {count} item{count === 1 ? '' : 's'}
                </h2>
                <p>Review quantities before checkout</p>
              </div>
              {items.map((item) => (
                <div key={item.productId} className="cart-line">
                  <Link href={`/shop/${item.slug}`}>
                    <Image src={item.image} alt={item.name} width={100} height={100} />
                  </Link>
                  <div>
                    <Link href={`/shop/${item.slug}`}>
                      <h3>{item.name}</h3>
                    </Link>
                    <p className="cart-line__meta">{formatINR(item.price)} each</p>
                    <div className="qty">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => updateQty(item.productId, item.quantity - 1)}
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => updateQty(item.productId, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="btn-sm btn-ghost qty-remove"
                      onClick={() => removeItem(item.productId)}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="cart-line__right">
                    <strong>{formatINR(item.price * item.quantity)}</strong>
                  </div>
                </div>
              ))}
            </div>

            <aside className="summary-box">
              <h2>Order Summary</h2>
              <p className="summary-box__note">Secure checkout · Pay on delivery</p>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{SHIPPING_FEE === 0 ? 'Free' : formatINR(SHIPPING_FEE)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>{formatINR(subtotal + SHIPPING_FEE)}</span>
              </div>
              <Link href="/checkout" className="btn-sm btn-primary btn-full">
                Proceed to Checkout
              </Link>
              <Link href="/shop" className="btn-sm btn-ghost btn-full">
                Continue Shopping
              </Link>
            </aside>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
