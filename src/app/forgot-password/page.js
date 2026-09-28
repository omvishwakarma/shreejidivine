import { Suspense } from 'react'
import ForgotPasswordClient from './ForgotPasswordClient'
import AuthPageSkeleton from '../../components/AuthPageSkeleton'

export const metadata = { title: 'Forgot password' }

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<AuthPageSkeleton />}>
      <ForgotPasswordClient />
    </Suspense>
  )
}
