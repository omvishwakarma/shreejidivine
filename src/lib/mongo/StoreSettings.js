import mongoose from 'mongoose'
import {
  DEFAULT_INSTAGRAM_SHOP_LOOKS,
  normalizeInstagramShopLooks,
} from '@/lib/instagramShop'
import {
  DEFAULT_TESTIMONIALS,
  normalizeTestimonials,
} from '@/lib/testimonials'
import {
  INSTAGRAM_STRIP_DEFAULTS,
  normalizeInstagramStripPosts,
} from '@/lib/instagramStrip'

const DEFAULTS = {
  shippingFee: 0,
  freeShippingMinOrder: 0,
  heroVideoDesktop: '/videos/home.mp4',
  heroVideoMobile: '/videos/home.mp4',
  heroPoster: '/images/banners/royal-chandan.png',
  heroPosterMobile: '',
  heroHeadline: '',
  heroCtaText: 'Shop Now',
  heroCtaHref: '/shop',
  homeCategoryLabel: 'Shop by Category',
  homeCategoryTitle: 'For Every Ritual',
  homeCategoryLead:
    'Explore Divine and Lifestyle collections — fragrance for prayer, home, and gifting.',
  homeBestLabel: 'Customer favourites',
  homeBestTitle: 'Best Sellers',
  homeBestLead: 'Most-loved aroma stones and oils — ready for home rituals and gifting.',
  homeReviewsTitle: 'Testimonials',
  homeReviewsLead: 'Loved in homes across India',
  menuIconHome: '',
  menuIconShop: '',
  menuIconBracelet: '',
  menuIconBest: '',
  menuIconAbout: '',
  instagramShopEnabled: true,
  instagramShopEyebrow:
    'Smoke-Free · Handmade in India · Gift Ready · A Fragrance of Divinity',
  instagramShopTitle: 'Pure for Your Home.',
  instagramShopSubtitle: 'Shop the look on Instagram',
  instagramShopLooks: DEFAULT_INSTAGRAM_SHOP_LOOKS,
  instagramStripLabel: INSTAGRAM_STRIP_DEFAULTS.label,
  instagramStripHandle: INSTAGRAM_STRIP_DEFAULTS.handle,
  instagramStripUrl: INSTAGRAM_STRIP_DEFAULTS.url,
  instagramStripCta: INSTAGRAM_STRIP_DEFAULTS.cta,
  instagramStripPosts: [],
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

const instagramStripPostSchema = new mongoose.Schema(
  {
    id: { type: String, default: '' },
    image: { type: String, default: '' },
    video: { type: String, default: '' },
    permalink: { type: String, default: '' },
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
    heroPosterMobile: { type: String, default: DEFAULTS.heroPosterMobile },
    heroHeadline: { type: String, default: DEFAULTS.heroHeadline },
    heroCtaText: { type: String, default: DEFAULTS.heroCtaText },
    heroCtaHref: { type: String, default: DEFAULTS.heroCtaHref },
    homeCategoryLabel: { type: String, default: DEFAULTS.homeCategoryLabel },
    homeCategoryTitle: { type: String, default: DEFAULTS.homeCategoryTitle },
    homeCategoryLead: { type: String, default: DEFAULTS.homeCategoryLead },
    homeBestLabel: { type: String, default: DEFAULTS.homeBestLabel },
    homeBestTitle: { type: String, default: DEFAULTS.homeBestTitle },
    homeBestLead: { type: String, default: DEFAULTS.homeBestLead },
    homeReviewsTitle: { type: String, default: DEFAULTS.homeReviewsTitle },
    homeReviewsLead: { type: String, default: DEFAULTS.homeReviewsLead },
    menuIconHome: { type: String, default: '' },
    menuIconShop: { type: String, default: '' },
    menuIconBracelet: { type: String, default: '' },
    menuIconBest: { type: String, default: '' },
    menuIconAbout: { type: String, default: '' },
    instagramShopEnabled: { type: Boolean, default: DEFAULTS.instagramShopEnabled },
    instagramShopEyebrow: { type: String, default: DEFAULTS.instagramShopEyebrow },
    instagramShopTitle: { type: String, default: DEFAULTS.instagramShopTitle },
    instagramShopSubtitle: { type: String, default: DEFAULTS.instagramShopSubtitle },
    instagramShopLooks: {
      type: [instagramShopLookSchema],
      default: () => DEFAULT_INSTAGRAM_SHOP_LOOKS.map((l) => ({ ...l })),
    },
    instagramStripLabel: { type: String, default: DEFAULTS.instagramStripLabel },
    instagramStripHandle: { type: String, default: DEFAULTS.instagramStripHandle },
    instagramStripUrl: { type: String, default: DEFAULTS.instagramStripUrl },
    instagramStripCta: { type: String, default: DEFAULTS.instagramStripCta },
    instagramStripPosts: { type: [instagramStripPostSchema], default: [] },
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
    heroPosterMobile: this.heroPosterMobile || '',
    heroHeadline: this.heroHeadline ?? DEFAULTS.heroHeadline,
    heroCtaText: this.heroCtaText || DEFAULTS.heroCtaText,
    heroCtaHref: this.heroCtaHref || DEFAULTS.heroCtaHref,
    homeCategoryLabel: this.homeCategoryLabel || DEFAULTS.homeCategoryLabel,
    homeCategoryTitle: this.homeCategoryTitle || DEFAULTS.homeCategoryTitle,
    homeCategoryLead: this.homeCategoryLead || DEFAULTS.homeCategoryLead,
    homeBestLabel: this.homeBestLabel || DEFAULTS.homeBestLabel,
    homeBestTitle: this.homeBestTitle || DEFAULTS.homeBestTitle,
    homeBestLead: this.homeBestLead || DEFAULTS.homeBestLead,
    homeReviewsTitle: this.homeReviewsTitle || DEFAULTS.homeReviewsTitle,
    homeReviewsLead: this.homeReviewsLead || DEFAULTS.homeReviewsLead,
    menuIconHome: this.menuIconHome || '',
    menuIconShop: this.menuIconShop || '',
    menuIconBracelet: this.menuIconBracelet || '',
    menuIconBest: this.menuIconBest || '',
    menuIconAbout: this.menuIconAbout || '',
    instagramShopEnabled: this.instagramShopEnabled !== false,
    instagramShopEyebrow:
      this.instagramShopEyebrow == null ? DEFAULTS.instagramShopEyebrow : this.instagramShopEyebrow,
    instagramShopTitle:
      this.instagramShopTitle == null ? DEFAULTS.instagramShopTitle : this.instagramShopTitle,
    instagramShopSubtitle:
      this.instagramShopSubtitle == null
        ? DEFAULTS.instagramShopSubtitle
        : this.instagramShopSubtitle,
    instagramShopLooks: looks,
    instagramStripLabel: this.instagramStripLabel || DEFAULTS.instagramStripLabel,
    instagramStripHandle: this.instagramStripHandle || DEFAULTS.instagramStripHandle,
    instagramStripUrl: this.instagramStripUrl || DEFAULTS.instagramStripUrl,
    instagramStripCta: this.instagramStripCta || DEFAULTS.instagramStripCta,
    instagramStripPosts: normalizeInstagramStripPosts(this.instagramStripPosts),
    testimonialsEnabled: this.testimonialsEnabled !== false,
    testimonials,
    updatedAt: this.updatedAt,
  }
}

if (mongoose.models.StoreSettings) {
  delete mongoose.models.StoreSettings
}

export const StoreSettings = mongoose.model('StoreSettings', storeSettingsSchema)

export { DEFAULTS as STORE_SETTINGS_DEFAULTS }
