import { Suspense } from 'react'
import OrderDetailClient, { OrderDetailSkeleton } from './OrderDetailClient'

export const metadata = { title: 'Order Detail', robots: { index: false, follow: false } }

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<OrderDetailSkeleton placed />}>
      <OrderDetailClient />
    </Suspense>
  )
}
