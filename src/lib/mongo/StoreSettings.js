import mongoose from 'mongoose'

const DEFAULTS = {
  shippingFee: 0,
  freeShippingMinOrder: 0,
  heroVideoDesktop: '/videos/home.mp4',
  heroVideoMobile: '/videos/home.mp4',
  heroPoster: '/images/banners/royal-chandan.png',
  heroHeadline: '',
  heroCtaText: 'Shop Now',
  heroCtaHref: '/shop',
}

const storeSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: 'default' },
    /** Flat shipping charge when free-shipping threshold is not met */
    shippingFee: { type: Number, default: DEFAULTS.shippingFee, min: 0 },
    /** Subtotal at/above this amount gets free shipping. 0 = threshold disabled */
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
  },
  { timestamps: true }
)

storeSettingsSchema.methods.toJSONSafe = function () {
  return {
    shippingFee: this.shippingFee ?? DEFAULTS.shippingFee,
    freeShippingMinOrder: this.freeShippingMinOrder ?? DEFAULTS.freeShippingMinOrder,
    heroVideoDesktop: this.heroVideoDesktop || DEFAULTS.heroVideoDesktop,
    heroVideoMobile: this.heroVideoMobile || DEFAULTS.heroVideoMobile,
    heroPoster: this.heroPoster || DEFAULTS.heroPoster,
    heroHeadline: this.heroHeadline ?? DEFAULTS.heroHeadline,
    heroCtaText: this.heroCtaText || DEFAULTS.heroCtaText,
    heroCtaHref: this.heroCtaHref || DEFAULTS.heroCtaHref,
    updatedAt: this.updatedAt,
  }
}

export const StoreSettings =
  mongoose.models.StoreSettings || mongoose.model('StoreSettings', storeSettingsSchema)

export { DEFAULTS as STORE_SETTINGS_DEFAULTS }
