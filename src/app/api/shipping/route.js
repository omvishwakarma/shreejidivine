import { NextResponse } from 'next/server'
import { getStoreSettings, shippingNote } from '@/lib/shipping'

export async function GET() {
  try {
    const settings = await getStoreSettings()
    return NextResponse.json({
      ...settings,
      note: shippingNote(settings),
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      {
        shippingFee: 0,
        freeShippingMinOrder: 0,
        note: 'Pan-India free shipping on all orders',
      },
      { status: 200 }
    )
  }
}
