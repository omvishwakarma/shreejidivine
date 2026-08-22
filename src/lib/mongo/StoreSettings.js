import mongoose from 'mongoose'
import {
  DEFAULT_INSTAGRAM_SHOP_LOOKS,
  normalizeInstagramShopLooks,
} from '@/lib/instagramShop'
import {
  DEFAULT_TESTIMONIALS,
  normalizeTestimonials,
} from '@/lib/testimonials'

const DEFAULTS = {
  shippingFee: 0,
  freeShippingMinOrder: 0,
  heroVideoDesktop: '/videos/home.mp4',
  heroVideoMobile: '/videos/home.mp4',
  heroPoster: '/images/banners/royal-chandan.png',
  heroHeadline: '',
  heroCtaText: 'Shop Now',
  heroCtaHref: '/shop',
  instagramShopEnabled: true,
  instagramShopLooks: DEFAULT_INSTAGRAM_SHOP_LOOKS,
  testimonialsEnabled: true,
  testimonials: DEFAULT_TESTIMONIALS,
}

const instagramShopLookSchema = new mongoose.Schema(
  {
    id: { type: String, default: '' },
    permalink: { type: String, required: true },
    productSlug: { type: String, default: '' },
    badge: { type: String, default: 'NEW' },
    videoUrl: { type: String, default: '' },
    poster: { type: String, default: '' },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: false }
)

const testimonialSchema = new mongoose.Schema(
  {
    id: { type: String, default: '' },
    title: { type: String, default: '' },
    quote: { type: String, required: true },
    name: { type: String, required: true },
    handle: { type: String, default: '' },
    photo: { type: String, default: '' },
    instagram: { type: String, default: '' },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: false }
)

const storeSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: 'default' },
    shippingFee: { type: Number, default: DEFAULTS.shippingFee, min: 0 },
    freeShippingMinOrder: {
      type: Number,
      default: DEFAULTS.freeShippingMinOrder,
      min: 0,
    },
    heroVideoDesktop: { type: String, default: DEFAULTS.heroVideoDesktop },
    heroVideoMobile: { type: String, default: DEFAULTS.heroVideoMobile },
    heroPoster: { type: String, default: DEFAULTS.heroPoster },
    heroHeadline: { type: String, default: DEFAULTS.heroHeadline },
    heroCtaText: { type: String, default: DEFAULTS.heroCtaText },
    heroCtaHref: { type: String, default: DEFAULTS.heroCtaHref },
    instagramShopEnabled: { type: Boolean, default: DEFAULTS.instagramShopEnabled },
    instagramShopLooks: {
      type: [instagramShopLookSchema],
      default: () => DEFAULT_INSTAGRAM_SHOP_LOOKS.map((l) => ({ ...l })),
    },
    testimonialsEnabled: { type: Boolean, default: DEFAULTS.testimonialsEnabled },
    testimonials: {
      type: [testimonialSchema],
      default: () => DEFAULT_TESTIMONIALS.map((t) => ({ ...t })),
    },
  },
  { timestamps: true }
)

storeSettingsSchema.methods.toJSONSafe = function () {
  const looksRaw = Array.isArray(this.instagramShopLooks) ? this.instagramShopLooks : []
  const looks = looksRaw.length
    ? normalizeInstagramShopLooks(looksRaw)
    : normalizeInstagramShopLooks(DEFAULT_INSTAGRAM_SHOP_LOOKS)

  const reviewsRaw = Array.isArray(this.testimonials) ? this.testimonials : []
  const testimonials = reviewsRaw.length
    ? normalizeTestimonials(reviewsRaw)
    : normalizeTestimonials(DEFAULT_TESTIMONIALS)

  return {
    shippingFee: this.shippingFee ?? DEFAULTS.shippingFee,
    freeShippingMinOrder: this.freeShippingMinOrder ?? DEFAULTS.freeShippingMinOrder,
    heroVideoDesktop: this.heroVideoDesktop || DEFAULTS.heroVideoDesktop,
    heroVideoMobile: this.heroVideoMobile || DEFAULTS.heroVideoMobile,
    heroPoster: this.heroPoster || DEFAULTS.heroPoster,
    heroHeadline: this.heroHeadline ?? DEFAULTS.heroHeadline,
    heroCtaText: this.heroCtaText || DEFAULTS.heroCtaText,
    heroCtaHref: this.heroCtaHref || DEFAULTS.heroCtaHref,
    instagramShopEnabled: this.instagramShopEnabled !== false,
    instagramShopLooks: looks,
    testimonialsEnabled: this.testimonialsEnabled !== false,
    testimonials,
    updatedAt: this.updatedAt,
  }
}

export const StoreSettings =
  mongoose.models.StoreSettings || mongoose.model('StoreSettings', storeSettingsSchema)

export { DEFAULTS as STORE_SETTINGS_DEFAULTS }
