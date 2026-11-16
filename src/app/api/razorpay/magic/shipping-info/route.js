import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/mongo/auth'
import { findMagicOrder, magicCorsHeaders } from '@/lib/razorpayMagic'
import { getStoreSettings, calcShippingFee } from '@/lib/shipping'

export const dynamic = 'force-dynamic'

function toRupeePaise(amount) {
  return Math.max(0, Math.round(Number(amount) || 0) * 100)
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: magicCorsHeaders() })
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const addresses = Array.isArray(body?.addresses) ? body.addresses : []

    await dbConnect()
    const settings = await getStoreSettings()
    const orderDoc = await findMagicOrder({
      orderId: body?.order_id,
      razorpayOrderId: body?.razorpay_order_id,
    })
    const order = orderDoc?.toObject ? orderDoc.toObject() : orderDoc

    const subtotal = Math.max(0, Number(order?.subtotal) || 0)
    const discount = Math.max(0, Number(order?.discount) || 0)
    const rewardDiscount = Math.max(0, Number(order?.rewardDiscount) || 0)
    const merchandise = Math.max(0, subtotal - discount - rewardDiscount)

    let shippingFeeInr =
      order && order.shipping != null
        ? Math.max(0, Number(order.shipping) || 0)
        : calcShippingFee(subtotal, settings)

    const codMinOrder = Math.max(0, Number(settings.codMinOrder) || 0)
    const codAllowed =
      settings.codEnabled !== false && (codMinOrder <= 0 || merchandise >= codMinOrder)

    const responseAddresses = addresses.map((addr, index) => {
      const id = String(addr?.id ?? index)
      const zipcode = String(addr?.zipcode || '').trim()
      const state_code = String(addr?.state_code || '').trim()
      const country = String(addr?.country || 'IN').trim().toUpperCase() || 'IN'
      const inIndia = country === 'IN'

      return {
        id,
        zipcode,
        state_code,
        country,
        shipping_methods: [
          {
            id: 'standard',
            name: shippingFeeInr === 0 ? 'Free shipping' : 'Standard delivery',
            description:
              shippingFeeInr === 0
                ? 'Pan-India free shipping'
                : 'Delivery in 4–7 business days',
            serviceable: inIndia && Boolean(zipcode),
            shipping_fee: inIndia ? toRupeePaise(shippingFeeInr) : 0,
            cod: inIndia && codAllowed,
            cod_fee: 0,
          },
        ],
      }
    })

    return NextResponse.json(
      { addresses: responseAddresses },
      { headers: magicCorsHeaders() }
    )
  } catch (err) {
    console.error('[magic/shipping-info]', err)
    return NextResponse.json(
      { addresses: [], error: err.message || 'shipping_info_failed' },
      { status: 500, headers: magicCorsHeaders() }
    )
  }
}
