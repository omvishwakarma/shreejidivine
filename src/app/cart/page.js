'use client'

import ShopNav from '../../components/ShopNav'
import Footer from '../../components/Footer'
import CartPanel from '../../components/CartPanel'
import '../ecom.css'
import './cart.css'

export default function CartPage() {
  return (
    <div className="ecom-page cart-page">
      <ShopNav />
      <div className="cart-shell">
        <h1 className="sr-only">Cart</h1>
        <CartPanel />
      </div>
      <Footer />
    </div>
  )
}
