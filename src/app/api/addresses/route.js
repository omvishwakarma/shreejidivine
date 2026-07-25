import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

const schema = z.object({
  label: z.string().min(1).max(40).default('Home'),
  fullName: z.string().min(2),
  phone: z.string().min(10),
  line1: z.string().min(3),
  line2: z.string().optional().or(z.literal('')),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(5).max(10),
  isDefault: z.boolean().optional(),
})

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  })

  return NextResponse.json({ addresses })
}

export async function POST(req) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = schema.parse(body)

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      })
    }

    const count = await prisma.address.count({ where: { userId: user.id } })
    const address = await prisma.address.create({
      data: {
        userId: user.id,
        label: data.label,
        fullName: data.fullName,
        phone: data.phone,
        line1: data.line1,
        line2: data.line2 || null,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        isDefault: data.isDefault ?? count === 0,
      },
    })

    return NextResponse.json({ address }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message || 'Invalid input' }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Could not save address' }, { status: 500 })
  }
}
