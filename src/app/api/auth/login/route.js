import { NextResponse } from 'next/server'
import { z } from 'zod'
import { dbConnect, signToken } from '../../../../lib/mongo/auth'
import { User } from '../../../../lib/mongo/User'

export async function POST(request) {
  try {
    await dbConnect()
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(1),
    })
    const data = schema.parse(await request.json())
    const user = await User.findOne({ email: data.email.toLowerCase() })
    if (!user || !(await user.comparePassword(data.password))) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }
    const token = await signToken(user)
    return NextResponse.json({ user: user.toSafeJSON(), token })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
