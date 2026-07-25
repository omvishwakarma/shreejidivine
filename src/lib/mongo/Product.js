import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    tagline: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    compareAt: { type: Number, default: null },
    image: { type: String, required: true },
    gallery: [{ type: String }],
    badge: { type: String, default: null },
    category: { type: String, default: 'singles' },
    stock: { type: Number, default: 0 },
    stone: { type: String, default: '' },
    description: { type: String, default: '' },
    highlights: [{ type: String }],
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
)

productSchema.methods.toPublicJSON = function () {
  return {
    id: this._id.toString(),
    slug: this.slug,
    name: this.name,
    tagline: this.tagline,
    price: this.price,
    compareAt: this.compareAt,
    image: this.image,
    gallery: this.gallery,
    badge: this.badge,
    category: this.category,
    stock: this.stock,
    stone: this.stone,
    description: this.description,
    highlights: this.highlights,
    active: this.active,
  }
}

export const Product =
  mongoose.models.Product || mongoose.model('Product', productSchema)
