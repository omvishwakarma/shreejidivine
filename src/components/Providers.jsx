'use client'

import { CartProvider } from '../context/CartContext'
import { AuthProvider } from '../context/AuthContext'
import MarketingCookies from './MarketingCookies'
import CartDock from './CartDock'
import CartDrawer from './CartDrawer'
import KnowBraceletTab from './KnowBraceletTab'
import GiftTab from './GiftTab'
import FreeGiftPopup from './FreeGiftPopup'
import WhatsAppChat from './WhatsAppChat'
import PwaClient from './PwaClient'
import BootSplash from './BootSplash'
import AbandonedCartSync from './AbandonedCartSync'

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
        <CartDrawer />
        <CartDock />
        <KnowBraceletTab />
        <GiftTab />
        <FreeGiftPopup />
        <AbandonedCartSync />
        <WhatsAppChat />
        <MarketingCookies />
        <PwaClient />
        <BootSplash />
      </CartProvider>
    </AuthProvider>
  )
}
