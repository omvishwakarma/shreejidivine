import { Suspense } from 'react'
import ForgotPasswordClient from './ForgotPasswordClient'
import AuthPageSkeleton from '../../components/AuthPageSkeleton'

export const metadata = { title: 'Forgot password', robots: { index: false, follow: false } }

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<AuthPageSkeleton />}>
      <ForgotPasswordClient />
    </Suspense>
  )
}
