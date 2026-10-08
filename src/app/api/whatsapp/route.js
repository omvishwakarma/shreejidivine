import { NextResponse } from 'next/server'
import { getStoreSettings } from '@/lib/shipping'
import { whatsappHref } from '@/lib/whatsapp'

export async function GET() {
  try {
    const settings = await getStoreSettings()
    const href = whatsappHref(settings.whatsappNumber)
    return NextResponse.json(
      { href },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json({ href: '' })
  }
}
