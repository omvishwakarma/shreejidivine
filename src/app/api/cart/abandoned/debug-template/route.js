import { NextResponse } from 'next/server'
import { dbConnect, verifyAuth } from '@/lib/mongo/auth'
import { normalizeWhatsappNumber } from '@/lib/whatsapp/phone'
import { sendWhatsAppTemplate, isWhatsAppConfigured, whatsappConfigDebug } from '@/lib/whatsapp/client'
import { buildTemplateComponents, WA_TEMPLATES } from '@/lib/whatsapp/templates'

export const dynamic = 'force-dynamic'

function env(name) {
  return String(process.env[name] || '').trim().replace(/^["']|["']$/g, '')
}

async function listTemplates() {
  const wabaId = env('WHATSAPP_WABA_ID') || '1506595104622584'
  const base = (env('WHATSAPP_API_BASE') || 'https://omni.yourbulksms.com/V23.0').replace(/\/$/, '')
  const url = `${base}/${wabaId}/message_templates?limit=100`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${env('WHATSAPP_ACCESS_TOKEN')}` },
  })
  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { raw: text.slice(0, 500) }
  }
  return { status: res.status, url, data }
}

/**
 * Debug: list templates + probe abandoned-cart name/language combos.
 * Requires logged-in user. Use ?send=1&phone=91XXXXXXXXXX to actually send a probe.
 */
export async function GET(request) {
  const auth = await verifyAuth(request)
  if (!auth?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isWhatsAppConfigured()) {
    return NextResponse.json({ error: 'WhatsApp not configured', debug: whatsappConfigDebug() })
  }

  const configuredName = WA_TEMPLATES.abandonedCart
  const names = [
    ...new Set(
      [
        configuredName,
        'sd_abandoned_cart_1',
        'sd_abandoned_cart',
        'abandoned_cart_1',
        'abandoned_cart',
      ].filter(Boolean)
    ),
  ]
  const languages = [
    ...new Set(
      [
        env('WHATSAPP_ABANDONED_CART_LANGUAGE'),
        env('WHATSAPP_TEMPLATE_LANGUAGE'),
        'en_US',
        'en',
        'en_GB',
        'en_IN',
      ].filter(Boolean)
    ),
  ]

  let listed = null
  try {
    listed = await listTemplates()
  } catch (err) {
    listed = { error: err.message }
  }

  const listedAbandoned = []
  const rows = listed?.data?.data || listed?.data?.response || []
  if (Array.isArray(rows)) {
    for (const row of rows) {
      const n = String(row?.name || '')
      if (/abandon|cart|sd_/i.test(n)) {
        listedAbandoned.push({
          name: row.name,
          language: row.language,
          status: row.status,
          id: row.id,
        })
      }
    }
  }

  const shouldSend = request.nextUrl.searchParams.get('send') === '1'
  const phone = normalizeWhatsappNumber(request.nextUrl.searchParams.get('phone') || '')
  const probes = []

  if (shouldSend && phone) {
    const components = buildTemplateComponents(configuredName, {
      name: 'Ji',
      product: 'Test Product',
      amount: '99',
    })
    for (const name of names) {
      for (const language of languages) {
        try {
          const result = await sendWhatsAppTemplate({
            to: phone,
            template: name,
            language,
            components,
            callbackData: `probe:${name}:${language}`,
          })
          probes.push({ name, language, ok: true, id: result?.data?.messages?.[0]?.id })
          // Stop on first success
          return NextResponse.json({
            ok: true,
            working: { name, language },
            probes,
            listedAbandoned,
            config: {
              ...whatsappConfigDebug(),
              abandonedTemplate: configuredName,
              abandonedLanguage: env('WHATSAPP_ABANDONED_CART_LANGUAGE') || null,
              wabaId: env('WHATSAPP_WABA_ID') || '1506595104622584',
            },
            listStatus: listed?.status,
          })
        } catch (err) {
          probes.push({
            name,
            language,
            ok: false,
            error: err.message,
          })
        }
      }
    }
  }

  return NextResponse.json({
    ok: false,
    message: shouldSend
      ? 'No name/language combo worked. Check listedAbandoned / Meta dashboard.'
      : 'Add ?send=1&phone=91XXXXXXXXXX to probe-send. Or set env from listedAbandoned.',
    probes,
    listedAbandoned,
    suggestedEnv: listedAbandoned[0]
      ? {
          WHATSAPP_ABANDONED_CART_TEMPLATE: listedAbandoned[0].name,
          WHATSAPP_ABANDONED_CART_LANGUAGE: listedAbandoned[0].language,
        }
      : {
          WHATSAPP_ABANDONED_CART_TEMPLATE: 'sd_abandoned_cart_1',
          WHATSAPP_ABANDONED_CART_LANGUAGE: 'en_US',
        },
    config: {
      ...whatsappConfigDebug(),
      abandonedTemplate: configuredName,
      abandonedLanguage: env('WHATSAPP_ABANDONED_CART_LANGUAGE') || null,
      wabaId: env('WHATSAPP_WABA_ID') || '1506595104622584',
    },
    listStatus: listed?.status,
    listError: listed?.error || listed?.data?.error || null,
  })
}
