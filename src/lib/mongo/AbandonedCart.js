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
    /** Set only when cart contents change — used for abandoned delay. */
    idleStartedAt: { type: Date, default: Date.now, index: true },
    reminderSentAt: { type: Date, default: null },
    reminderStatus: {
      type: String,
      enum: ['pending', 'sent', 'skipped', 'failed'],
      default: 'pending',
    },
    reminderError: { type: String, default: '' },
    /** Follow-up (sd_abandoned_cart_2), ~6h after first reminder. */
    reminder2SentAt: { type: Date, default: null },
    reminder2Status: {
      type: String,
      enum: ['pending', 'sent', 'skipped', 'failed'],
      default: 'pending',
    },
    reminder2Error: { type: String, default: '' },
    /** Follow-up (sd_abandoned_cart_3), ~24h after second reminder. */
    reminder3SentAt: { type: Date, default: null },
    reminder3Status: {
      type: String,
      enum: ['pending', 'sent', 'skipped', 'failed'],
      default: 'pending',
    },
    reminder3Error: { type: String, default: '' },
    recoveredAt: { type: Date, default: null },
  },
  { timestamps: true }
)

abandonedCartSchema.index({ phone: 1 }, { unique: true })
abandonedCartSchema.index({ reminderSentAt: 1, lastActivityAt: 1, recoveredAt: 1 })
abandonedCartSchema.index({ reminder2SentAt: 1, reminderSentAt: 1, recoveredAt: 1 })
abandonedCartSchema.index({ reminder3SentAt: 1, reminder2SentAt: 1, recoveredAt: 1 })

if (mongoose.models.AbandonedCart) {
  delete mongoose.models.AbandonedCart
}

export const AbandonedCart = mongoose.model('AbandonedCart', abandonedCartSchema)
