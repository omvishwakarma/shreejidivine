import { NextResponse } from 'next/server'
import { dbConnect, requireAdmin } from '../../../../lib/mongo/auth'
import { User } from '../../../../lib/mongo/User'

export async function GET(request) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error
  await dbConnect()
  const users = await User.find({ role: 'user' }).sort({ createdAt: -1 })
  return NextResponse.json({ users: users.map((u) => u.toSafeJSON()) })
}
