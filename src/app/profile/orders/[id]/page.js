import { Suspense } from 'react'
import OrderDetailClient from './OrderDetailClient'

export const metadata = { title: 'Order Detail' }

export default function OrderDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="ecom-page">
          <p className="empty-state">Loading…</p>
        </div>
      }
    >
      <OrderDetailClient />
    </Suspense>
  )
}
