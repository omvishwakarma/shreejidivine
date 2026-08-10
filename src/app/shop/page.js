import { Suspense } from 'react'
import ShopClient from './ShopClient'

export const metadata = {
  title: 'Shop',
  description:
    'Shop Shreeji Divine Aroma Stones — Divine Ritual Kit, Mogra Royale, Rose Majesty, Lavender Bliss & Royal Chandan.',
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="ecom-page"><div className="ecom-wrap empty-state">Loading shop…</div></div>}>
      <ShopClient />
    </Suspense>
  )
}
