import { NextResponse } from 'next/server'
import { z } from 'zod'
import { dbConnect, requireAdmin } from '@/lib/mongo/auth'
import { Coupon } from '@/lib/mongo/Coupon'
import { normalizeCouponCode } from '@/lib/coupons'

export async function PATCH(request, { params }) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error

  try {
    await dbConnect()
    const { id } = await params
    const schema = z.object({
      code: z.string().min(2).max(32).optional(),
      type: z.enum(['PERCENT', 'FIXED']).optional(),
      value: z.number().positive().optional(),
      maxUses: z.number().int().min(0).optional(),
      expiresAt: z.string().nullable().optional(),
      minOrderAmount: z.number().min(0).optional(),
      active: z.boolean().optional(),
      description: z.string().optional(),
    })
    const data = schema.parse(await request.json())

    if (data.type === 'PERCENT' && data.value != null && data.value > 100) {
      return NextResponse.json(
        { error: 'Percentage cannot exceed 100' },
        { status: 400 }
      )
    }

    const update = { ...data }
    if (data.code) update.code = normalizeCouponCode(data.code)
    if (data.expiresAt !== undefined) {
      update.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null
    }

    if (update.code) {
      const clash = await Coupon.findOne({ code: update.code, _id: { $ne: id } })
      if (clash) {
        return NextResponse.json({ error: 'Coupon code already exists' }, { status: 409 })
      }
    }

    const coupon = await Coupon.findByIdAndUpdate(id, update, { new: true })
    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }
    return NextResponse.json({ coupon: coupon.toJSONSafe() })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Could not update coupon' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error
  await dbConnect()
  const { id } = await params
  const coupon = await Coupon.findByIdAndDelete(id)
  if (!coupon) {
    return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
