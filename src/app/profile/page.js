import { Suspense } from 'react'
import ProfileClient, { ProfileSkeleton } from './ProfileClient'

export const metadata = { title: 'My Account', robots: { index: false, follow: false } }

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileClient />
    </Suspense>
  )
}
