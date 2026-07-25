import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: String,
  productSlug: String,
  price: Number,
  quantity: Number,
  image: String,
})

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
      default: 'CONFIRMED',
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'RAZORPAY'],
      default: 'COD',
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED'],
      default: 'PENDING',
    },
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    razorpaySignature: { type: String, default: '' },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    couponCode: { type: String, default: '' },
    couponType: { type: String, default: '' },
    couponValue: { type: Number, default: 0 },
    total: { type: Number, required: true },
    shippingName: String,
    shippingPhone: String,
    shippingLine1: String,
    shippingLine2: String,
    shippingCity: String,
    shippingState: String,
    shippingPincode: String,
    notes: String,
    items: [orderItemSchema],
  },
  { timestamps: true }
)

orderSchema.methods.toJSONSafe = function () {
  return {
    id: this._id.toString(),
    orderNumber: this.orderNumber,
    status: this.status,
    paymentMethod: this.paymentMethod,
    paymentStatus: this.paymentStatus,
    razorpayOrderId: this.razorpayOrderId || '',
    razorpayPaymentId: this.razorpayPaymentId || '',
    subtotal: this.subtotal,
    shipping: this.shipping,
    discount: this.discount || 0,
    couponCode: this.couponCode || '',
    couponType: this.couponType || '',
    couponValue: this.couponValue || 0,
    total: this.total,
    shippingName: this.shippingName,
    shippingPhone: this.shippingPhone,
    shippingLine1: this.shippingLine1,
    shippingLine2: this.shippingLine2,
    shippingCity: this.shippingCity,
    shippingState: this.shippingState,
    shippingPincode: this.shippingPincode,
    notes: this.notes,
    items: this.items.map((i) => ({
      id: i._id?.toString(),
      productId: i.product?.toString(),
      productName: i.productName,
      productSlug: i.productSlug,
      price: i.price,
      quantity: i.quantity,
      image: i.image,
    })),
    user: this.user?.name
      ? { id: this.user._id?.toString(), name: this.user.name, email: this.user.email }
      : this.user?.toString?.() || this.user,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  }
}

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema)
