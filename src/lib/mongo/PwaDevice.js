import mongoose from 'mongoose'

const pwaDeviceSchema = new mongoose.Schema(
  {
    clientId: { type: String, required: true, unique: true, index: true },
    installed: { type: Boolean, default: false },
    standalone: { type: Boolean, default: false },
    pushEndpoint: { type: String, default: '' },
    pushP256dh: { type: String, default: '' },
    pushAuth: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    installedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

if (mongoose.models.PwaDevice) {
  delete mongoose.models.PwaDevice
}

export const PwaDevice = mongoose.model('PwaDevice', pwaDeviceSchema)
