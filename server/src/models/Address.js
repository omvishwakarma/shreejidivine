import mongoose from 'mongoose'

const addressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    label: { type: String, default: 'Home' },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
)

addressSchema.methods.toJSONSafe = function () {
  return {
    id: this._id.toString(),
    label: this.label,
    fullName: this.fullName,
    phone: this.phone,
    line1: this.line1,
    line2: this.line2,
    city: this.city,
    state: this.state,
    pincode: this.pincode,
    isDefault: this.isDefault,
  }
}

export const Address = mongoose.model('Address', addressSchema)
