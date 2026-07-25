import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

const schema = z.object({
  label: z.string().min(1).max(40).optional(),
  fullName: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  line1: z.string().min(3).optional(),
  line2: z.string().optional().nullable(),
  city: z.string().min(2).optional(),
  state: z.string().min(2).optional(),
  pincode: z.string().min(5).max(10).optional(),
  isDefault: z.boolean().optional(),
})

export async function PATCH(req, { params }) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const existing = await prisma.address.findFirst({
    where: { id, userId: user.id },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Address not found' }, { status: 404 })
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

    const address = await prisma.address.update({
      where: { id },
      data: {
        ...data,
        line2: data.line2 === '' ? null : data.line2,
      },
    })

    return NextResponse.json({ address })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(_req, { params }) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const existing = await prisma.address.findFirst({
    where: { id, userId: user.id },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Address not found' }, { status: 404 })
  }

  await prisma.address.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
