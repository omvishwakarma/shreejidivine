import { NextResponse } from 'next/server'
import { dbConnect, requireAdmin } from '@/lib/mongo/auth'
import { Order } from '@/lib/mongo/Order'
import {
  createDelhiveryShipment,
  delhiveryLabelUrl,
  trackDelhiveryShipment,
} from '@/lib/delhivery'

export async function POST(request, { params }) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error

  try {
    await dbConnect()
    const { id } = await params
    const order = await Order.findById(id)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    if (order.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Cancelled orders cannot be shipped' }, { status: 400 })
    }
    if (order.paymentMethod === 'RAZORPAY' && order.paymentStatus !== 'PAID') {
      return NextResponse.json(
        { error: 'Online payment is not complete yet' },
        { status: 400 }
      )
    }
    if (order.delhiveryWaybill) {
      return NextResponse.json(
        { error: `Shipment already created. AWB ${order.delhiveryWaybill}` },
        { status: 409 }
      )
    }

    const created = await createDelhiveryShipment(order)
    order.delhiveryWaybill = created.waybill
    order.delhiveryStatus = created.status
    order.delhiverySortCode = created.sortCode
    if (order.status === 'PENDING' || order.status === 'CONFIRMED') {
      order.status = 'SHIPPED'
    }
    await order.save()
    await order.populate('user', 'name email')

    return NextResponse.json({ order: order.toJSONSafe(), shipment: created })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: err.message || 'Could not create Delhivery shipment' },
      { status: 500 }
    )
  }
}

export async function GET(request, { params }) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error

  try {
    await dbConnect()
    const { id } = await params
    const order = await Order.findById(id)
    if (!order?.delhiveryWaybill) {
      return NextResponse.json({ error: 'No Delhivery shipment on this order' }, { status: 404 })
    }

    const label = new URL(request.url).searchParams.get('label') === '1'
    if (label) {
      const url = await delhiveryLabelUrl(order.delhiveryWaybill)
      return NextResponse.json({ url })
    }

    const tracking = await trackDelhiveryShipment(order.delhiveryWaybill)
    if (tracking.status) {
      order.delhiveryStatus = tracking.status
      await order.save()
    }
    await order.populate('user', 'name email')
    return NextResponse.json({ order: order.toJSONSafe(), tracking })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: err.message || 'Could not load Delhivery shipment' },
      { status: 500 }
    )
  }
}
