import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/mongo/auth'
import { getGa4Dashboard } from '@/lib/ga4'

export async function GET(request) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error
  try {
    const analytics = await getGa4Dashboard()
    return NextResponse.json(analytics)
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Analytics failed' }, { status: 502 })
  }
}
