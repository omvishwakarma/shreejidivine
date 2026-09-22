import { NextResponse } from 'next/server'
import { z } from 'zod'
import { dbConnect, signToken } from '@/lib/mongo/auth'
import { User } from '@/lib/mongo/User'
import { verifyGoogleIdToken } from '@/lib/googleAuth'
import { sendWelcomeEmail } from '@/lib/mail'

export async function POST(request) {
  try {
    await dbConnect()
    const schema = z.object({
      idToken: z.string().min(20),
    })
    const { idToken } = schema.parse(await request.json())
    const profile = await verifyGoogleIdToken(idToken)

    let user = await User.findOne({
      $or: [{ googleId: profile.googleId }, { email: profile.email }],
    })

    let isNew = false
    if (!user) {
      isNew = true
      user = await User.create({
        name: profile.name,
        email: profile.email,
        googleId: profile.googleId,
        authProvider: 'google',
        passwordHash: '',
        phone: '',
        role: 'user',
      })
    } else {
      let dirty = false
      if (!user.googleId) {
        user.googleId = profile.googleId
        dirty = true
      }
      if (user.authProvider !== 'google' && !user.passwordHash) {
        user.authProvider = 'google'
        dirty = true
      }
      if ((!user.name || user.name === 'User') && profile.name) {
        user.name = profile.name
        dirty = true
      }
      if (dirty) await user.save()
    }

    const token = await signToken(user)
    if (isNew) void sendWelcomeEmail(user.toSafeJSON())

    return NextResponse.json(
      { user: user.toSafeJSON(), token },
      { status: isNew ? 201 : 200 }
    )
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid Google token' }, { status: 400 })
    }
    const status = err.status || 401
    const message =
      status === 503
        ? 'Google sign-in is not configured'
        : err.message || 'Google sign-in failed'
    if (status >= 500) console.error(err)
    return NextResponse.json({ error: message }, { status })
  }
}
