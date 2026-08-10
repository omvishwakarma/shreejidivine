import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    /** null = top-level (parent) category */
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    sortOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    showInNav: { type: Boolean, default: true },
    showInHome: { type: Boolean, default: true },
  },
  { timestamps: true }
)

categorySchema.index({ parent: 1, sortOrder: 1 })

categorySchema.methods.toJSONSafe = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    slug: this.slug,
    parent: this.parent ? this.parent.toString() : null,
    description: this.description || '',
    image: this.image || '',
    sortOrder: this.sortOrder ?? 0,
    active: this.active !== false,
    showInNav: this.showInNav !== false,
    showInHome: this.showInHome !== false,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  }
}

export const Category =
  mongoose.models.Category || mongoose.model('Category', categorySchema)

export function slugifyCategory(name) {
  return String(name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
