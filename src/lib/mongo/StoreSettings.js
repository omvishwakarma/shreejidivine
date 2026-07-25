import mongoose from 'mongoose'

const DEFAULTS = {
  shippingFee: 0,
  freeShippingMinOrder: 0,
}

const storeSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: 'default' },
    /** Flat shipping charge when free-shipping threshold is not met */
    shippingFee: { type: Number, default: DEFAULTS.shippingFee, min: 0 },
    /** Subtotal at/above this amount gets free shipping. 0 = threshold disabled */
    freeShippingMinOrder: {
      type: Number,
      default: DEFAULTS.freeShippingMinOrder,
      min: 0,
    },
  },
  { timestamps: true }
)

storeSettingsSchema.methods.toJSONSafe = function () {
  return {
    shippingFee: this.shippingFee ?? DEFAULTS.shippingFee,
    freeShippingMinOrder: this.freeShippingMinOrder ?? DEFAULTS.freeShippingMinOrder,
    updatedAt: this.updatedAt,
  }
}

export const StoreSettings =
  mongoose.models.StoreSettings || mongoose.model('StoreSettings', storeSettingsSchema)

export { DEFAULTS as STORE_SETTINGS_DEFAULTS }
