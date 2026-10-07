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

function notificationPath(value) {
  const raw = String(value || '').trim()
  if (!raw) return '/'
  if (raw.startsWith('/') && !raw.startsWith('//')) return raw.slice(0, 300)
  try {
    const parsed = new URL(raw)
    const host = parsed.hostname.replace(/^www\./, '')
    const allowed = host === 'shreejidivine.co' || host === 'shreejidivinearoma.com' || host === 'localhost'
    if ((parsed.protocol === 'https:' || parsed.protocol === 'http:') && allowed) {
      return `${parsed.pathname}${parsed.search}` || '/'
    }
  } catch {
    /* keep the homepage path */
  }
  return '/'
}

export async function POST(request) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error

  try {
    const push = configureWebPush()
    if (!push.ok) {
      return NextResponse.json({ error: push.error }, { status: 400 })
    }
    const schema = z.object({
      title: z.string().trim().min(2).max(80),
      body: z.string().trim().min(2).max(180),
      url: z.string().trim().max(300).optional(),
    })
    const data = schema.parse(await request.json())
    const url = notificationPath(data.url)
    await dbConnect()
    const devices = await PwaDevice.find({
      pushEndpoint: { $ne: '' },
      pushP256dh: { $ne: '' },
      pushAuth: { $ne: '' },
    })
    let sent = 0
    let failed = 0
    const queue = [...devices]
    const workers = Array.from({ length: Math.min(8, queue.length) }, async () => {
      while (queue.length) {
        const device = queue.shift()
        if (!device) return
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
            try {
              await device.save()
            } catch (saveErr) {
              console.error(saveErr)
            }
          }
        }
      }
    })
    await Promise.all(workers)
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
