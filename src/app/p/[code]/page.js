import { permanentRedirect, notFound } from 'next/navigation'
import { dbConnect } from '../../../lib/mongo/db'
import { Product } from '../../../lib/mongo/Product'
import { productPath } from '../../../lib/productLink'

export const revalidate = 3600

async function resolveSlug(code) {
  const value = String(code || '').trim()
  if (!value) return null
  await dbConnect()

  const bySlug = await Product.findOne({ slug: value, active: true }).select('slug').lean()
  if (bySlug?.slug) return bySlug.slug

  if (/^[a-f0-9]{24}$/i.test(value)) {
    const byId = await Product.findOne({ _id: value, active: true }).select('slug').lean()
    if (byId?.slug) return byId.slug
  }

  if (/^[a-f0-9]{6,23}$/i.test(value)) {
    const docs = await Product.find({ active: true }).select('slug').lean()
    const match = docs.find((doc) => String(doc._id).toLowerCase().endsWith(value.toLowerCase()))
    if (match?.slug) return match.slug
  }

  return null
}

export default async function ShortProductPage({ params }) {
  const { code } = await params
  const slug = await resolveSlug(code)
  if (!slug) notFound()
  permanentRedirect(productPath(slug))
}
