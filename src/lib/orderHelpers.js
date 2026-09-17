import { Product } from '@/lib/mongo/Product'
import { Address } from '@/lib/mongo/Address'
import { generateOrderNumber } from '@/lib/mongo/auth'
import { resolveVariantPrice } from '@/lib/productVariants'

export async function buildOrderLineItems(items) {
  const lineItems = []
  let subtotal = 0
  for (const item of items) {
    const product = await Product.findById(item.productId)
    if (!product || !product.active) {
      throw new Error(`Product not found: ${item.productId}`)
    }

    const colours = product.colours || []
    const fragrances = product.fragrances || []
    const colour = String(item.colour || '').trim()
    const fragrance = String(item.fragrance || '').trim()

    if (colours.length) {
      const ok = colours.some(
        (c) => String(c.name || c).toLowerCase() === colour.toLowerCase()
      )
      if (!colour || !ok) {
        throw new Error(`Please choose a colour for ${product.name}`)
      }
    }

    if (fragrances.length) {
      const ok = fragrances.some(
        (f) => String(f.name).toLowerCase() === fragrance.toLowerCase()
      )
      if (!fragrance || !ok) {
        throw new Error(`Please choose a fragrance for ${product.name}`)
      }
    }

    const unitPrice = resolveVariantPrice(
      {
        price: product.price,
        fragrances: fragrances.map((f) => ({
          name: f.name,
          price: f.price,
        })),
      },
      fragrance
    )

    subtotal += unitPrice * item.quantity
    lineItems.push({
      product: product._id,
      productName: product.name,
      productSlug: product.slug,
      price: unitPrice,
      quantity: item.quantity,
      image: product.image,
      colour: colour || '',
      fragrance: fragrance || '',
    })
  }
  return { lineItems, subtotal }
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
  shippingFee = 0,
  discount = 0,
  couponCode = '',
  couponType = '',
  couponValue = 0,
}) {
  return {
    orderNumber: generateOrderNumber(),
    user: userId,
    status,
    paymentMethod,
    paymentStatus,
    subtotal,
    shipping: shippingFee,
    discount,
    couponCode,
    couponType,
    couponValue,
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
