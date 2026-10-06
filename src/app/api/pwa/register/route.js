import { NextResponse } from 'next/server'
import { z } from 'zod'
import { dbConnect } from '@/lib/mongo/db'
import { PwaDevice } from '@/lib/mongo/PwaDevice'
import { vapidPublicKey } from '@/lib/webPush'

const schema = z.object({
  clientId: z.string().min(8).max(80),
  installed: z.boolean().optional(),
  standalone: z.boolean().optional(),
  userAgent: z.string().max(300).optional(),
  subscription: z
    .object({
      endpoint: z.string().url().max(2000),
      keys: z.object({
        p256dh: z.string().min(8).max(300),
        auth: z.string().min(8).max(300),
      }),
    })
    .nullable()
    .optional(),
})

export async function GET() {
  return NextResponse.json({ publicKey: vapidPublicKey() })
}

export async function POST(request) {
  try {
    const data = schema.parse(await request.json())
    await dbConnect()
    const existing = await PwaDevice.findOne({ clientId: data.clientId })
    const update = {
      userAgent: data.userAgent || existing?.userAgent || '',
    }
    if (data.installed || data.standalone) {
      update.installed = true
      update.standalone = Boolean(data.standalone || existing?.standalone)
      update.installedAt = existing?.installedAt || new Date()
    }
    if (data.subscription) {
      update.pushEndpoint = data.subscription.endpoint
      update.pushP256dh = data.subscription.keys.p256dh
      update.pushAuth = data.subscription.keys.auth
      update.installed = true
      update.installedAt = existing?.installedAt || new Date()
    }
    await PwaDevice.findOneAndUpdate({ clientId: data.clientId }, { $set: update }, { upsert: true })
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid install record' }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Could not save install' }, { status: 500 })
  }
}
