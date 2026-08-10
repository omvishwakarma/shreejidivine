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
    /** Legacy free-string (kits/singles) — kept for older products */
    category: { type: String, default: 'singles' },
    /** Parent category slug (e.g. divine, lifestyle) */
    categorySlug: { type: String, default: '', index: true },
    /** Child category slug (e.g. fragrance-oils) */
    subcategorySlug: { type: String, default: '', index: true },
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
    categorySlug: this.categorySlug || '',
    subcategorySlug: this.subcategorySlug || '',
    stock: this.stock,
    stone: this.stone,
    description: this.description,
    highlights: this.highlights,
    active: this.active,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  }
}

export const Product =
  mongoose.models.Product || mongoose.model('Product', productSchema)
