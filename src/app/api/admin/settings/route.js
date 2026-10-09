import { NextResponse } from 'next/server'
import { z } from 'zod'
import { dbConnect, requireAdmin } from '@/lib/mongo/auth'
import { StoreSettings, STORE_SETTINGS_DEFAULTS } from '@/lib/mongo/StoreSettings'
import { shippingNote } from '@/lib/shipping'
import { normalizeCartRewards } from '@/lib/cartRewards'
import { normalizeWhatsappNumber } from '@/lib/whatsapp'
import { isSafePublicImage } from '@/lib/media'

export async function GET(request) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error
  await dbConnect()
  let doc = await StoreSettings.findOne({ key: 'default' })
  if (!doc) {
    doc = await StoreSettings.create({ key: 'default', ...STORE_SETTINGS_DEFAULTS })
  }
  const settings = doc.toJSONSafe()
  return NextResponse.json({ settings, note: shippingNote(settings) })
}

export async function PATCH(request) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error

  try {
    await dbConnect()
    const schema = z.object({
      shippingFee: z.number().min(0).optional(),
      freeShippingMinOrder: z.number().min(0).optional(),
      cartRewards: z
        .array(
          z.object({
            amount: z.number().min(1),
            label: z.string().min(1).max(40),
            icon: z.enum(['shipping', 'discount', 'gift', 'rupee']).optional(),
          })
        )
        .max(6)
        .optional(),
      heroVideoDesktop: z.string().min(1).max(500).optional(),
      heroVideoMobile: z.string().min(1).max(500).optional(),
      heroPoster: z.string().max(800).optional(),
      heroPosterMobile: z.string().max(800).optional(),
      heroImagesDesktop: z
        .array(
          z.object({
            src: z.string().max(800),
            eyebrow: z.string().max(80).optional(),
            headline: z.string().max(160).optional(),
            ctaText: z.string().max(40).optional(),
            ctaHref: z.string().max(200).optional(),
          })
        )
        .max(8)
        .optional(),
      heroImagesMobile: z
        .array(
          z.object({
            src: z.string().max(800),
            eyebrow: z.string().max(80).optional(),
            headline: z.string().max(160).optional(),
            ctaText: z.string().max(40).optional(),
            ctaHref: z.string().max(200).optional(),
          })
        )
        .max(8)
        .optional(),
      heroHeadline: z.string().max(200).optional(),
      heroCtaText: z.string().min(1).max(60).optional(),
      heroCtaHref: z.string().min(1).max(200).optional(),
      homeCategoryLabel: z.string().max(80).optional(),
      homeCategoryTitle: z.string().max(120).optional(),
      homeCategoryLead: z.string().max(280).optional(),
      homeBestLabel: z.string().max(80).optional(),
      homeBestTitle: z.string().max(120).optional(),
      homeBestLead: z.string().max(280).optional(),
      homeReviewsTitle: z.string().max(120).optional(),
      homeReviewsLead: z.string().max(280).optional(),
      menuIconHome: z.string().max(800).optional(),
      menuIconShop: z.string().max(800).optional(),
      menuIconBracelet: z.string().max(800).optional(),
      menuIconBest: z.string().max(800).optional(),
      menuIconAbout: z.string().max(800).optional(),
      authBanner: z.string().max(800).optional(),
      codEnabled: z.boolean().optional(),
      productDetailInstagramEnabled: z.boolean().optional(),
      productDetailRelatedEnabled: z.boolean().optional(),
      giftTabText: z.string().max(80).optional(),
      giftTabSlug: z
        .string()
        .max(120)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$|^$/, 'Pick a product from the list')
        .optional(),
      whatsappNumber: z.string().max(20).optional(),
    })
    const data = schema.parse(await request.json())

    for (const key of [
      'heroPoster',
      'heroPosterMobile',
      'menuIconHome',
      'menuIconShop',
      'menuIconBracelet',
      'menuIconBest',
      'menuIconAbout',
      'authBanner',
    ]) {
      const value = String(data[key] || '').trim()
      if (data[key] !== undefined && value && !isSafePublicImage(value)) {
        return NextResponse.json(
          {
            error:
              'Image must be an uploaded file or a web path like /images/... Desktop file paths are not allowed.',
          },
          { status: 400 }
        )
      }
    }

    for (const key of ['heroImagesDesktop', 'heroImagesMobile']) {
      if (!Array.isArray(data[key])) continue
      const images = []
      for (const item of data[key]) {
        const src = String(item?.src || '').trim()
        if (!src) continue
        if (!isSafePublicImage(src)) {
          return NextResponse.json(
            {
              error:
                'Image must be an uploaded file or a web path like /images/... Desktop file paths are not allowed.',
            },
            { status: 400 }
          )
        }
        if (images.some((slide) => slide.src === src)) continue
        images.push({
          src,
          eyebrow: String(item.eyebrow || '').trim().slice(0, 80),
          headline: String(item.headline || '').trim().slice(0, 160),
          ctaText: String(item.ctaText || '').trim().slice(0, 40),
          ctaHref: String(item.ctaHref || '').trim().slice(0, 200),
        })
      }
      data[key] = images.slice(0, 8)
    }

    if (data.cartRewards) data.cartRewards = normalizeCartRewards(data.cartRewards)
    if (data.whatsappNumber !== undefined) {
      const raw = String(data.whatsappNumber || '').trim()
      if (!raw) {
        data.whatsappNumber = ''
      } else {
        const number = normalizeWhatsappNumber(raw)
        if (!number) {
          return NextResponse.json(
            { error: 'Enter a 10-digit WhatsApp number.' },
            { status: 400 }
          )
        }
        data.whatsappNumber = number
      }
    }

    const $set = {}
    for (const key of Object.keys(data)) {
      if (data[key] !== undefined) $set[key] = data[key]
    }

    if (Object.keys($set).length === 0) {
      return NextResponse.json({ error: 'No settings to update' }, { status: 400 })
    }

    const doc = await StoreSettings.findOneAndUpdate(
      { key: 'default' },
      {
        $set,
        $setOnInsert: { key: 'default' },
      },
      { new: true, upsert: true }
    )

    const settings = doc.toJSONSafe()
    return NextResponse.json({ settings, note: shippingNote(settings) })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors?.[0]?.message || err.issues?.[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    console.error(err)
    return NextResponse.json({ error: 'Could not update settings' }, { status: 500 })
  }
}
