'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import ShopNav from '../../components/ShopNav'
import Footer from '../../components/Footer'
import { useCart } from '../../context/CartContext'
import { formatINR, FREE_SHIPPING_NOTE } from '../../lib/products'
import CartRewards from '../../components/CartRewards'
import { applyCartRewards, shippingFeeFor } from '../../lib/cartRewards'
import '../ecom.css'
import './cart.css'

export default function CartPage() {
  const { items, updateQty, removeItem, subtotal, ready } = useCart()
  const [settings, setSettings] = useState({
    shippingFee: 0,
    freeShippingMinOrder: 0,
    note: FREE_SHIPPING_NOTE,
  })

  useEffect(() => {
    fetch('/api/shipping')
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch(() => {})
  }, [])

  const rewards = applyCartRewards(subtotal, settings.cartRewards)
  const shippingFee = shippingFeeFor(subtotal, settings)
  const total = Math.max(0, subtotal - rewards.discount) + shippingFee

  return (
    <div className="ecom-page cart-page">
      <ShopNav />
      <div className="cart-shell">
        {!ready ? (
          <div className="cart-skel" aria-busy="true" aria-label="Loading cart">
            <div className="cart-board">
              <div>
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="cart-skel__line">
                    <span className="skel cart-skel__thumb" />
                    <span className="cart-skel__copy">
                      <span className="skel cart-skel__name" />
                      <span className="skel cart-skel__price" />
                    </span>
                  </div>
                ))}
              </div>
              <div className="cart-skel__summary">
                <span className="skel cart-skel__sum-line" />
                <span className="skel cart-skel__sum-line cart-skel__sum-line--short" />
                <span className="skel cart-skel__sum-btn" />
              </div>
            </div>
          </div>
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
            <h1 className="sr-only">Cart</h1>
            <CartRewards subtotal={subtotal} rewards={settings.cartRewards} />

            <div className="cart-board">
              <div className="cart-list">
                {items.map((item) => (
                  <article key={item.lineKey || item.productId} className="cart-line">
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
                      {item.colour || item.fragrance ? (
                        <p className="cart-line__variant">
                          {[item.colour && `Colour: ${item.colour}`, item.fragrance && `Fragrance: ${item.fragrance}`]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      ) : null}
                      <p className="cart-line__unit">{formatINR(item.price)} each</p>
                      <div className="cart-line__controls">
                        <div className="cart-qty">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() =>
                              updateQty(item.lineKey || item.productId, item.quantity - 1)
                            }
                          >
                            −
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() =>
                              updateQty(item.lineKey || item.productId, item.quantity + 1)
                            }
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          className="cart-remove"
                          onClick={() => removeItem(item.lineKey || item.productId)}
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
                  <p className="cart-summary__note">{settings.note || FREE_SHIPPING_NOTE}</p>
                  <div className="cart-summary__rows">
                    <div>
                      <span>Subtotal</span>
                      <span>{formatINR(subtotal)}</span>
                    </div>
                    <div>
                      <span>Shipping</span>
                      <span>{shippingFee === 0 ? 'Free' : formatINR(shippingFee)}</span>
                    </div>
                    {rewards.offers.map((offer) => (
                      <div key={offer.label} className="is-offer">
                        <span>{offer.label}</span>
                        <span>−{formatINR(offer.off)}</span>
                      </div>
                    ))}
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
