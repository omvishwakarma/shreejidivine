import { NextResponse } from 'next/server'
import { getStoreSettings } from '@/lib/shipping'

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export async function GET() {
  try {
    const settings = await getStoreSettings()
    const text = String(settings.giftTabText || '').trim()
    const slug = String(settings.giftTabSlug || '').trim().toLowerCase()
    if (!text || !SLUG.test(slug)) {
      return NextResponse.json(
        { text: '', href: '' },
        { headers: { 'Cache-Control': 'no-store' } }
      )
    }
    return NextResponse.json(
      { text, href: `/shop/${slug}` },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json({ text: '', href: '' })
  }
}
