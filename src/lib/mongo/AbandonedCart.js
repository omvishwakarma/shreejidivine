import mongoose from 'mongoose'

const abandonedItemSchema = new mongoose.Schema(
  {
    productId: String,
    slug: String,
    name: String,
    price: Number,
    quantity: Number,
    colour: { type: String, default: '' },
    fragrance: { type: String, default: '' },
    image: { type: String, default: '' },
  },
  { _id: false }
)

const abandonedCartSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, index: true },
    name: { type: String, default: '', trim: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    items: { type: [abandonedItemSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    productLabel: { type: String, default: '' },
    fingerprint: { type: String, default: '' },
    lastActivityAt: { type: Date, default: Date.now, index: true },
    reminderSentAt: { type: Date, default: null },
    reminderStatus: {
      type: String,
      enum: ['pending', 'sent', 'skipped', 'failed'],
      default: 'pending',
    },
    reminderError: { type: String, default: '' },
    recoveredAt: { type: Date, default: null },
  },
  { timestamps: true }
)

abandonedCartSchema.index({ phone: 1 }, { unique: true })
abandonedCartSchema.index({ reminderSentAt: 1, lastActivityAt: 1, recoveredAt: 1 })

if (mongoose.models.AbandonedCart) {
  delete mongoose.models.AbandonedCart
}

export const AbandonedCart = mongoose.model('AbandonedCart', abandonedCartSchema)
