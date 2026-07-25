import { NextResponse } from 'next/server'
import { z } from 'zod'
import { dbConnect, requireAdmin } from '@/lib/mongo/auth'
import { Order } from '@/lib/mongo/Order'
import { orderTotal } from '@/lib/shipping'

export async function PATCH(request, { params }) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error

  try {
    await dbConnect()
    const { id } = await params
    const schema = z.object({
      shipping: z.number().min(0),
    })
    const { shipping } = schema.parse(await request.json())

    const order = await Order.findById(id)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    order.shipping = shipping
    order.total = orderTotal({
      subtotal: order.subtotal,
      shipping,
      discount: order.discount || 0,
    })
    await order.save()
    await order.populate('user', 'name email')

    return NextResponse.json({ order: order.toJSONSafe() })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors?.[0]?.message || err.issues?.[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    console.error(err)
    return NextResponse.json({ error: 'Could not update shipping' }, { status: 500 })
  }
}
