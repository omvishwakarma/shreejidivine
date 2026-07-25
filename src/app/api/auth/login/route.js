import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import {
  verifyPassword,
  createSessionToken,
  setSessionCookie,
} from '@/lib/auth'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(req) {
  try {
    const body = await req.json()
    const data = schema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    })
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const ok = await verifyPassword(data.password, user.passwordHash)
    if (!ok) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const safe = { id: user.id, name: user.name, email: user.email, phone: user.phone }
    const token = await createSessionToken(safe)
    await setSessionCookie(token)

    return NextResponse.json({ user: safe })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
