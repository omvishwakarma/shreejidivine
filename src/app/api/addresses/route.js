import { NextResponse } from 'next/server'
import { z } from 'zod'
import { dbConnect, requireUser } from '@/lib/mongo/auth'
import { Address } from '@/lib/mongo/Address'

const schema = z.object({
  label: z.string().min(1).default('Home'),
  fullName: z.string().min(2),
  phone: z.string().min(10),
  line1: z.string().min(3),
  line2: z.string().optional().or(z.literal('')),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(5),
  isDefault: z.boolean().optional(),
})

export async function GET(request) {
  const gate = await requireUser(request)
  if (gate.error) return gate.error
  await dbConnect()
  const addresses = await Address.find({ user: gate.auth.sub }).sort({
    isDefault: -1,
    createdAt: -1,
  })
  return NextResponse.json({ addresses: addresses.map((a) => a.toJSONSafe()) })
}

export async function POST(request) {
  const gate = await requireUser(request)
  if (gate.error) return gate.error
  try {
    await dbConnect()
    const data = schema.parse(await request.json())
    if (data.isDefault) {
      await Address.updateMany({ user: gate.auth.sub }, { isDefault: false })
    }
    const count = await Address.countDocuments({ user: gate.auth.sub })
    const address = await Address.create({
      user: gate.auth.sub,
      ...data,
      line2: data.line2 || '',
      isDefault: data.isDefault ?? count === 0,
    })
    return NextResponse.json({ address: address.toJSONSafe() }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors?.[0]?.message || err.issues?.[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Could not save address' }, { status: 500 })
  }
}
