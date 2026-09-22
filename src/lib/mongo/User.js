import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: '' },
    googleId: { type: String, unique: true, sparse: true },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    phone: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
)

userSchema.methods.comparePassword = function (password) {
  if (!this.passwordHash) return Promise.resolve(false)
  return bcrypt.compare(password, this.passwordHash)
}

userSchema.statics.hashPassword = function (password) {
  return bcrypt.hash(password, 10)
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

export const User = mongoose.models.User || mongoose.model('User', userSchema)
