import { Suspense } from 'react'
import OrderDetailClient, { OrderDetailSkeleton } from './OrderDetailClient'

export const metadata = { title: 'Order Detail' }

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<OrderDetailSkeleton placed />}>
      <OrderDetailClient />
    </Suspense>
  )
}
