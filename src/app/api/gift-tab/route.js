import { NextResponse } from 'next/server'
import { getStoreSettings } from '@/lib/shipping'

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const DEFAULT_TEXT = 'CLAIM YOUR FREE GIFT'

export async function GET() {
  try {
    const settings = await getStoreSettings()
    const text = String(settings.giftTabText || '').trim() || DEFAULT_TEXT
    const slug = String(settings.giftTabSlug || '').trim().toLowerCase()
    const href = SLUG.test(slug) ? `/shop/${slug}` : '/shop'
    return NextResponse.json(
      { text, href },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json({ text: DEFAULT_TEXT, href: '/shop' })
  }
}
