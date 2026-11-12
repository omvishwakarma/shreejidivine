import mongoose from 'mongoose'

const freeGiftClaimSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true, index: true },
    giftUrl: { type: String, default: '' },
    giftSlug: { type: String, default: '' },
    whatsappStatus: {
      type: String,
      enum: ['sent', 'skipped', 'failed'],
      default: 'skipped',
    },
    whatsappError: { type: String, default: '' },
  },
  { timestamps: true }
)

freeGiftClaimSchema.index({ phone: 1, createdAt: -1 })

if (mongoose.models.FreeGiftClaim) {
  delete mongoose.models.FreeGiftClaim
}

export const FreeGiftClaim = mongoose.model('FreeGiftClaim', freeGiftClaimSchema)
