import { NextResponse } from 'next/server'
import { z } from 'zod'
import { dbConnect, requireAdmin } from '@/lib/mongo/auth'
import { PwaDevice } from '@/lib/mongo/PwaDevice'
import { PushMessage } from '@/lib/mongo/PushMessage'
import { configureWebPush, pushReady, sendWebPush } from '@/lib/webPush'

export async function GET(request) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error
  await dbConnect()
  const [installs, subscribers, messages] = await Promise.all([
    PwaDevice.countDocuments({ installed: true }),
    PwaDevice.countDocuments({ pushEndpoint: { $ne: '' } }),
    PushMessage.find().sort({ createdAt: -1 }).limit(12),
  ])
  return NextResponse.json({
    ready: pushReady(),
    installs,
    subscribers,
    messages: messages.map((item) => item.toJSONSafe()),
  })
}

export async function POST(request) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error
  if (!configureWebPush()) {
    return NextResponse.json(
      { error: 'Push keys are missing. Add VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY on the server, then redeploy.' },
      { status: 400 }
    )
  }

  try {
    const schema = z.object({
      title: z.string().trim().min(2).max(80),
      body: z.string().trim().min(2).max(180),
      url: z.string().trim().max(300).optional(),
    })
    const data = schema.parse(await request.json())
    const url = data.url && data.url.startsWith('/') ? data.url : '/'
    await dbConnect()
    const devices = await PwaDevice.find({ pushEndpoint: { $ne: '' } })
    let sent = 0
    let failed = 0
    await Promise.all(
      devices.map(async (device) => {
        try {
          await sendWebPush(
            {
              endpoint: device.pushEndpoint,
              keys: { p256dh: device.pushP256dh, auth: device.pushAuth },
            },
            { title: data.title, body: data.body, url }
          )
          sent += 1
        } catch (err) {
          failed += 1
          const status = err?.statusCode
          if (status === 404 || status === 410) {
            device.pushEndpoint = ''
            device.pushP256dh = ''
            device.pushAuth = ''
            await device.save()
          }
        }
      })
    )
    const message = await PushMessage.create({
      title: data.title,
      body: data.body,
      url,
      targeted: devices.length,
      sent,
      failed,
    })
    return NextResponse.json({ message: message.toJSONSafe(), installs: await PwaDevice.countDocuments({ installed: true }), subscribers: sent })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Add a title and a short message.' }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Could not send notification' }, { status: 500 })
  }
}
