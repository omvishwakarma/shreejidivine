import { NextResponse } from 'next/server'
import { getStoreSettings, shippingNote } from '@/lib/shipping'
import { DEFAULT_CART_REWARDS } from '@/lib/cartRewards'

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
        cartRewards: DEFAULT_CART_REWARDS,
        note: 'Pan-India free shipping on all orders',
        codEnabled: true,
      },
      { status: 200 }
    )
  }
}
