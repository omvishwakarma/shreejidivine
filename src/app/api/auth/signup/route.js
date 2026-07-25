import { NextResponse } from 'next/server'
import { z } from 'zod'
import { dbConnect, signToken } from '@/lib/mongo/auth'
import { User } from '@/lib/mongo/User'

export async function POST(request) {
  try {
    await dbConnect()
    const schema = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(6),
      phone: z.string().optional().or(z.literal('')),
    })
    const data = schema.parse(await request.json())
    const exists = await User.findOne({ email: data.email.toLowerCase() })
    if (exists) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }
    const user = await User.create({
      name: data.name.trim(),
      email: data.email.toLowerCase(),
      passwordHash: await User.hashPassword(data.password),
      phone: data.phone || '',
      role: 'user',
    })
    const token = await signToken(user)
    return NextResponse.json({ user: user.toSafeJSON(), token }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors?.[0]?.message || err.issues?.[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    console.error(err)
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 })
  }
}
