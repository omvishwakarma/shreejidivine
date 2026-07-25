import { Product } from '@/lib/mongo/Product'
import { Address } from '@/lib/mongo/Address'
import { generateOrderNumber } from '@/lib/mongo/auth'

export const SHIPPING_FEE = 0

export async function buildOrderLineItems(items) {
  const lineItems = []
  let subtotal = 0
  for (const item of items) {
    const product = await Product.findById(item.productId)
    if (!product || !product.active) {
      throw new Error(`Product not found: ${item.productId}`)
    }
    subtotal += product.price * item.quantity
    lineItems.push({
      product: product._id,
      productName: product.name,
      productSlug: product.slug,
      price: product.price,
      quantity: item.quantity,
      image: product.image,
    })
  }
  return { lineItems, subtotal, total: subtotal + SHIPPING_FEE }
}

export async function maybeSaveAddress(userId, shipping, saveAddress, addressLabel) {
  if (!saveAddress) return
  const count = await Address.countDocuments({ user: userId })
  await Address.create({
    user: userId,
    label: addressLabel || 'Home',
    ...shipping,
    line2: shipping.line2 || '',
    isDefault: count === 0,
  })
}

export function orderPayloadFromShipping({
  userId,
  shipping,
  notes,
  lineItems,
  subtotal,
  total,
  paymentMethod,
  paymentStatus,
  status,
}) {
  return {
    orderNumber: generateOrderNumber(),
    user: userId,
    status,
    paymentMethod,
    paymentStatus,
    subtotal,
    shipping: SHIPPING_FEE,
    total,
    shippingName: shipping.fullName,
    shippingPhone: shipping.phone,
    shippingLine1: shipping.line1,
    shippingLine2: shipping.line2 || '',
    shippingCity: shipping.city,
    shippingState: shipping.state,
    shippingPincode: shipping.pincode,
    notes: notes || '',
    items: lineItems,
  }
}
