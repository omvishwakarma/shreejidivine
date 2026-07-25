import { NextResponse } from 'next/server'
import { dbConnect, requireUser } from '@/lib/mongo/auth'
import { Address } from '@/lib/mongo/Address'

export async function DELETE(request, { params }) {
  const gate = await requireUser(request)
  if (gate.error) return gate.error
  await dbConnect()
  const { id } = await params
  const address = await Address.findOneAndDelete({ _id: id, user: gate.auth.sub })
  if (!address) {
    return NextResponse.json({ error: 'Address not found' }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
