import { Order } from '@/lib/mongo/Order'

export function magicCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'no-store',
  }
}

export function normalizeRazorpayOrderId(raw) {
  const id = String(raw || '').trim()
  if (!id) return ''
  return id.startsWith('order_') ? id : `order_${id}`
}

export async function findMagicOrder({ orderId, razorpayOrderId }) {
  const receipt = String(orderId || '').trim()
  const rzpId = normalizeRazorpayOrderId(razorpayOrderId)
  const filter = []
  if (rzpId) filter.push({ razorpayOrderId: rzpId })
  if (receipt) filter.push({ orderNumber: receipt })
  if (!filter.length) return null
  return Order.findOne(filter.length === 1 ? filter[0] : { $or: filter })
}

export function magicFailure(code, reason, status = 200) {
  return {
    body: {
      failure_code: code,
      failure_reason: reason,
    },
    status,
  }
}
