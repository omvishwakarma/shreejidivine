import { Suspense } from 'react'
import LoginClient from './LoginClient'

export const metadata = { title: 'Login' }

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-split" style={{ minHeight: '100vh' }} />}>
      <LoginClient />
    </Suspense>
  )
}
