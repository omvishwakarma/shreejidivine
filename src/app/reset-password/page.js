import { Suspense } from 'react'
import ResetPasswordClient from './ResetPasswordClient'
import AuthPageSkeleton from '../../components/AuthPageSkeleton'

export const metadata = { title: 'Reset password', robots: { index: false, follow: false } }

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthPageSkeleton />}>
      <ResetPasswordClient />
    </Suspense>
  )
}
