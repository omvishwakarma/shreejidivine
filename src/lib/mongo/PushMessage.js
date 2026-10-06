import mongoose from 'mongoose'

const pushMessageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, default: '' },
    url: { type: String, default: '/' },
    targeted: { type: Number, default: 0 },
    sent: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
  },
  { timestamps: true }
)

pushMessageSchema.methods.toJSONSafe = function () {
  return {
    id: this._id.toString(),
    title: this.title,
    body: this.body,
    url: this.url,
    targeted: this.targeted,
    sent: this.sent,
    failed: this.failed,
    createdAt: this.createdAt,
  }
}

if (mongoose.models.PushMessage) {
  delete mongoose.models.PushMessage
}

export const PushMessage = mongoose.model('PushMessage', pushMessageSchema)
