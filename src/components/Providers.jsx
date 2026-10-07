'use client'

import { CartProvider } from '../context/CartContext'
import { AuthProvider } from '../context/AuthContext'
import MarketingCookies from './MarketingCookies'
import CartDock from './CartDock'
import KnowBraceletTab from './KnowBraceletTab'
import GiftTab from './GiftTab'
import PwaClient from './PwaClient'

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
        <CartDock />
        <KnowBraceletTab />
        <GiftTab />
        <MarketingCookies />
        <PwaClient />
      </CartProvider>
    </AuthProvider>
  )
}
