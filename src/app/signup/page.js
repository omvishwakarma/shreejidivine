import { Suspense } from 'react'
import SignupClient from './SignupClient'
import AuthPageSkeleton from '../../components/AuthPageSkeleton'

export const metadata = { title: 'Sign Up' }

export default function SignupPage() {
  return (
    <Suspense fallback={<AuthPageSkeleton />}>
      <SignupClient />
    </Suspense>
  )
}
