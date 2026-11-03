import mongoose from 'mongoose'

const whatsAppOtpSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, index: true },
    codeHash: { type: String, required: true },
    purpose: { type: String, enum: ['login', 'signup'], default: 'login' },
    name: { type: String, default: '' },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
)

whatsAppOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

if (mongoose.models.WhatsAppOtp) {
  delete mongoose.models.WhatsAppOtp
}

export const WhatsAppOtp = mongoose.model('WhatsAppOtp', whatsAppOtpSchema)
