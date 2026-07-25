'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAdminToken, getAdminUser } from '../../lib/adminApi'
import AdminShell from '../../components/admin/AdminShell'

export default function AdminGuard({ children }) {
  const router = useRouter()
  const [ok, setOk] = useState(false)

  useEffect(() => {
    const token = getAdminToken()
    const user = getAdminUser()
    if (!token || user?.role !== 'admin') {
      router.replace('/admin/login')
      return
    }
    setOk(true)
  }, [router])

  if (!ok) {
    return <div className="admin-loading">Checking admin access…</div>
  }

  return <AdminShell>{children}</AdminShell>
}
