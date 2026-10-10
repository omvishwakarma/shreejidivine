import { Suspense } from 'react'
import LoginClient from './LoginClient'
import AuthPageSkeleton from '../../components/AuthPageSkeleton'

export const metadata = { title: 'Login', robots: { index: false, follow: false } }

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthPageSkeleton />}>
      <LoginClient />
    </Suspense>
  )
}
