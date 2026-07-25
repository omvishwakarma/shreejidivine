import { NextResponse } from 'next/server'
import { dbConnect, requireUser, getAuthUser } from '../../../../lib/mongo/auth'

export async function GET(request) {
  const gate = await requireUser(request)
  if (gate.error) return gate.error
  try {
    await dbConnect()
    const user = await getAuthUser(gate.auth)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }
    return NextResponse.json({ user: user.toSafeJSON() })
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
