'use client'

import { CartProvider } from '../context/CartContext'
import { AuthProvider } from '../context/AuthContext'
import MarketingCookies from './MarketingCookies'
import CartDock from './CartDock'
import KnowBraceletTab from './KnowBraceletTab'
import GiftTab from './GiftTab'
import WhatsAppChat from './WhatsAppChat'
import PwaClient from './PwaClient'
import BootSplash from './BootSplash'

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
        <CartDock />
        <KnowBraceletTab />
        <GiftTab />
        <WhatsAppChat />
        <MarketingCookies />
        <PwaClient />
        <BootSplash />
      </CartProvider>
    </AuthProvider>
  )
}
