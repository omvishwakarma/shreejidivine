import mongoose from 'mongoose'

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['PERCENT', 'FIXED'],
      required: true,
    },
    value: { type: Number, required: true, min: 0 },
    /** 0 = unlimited */
    maxUses: { type: Number, default: 0, min: 0 },
    usedCount: { type: Number, default: 0, min: 0 },
    expiresAt: { type: Date, default: null },
    minOrderAmount: { type: Number, default: 0, min: 0 },
    active: { type: Boolean, default: true },
    description: { type: String, default: '' },
  },
  { timestamps: true }
)

couponSchema.methods.toJSONSafe = function () {
  return {
    id: this._id.toString(),
    code: this.code,
    type: this.type,
    value: this.value,
    maxUses: this.maxUses,
    usedCount: this.usedCount,
    expiresAt: this.expiresAt,
    minOrderAmount: this.minOrderAmount,
    active: this.active,
    description: this.description,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  }
}

export const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema)
