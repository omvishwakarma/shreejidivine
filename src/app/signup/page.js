import { Suspense } from 'react'
import SignupClient from './SignupClient'

export const metadata = { title: 'Sign Up' }

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="auth-split" style={{ minHeight: '100vh' }} />}>
      <SignupClient />
    </Suspense>
  )
}
