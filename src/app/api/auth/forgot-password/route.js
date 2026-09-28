import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { dbConnect } from '@/lib/mongo/auth'
import { User } from '@/lib/mongo/User'
import { sendPasswordResetEmail } from '@/lib/mail'
import { isMailConfigured } from '@/lib/mail/send'

const MESSAGE = 'If an account exists for that email, we sent a reset link. It expires in 1 hour.'

export async function POST(request) {
  try {
    const schema = z.object({ email: z.string().email() })
    const data = schema.parse(await request.json())

    if (!isMailConfigured()) {
      return NextResponse.json(
        { error: 'Password reset email is not available right now. Please try again later.' },
        { status: 503 }
      )
    }

    await dbConnect()
    const user = await User.findOne({ email: data.email.toLowerCase() })
    if (!user) {
      return NextResponse.json({ ok: true, message: MESSAGE })
    }

    const token = crypto.randomBytes(32).toString('hex')
    user.resetPasswordTokenHash = crypto.createHash('sha256').update(token).digest('hex')
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000)
    await user.save()

    const resetUrl = `${new URL(request.url).origin}/reset-password?token=${token}`
    const sent = await sendPasswordResetEmail(user, resetUrl)
    if (!sent?.ok) {
      user.resetPasswordTokenHash = ''
      user.resetPasswordExpires = null
      await user.save()
      return NextResponse.json(
        { error: 'Could not send the reset email. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, message: MESSAGE })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Enter a valid email.' }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Could not start password reset.' }, { status: 500 })
  }
}
