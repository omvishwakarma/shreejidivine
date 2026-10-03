'use client'

import { CartProvider } from '../context/CartContext'
import { AuthProvider } from '../context/AuthContext'
import MarketingCookies from './MarketingCookies'
import CartDock from './CartDock'
import KnowBraceletTab from './KnowBraceletTab'

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
        <CartDock />
        <KnowBraceletTab />
        <MarketingCookies />
      </CartProvider>
    </AuthProvider>
  )
}
