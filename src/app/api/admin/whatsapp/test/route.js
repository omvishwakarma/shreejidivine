import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/mongo/auth'
import {
  normalizeWhatsappNumber,
  sendWhatsAppTemplate,
  buildTemplateComponents,
  WA_TEMPLATES,
  whatsappConfigDebug,
} from '@/lib/whatsapp'

export const maxDuration = 30

/** Admin-only: verify Omni credentials + send a cancel/confirm template. */
export async function POST(request) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error

  try {
    const schema = z.object({
      phone: z.string().min(10),
      template: z.enum(['cancel', 'confirm']).default('cancel'),
      name: z.string().optional(),
      orderId: z.string().optional(),
    })
    const data = schema.parse(await request.json())
    const phone = normalizeWhatsappNumber(data.phone)
    const config = whatsappConfigDebug()
    if (!config.configured) {
      return NextResponse.json(
        { error: 'WhatsApp env missing on this deployment', config },
        { status: 503 }
      )
    }

    const name = data.name || 'Ji'
    const orderId = data.orderId || 'SD-TEST'
    const template =
      data.template === 'confirm' ? WA_TEMPLATES.orderConfirmation : WA_TEMPLATES.orderCancelled
    const params =
      data.template === 'confirm'
        ? { name, orderId, amount: '1', paymentMethod: 'Test' }
        : { name, orderId }

    const result = await sendWhatsAppTemplate({
      to: phone,
      template,
      components: buildTemplateComponents(template, params),
      callbackData: `admin-test:${orderId}`,
    })

    return NextResponse.json({ ok: true, phone, template, result, config })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    console.error('[whatsapp admin test]', err)
    return NextResponse.json(
      {
        error: err.message || 'WhatsApp test failed',
        config: whatsappConfigDebug(),
        payload: err.payload || null,
      },
      { status: 500 }
    )
  }
}
