'use client'

import Link from 'next/link'
import Image from 'next/image'
import ShopNav from '../../components/ShopNav'
import Footer from '../../components/Footer'
import { useCart } from '../../context/CartContext'
import { formatINR, FREE_SHIPPING_NOTE, SHIPPING_FEE } from '../../lib/products'
import '../ecom.css'
import './cart.css'

export default function CartPage() {
  const { items, updateQty, removeItem, subtotal, ready, count } = useCart()
  const total = subtotal + SHIPPING_FEE

  return (
    <div className="ecom-page cart-page">
      <ShopNav />
      <div className="cart-shell">
        {!ready ? (
          <div className="cart-loading">Gathering your selection…</div>
        ) : items.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty__mark" aria-hidden="true">
              ◦
            </div>
            <h1>Your cart is empty</h1>
            <p>Discover aroma stones crafted for calm, prayer, and everyday ritual.</p>
            <Link href="/shop" className="cart-empty__cta">
              Browse the shop
            </Link>
          </div>
        ) : (
          <>
            <header className="cart-top">
              <div className="cart-top__left">
                <Link href="/shop" className="cart-back" aria-label="Back to shop">
                  ←
                </Link>
                <div>
                  <h1>Cart</h1>
                  <p className="cart-top__meta">
                    {count} item{count === 1 ? '' : 's'} · {FREE_SHIPPING_NOTE}
                  </p>
                </div>
              </div>
              <Link href="/shop" className="cart-top__shop">
                Continue shopping
              </Link>
            </header>

            <div className="cart-board">
              <div className="cart-list">
                {items.map((item) => (
                  <article key={item.productId} className="cart-line">
                    <Link href={`/shop/${item.slug}`} className="cart-line__media">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={120}
                        height={120}
                        sizes="120px"
                      />
                    </Link>

                    <div className="cart-line__body">
                      <h2>
                        <Link href={`/shop/${item.slug}`}>{item.name}</Link>
                      </h2>
                      <p className="cart-line__unit">{formatINR(item.price)} each</p>
                      <div className="cart-line__controls">
                        <div className="cart-qty">
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
                          className="cart-remove"
                          onClick={() => removeItem(item.productId)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="cart-line__total">
                      {formatINR(item.price * item.quantity)}
                    </div>
                  </article>
                ))}
              </div>

              <aside className="cart-aside">
                <div className="cart-summary">
                  <h2>Order summary</h2>
                  <p className="cart-summary__note">Secure checkout · Free pan-India shipping</p>
                  <div className="cart-summary__rows">
                    <div>
                      <span>Subtotal</span>
                      <span>{formatINR(subtotal)}</span>
                    </div>
                    <div>
                      <span>Shipping</span>
                      <span>{SHIPPING_FEE === 0 ? 'Free' : formatINR(SHIPPING_FEE)}</span>
                    </div>
                    <div className="is-total">
                      <span>Total</span>
                      <span>{formatINR(total)}</span>
                    </div>
                  </div>
                  <Link href="/checkout" className="cart-checkout">
                    Proceed to checkout
                  </Link>
                  <Link href="/shop" className="cart-continue">
                    Keep browsing
                  </Link>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}
