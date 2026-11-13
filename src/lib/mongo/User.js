import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: '' },
    googleId: { type: String, unique: true, sparse: true },
    authProvider: {
      type: String,
      enum: ['local', 'google', 'whatsapp'],
      default: 'local',
    },
    phone: { type: String, default: '' },
    // Omit when empty — sparse unique index treats "" as a real value and breaks Google signup.
    phoneKey: { type: String, unique: true, sparse: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    resetPasswordTokenHash: { type: String, default: '' },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true }
)

userSchema.pre('validate', function clearEmptyPhoneKey(next) {
  if (!this.phoneKey) {
    this.phoneKey = undefined
    this.set('phoneKey', undefined)
  }
  next()
})

userSchema.pre('save', function clearEmptyPhoneKey(next) {
  if (!this.phoneKey) {
    this.phoneKey = undefined
    this.set('phoneKey', undefined)
  }
  next()
})

userSchema.methods.comparePassword = function (password) {
  if (!this.passwordHash) return Promise.resolve(false)
  return bcrypt.compare(password, this.passwordHash)
}

userSchema.statics.hashPassword = function (password) {
  return bcrypt.hash(password, 10)
}

/** One-time cleanup for docs that stored phoneKey as "". */
userSchema.statics.unsetEmptyPhoneKeys = async function unsetEmptyPhoneKeys() {
  const result = await this.updateMany(
    { $or: [{ phoneKey: '' }, { phoneKey: null }] },
    { $unset: { phoneKey: 1 } }
  )
  return result
}

userSchema.methods.toSafeJSON = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    phone: this.phone,
    role: this.role,
    createdAt: this.createdAt,
  }
}

if (mongoose.models.User) {
  delete mongoose.models.User
}

export const User = mongoose.model('User', userSchema)
