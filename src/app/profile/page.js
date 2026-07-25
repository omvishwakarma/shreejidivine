import { Suspense } from 'react'
import ProfileClient from './ProfileClient'

export const metadata = { title: 'My Account' }

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="ecom-page">
          <p className="empty-state">Loading…</p>
        </div>
      }
    >
      <ProfileClient />
    </Suspense>
  )
}
