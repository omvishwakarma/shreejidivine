import { Suspense } from 'react'
import SignupClient from './SignupClient'

export const metadata = { title: 'Sign Up' }

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="ecom-page">
          <p className="empty-state">Loading…</p>
        </div>
      }
    >
      <SignupClient />
    </Suspense>
  )
}
