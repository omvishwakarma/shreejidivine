import { Suspense } from 'react'
import LoginClient from './LoginClient'

export const metadata = { title: 'Login' }

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="ecom-page">
          <p className="empty-state">Loading…</p>
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  )
}
