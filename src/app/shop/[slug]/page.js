import { cache } from 'react'
import ProductClient from './ProductClient'
import ProductJsonLd from '../../../components/ProductJsonLd'
import { getStoreSettings } from '../../../lib/shipping'
import { dbConnect } from '../../../lib/mongo/db'
import { Product } from '../../../lib/mongo/Product'
import { SITE_NAME } from '../../../lib/site'
import { clipText } from '../../../lib/seo'
import { toTitleCase } from '../../../lib/products'

const getPublicProduct = cache(async (slug) => {
  await dbConnect()
  const doc = await Product.findOne({ slug, active: true })
  return doc ? doc.toPublicJSON() : null
})

function titleFromSlug(slug) {
  return String(slug || '')
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  try {
    const product = await getPublicProduct(slug)
    if (!product) {
      return { title: titleFromSlug(slug) || 'Product' }
    }
    const name = toTitleCase(product.name)
    const description = clipText(
      product.description ||
        product.tagline ||
        `${name} from ${SITE_NAME}. Handcrafted in India.`
    )
    const image = product.image || undefined
    return {
      title: name,
      description,
      alternates: { canonical: `/shop/${product.slug}` },
      openGraph: {
        title: name,
        description,
        url: `/shop/${product.slug}`,
        images: image ? [{ url: image, alt: name }] : undefined,
      },
    }
  } catch (err) {
    console.error(err)
    return { title: titleFromSlug(slug) || 'Product' }
  }
}

export default async function ProductPage({ params }) {
  const { slug } = await params
  let showInstagram = false
  let showRelated = false
  let product = null
  try {
    const settings = await getStoreSettings()
    showInstagram = settings.productDetailInstagramEnabled === true
    showRelated = settings.productDetailRelatedEnabled === true
    product = await getPublicProduct(slug)
  } catch (err) {
    console.error(err)
  }
  return (
    <>
      {product ? <ProductJsonLd product={product} /> : null}
      <ProductClient
        showInstagram={showInstagram}
        showRelated={showRelated}
        initialProduct={product}
      />
    </>
  )
}
