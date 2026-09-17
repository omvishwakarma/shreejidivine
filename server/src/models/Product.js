import mongoose from 'mongoose'

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
  return {
    id: this._id.toString(),
    slug: this.slug,
    name: this.name,
    tagline: this.tagline,
    price: this.price,
    compareAt: this.compareAt,
    image: this.image,
    gallery: this.gallery,
    video: this.video || '',
    badge: this.badge,
    category: this.category,
    stock: this.stock,
    stone: this.stone,
    description: this.description,
    highlights: this.highlights,
    colours: this.colours || [],
    fragrances: this.fragrances || [],
    active: this.active,
  }
}

if (mongoose.models.Product) {
  delete mongoose.models.Product
}

export const Product = mongoose.model('Product', productSchema)
