import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import {
  hashPassword,
  createSessionToken,
  setSessionCookie,
} from '@/lib/auth'

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  phone: z.string().min(10).max(15).optional().or(z.literal('')),
})

export async function POST(req) {
  try {
    const body = await req.json()
    const data = schema.parse(body)

    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const passwordHash = await hashPassword(data.password)
    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase(),
        passwordHash,
        phone: data.phone || null,
      },
      select: { id: true, name: true, email: true, phone: true },
    })

    const token = await createSessionToken(user)
    await setSessionCookie(token)

    return NextResponse.json({ user })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message || 'Invalid input' }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 })
  }
}
