import { dbConnect } from '../../../lib/mongo/db'
import { Product } from '../../../lib/mongo/Product'
import {
  productImageSrc,
  productShareJpeg,
  SHARE_IMAGE_SIZE,
} from '../../../lib/productShareImage'

export const runtime = 'nodejs'
export const alt = 'Shreeji Divine product'
export const size = SHARE_IMAGE_SIZE
export const contentType = 'image/jpeg'
export const revalidate = 86400

export default async function Image({ params }) {
  const { slug } = await params
  await dbConnect()
  const doc = await Product.findOne({ slug, active: true }).select('image name').lean()
  const jpeg = await productShareJpeg(productImageSrc(doc))
  if (!jpeg) {
    return new Response(null, { status: 404 })
  }
  return new Response(jpeg, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  })
}
