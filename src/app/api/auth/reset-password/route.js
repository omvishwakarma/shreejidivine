import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { dbConnect } from '@/lib/mongo/auth'
import { User } from '@/lib/mongo/User'

export async function POST(request) {
  try {
    const schema = z.object({
      token: z.string().min(20),
      password: z.string().min(6),
    })
    const data = schema.parse(await request.json())
    await dbConnect()

    const hash = crypto.createHash('sha256').update(data.token).digest('hex')
    const user = await User.findOne({
      resetPasswordTokenHash: hash,
      resetPasswordExpires: { $gt: new Date() },
    })
    if (!user) {
      return NextResponse.json(
        { error: 'This reset link is invalid or has expired.' },
        { status: 400 }
      )
    }

    user.passwordHash = await User.hashPassword(data.password)
    user.resetPasswordTokenHash = ''
    user.resetPasswordExpires = null
    await user.save()

    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Could not reset password.' }, { status: 500 })
  }
}
