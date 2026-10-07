import { Suspense } from 'react'
import ShopClient from './ShopClient'
import { SITE_DESCRIPTION } from '../../lib/site'

export const metadata = {
  title: 'Shop',
  description: SITE_DESCRIPTION,
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="ecom-page"><div className="ecom-wrap empty-state">Loading shop…</div></div>}>
      <ShopClient />
    </Suspense>
  )
}
