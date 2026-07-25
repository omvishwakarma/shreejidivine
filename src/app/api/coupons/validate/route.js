import { NextResponse } from 'next/server'
import { z } from 'zod'
import { dbConnect, requireUser } from '@/lib/mongo/auth'
import { validateCoupon } from '@/lib/coupons'

export async function POST(request) {
  const gate = await requireUser(request)
  if (gate.error) return gate.error

  try {
    await dbConnect()
    const schema = z.object({
      code: z.string().min(1),
      subtotal: z.number().min(0),
    })
    const data = schema.parse(await request.json())
    const result = await validateCoupon(data.code, data.subtotal)

    return NextResponse.json({
      code: result.code,
      type: result.type,
      value: result.value,
      discount: result.discount,
      message:
        result.type === 'PERCENT'
          ? `${result.value}% off applied`
          : `₹${result.value} off applied`,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json(
      { error: err.message || 'Could not apply coupon' },
      { status: 400 }
    )
  }
}
