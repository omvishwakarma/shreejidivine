import mongoose from 'mongoose'
import { safePublicImage, safePublicMedia } from '@/lib/media'
import { normalizeColours, normalizeFragrances } from '@/lib/productVariants'

const colourOptionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    hex: { type: String, default: '' },
    image: { type: String, default: '' },
  },
  { _id: false }
)

const fragranceOptionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: '' },
  },
  { _id: false }
)

const productSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    tagline: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    compareAt: { type: Number, default: null },
    image: { type: String, required: true },
    gallery: [{ type: String }],
    video: { type: String, default: '' },
    badge: { type: String, default: null },
    category: { type: String, default: 'singles' },
    categorySlug: { type: String, default: '', index: true },
    subcategorySlug: { type: String, default: '', index: true },
    stock: { type: Number, default: 0 },
    stone: { type: String, default: '' },
    description: { type: String, default: '' },
    highlights: [{ type: String }],
    colours: { type: [colourOptionSchema], default: [] },
    fragrances: { type: [fragranceOptionSchema], default: [] },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
)

productSchema.methods.toPublicJSON = function () {
  const image = safePublicImage(this.image, '/images/aroma-variants.png')
  const gallery = (this.gallery || [])
    .map((g) => safePublicImage(g, ''))
    .filter(Boolean)
  const uniqueGallery = [...new Set([image, ...gallery].filter(Boolean))]

  return {
    id: this._id.toString(),
    slug: this.slug,
    name: this.name,
    tagline: this.tagline,
    price: this.price,
    compareAt: this.compareAt,
    image,
    gallery: uniqueGallery,
    video: safePublicMedia(this.video, ''),
    badge: this.badge,
    category: this.category,
    categorySlug: this.categorySlug || '',
    subcategorySlug: this.subcategorySlug || '',
    stock: this.stock,
    stone: this.stone,
    description: this.description,
    highlights: this.highlights,
    colours: normalizeColours(this.colours),
    fragrances: normalizeFragrances(this.fragrances),
    active: this.active,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  }
}

// Recompile when schema changes (avoids stale model without colours/fragrances)
if (mongoose.models.Product) {
  delete mongoose.models.Product
}

export const Product = mongoose.model('Product', productSchema)
