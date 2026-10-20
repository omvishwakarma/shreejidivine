import { cache } from 'react'
import { notFound } from 'next/navigation'
import ProductClient from './ProductClient'
import ProductJsonLd from '../../../components/ProductJsonLd'
import { getStoreSettings } from '../../../lib/shipping'
import { dbConnect } from '../../../lib/mongo/db'
import { Product } from '../../../lib/mongo/Product'
import { SITE_NAME, SITE_URL } from '../../../lib/site'
import { clipText } from '../../../lib/seo'
import { toTitleCase } from '../../../lib/products'

export const revalidate = 120

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
    const image = productImageUrl(product) || undefined
    const offer = productOffer(product)
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
      other: {
        'product:price:amount': offer.price,
        'product:price:currency': 'INR',
        ...(offer.sale
          ? {
              'product:sale_price:amount': offer.sale,
              'product:sale_price:currency': 'INR',
            }
          : {}),
        'product:availability': offer.availability,
        'product:condition': 'new',
        'product:brand': SITE_NAME,
        'product:retailer_item_id': String(product.id || product.slug),
      },
    }
  } catch (err) {
    console.error(err)
    return { title: titleFromSlug(slug) || 'Product' }
  }
}

function productImageUrl(product) {
  const src = String(product?.image || '').trim()
  if (!src) return ''
  if (/^https?:\/\//i.test(src)) return src
  return `${SITE_URL}${src.startsWith('/') ? '' : '/'}${src}`
}

function productOffer(product) {
  const current = Number(product?.price) || 0
  const compare = Number(product?.compareAt) || 0
  const onSale = compare > current && current > 0
  return {
    price: (onSale ? compare : current).toFixed(2),
    sale: onSale ? current.toFixed(2) : '',
    availability: Number(product?.stock) > 0 ? 'in stock' : 'out of stock',
  }
}

function ProductMeta({ product }) {
  const name = toTitleCase(product.name)
  const offer = productOffer(product)
  const image = productImageUrl(product)
  const url = `${SITE_URL}/shop/${product.slug}`
  return (
    <>
      <meta property="og:type" content="product" />
      <meta property="og:title" content={name} />
      <meta property="og:url" content={url} />
      {image ? <meta property="og:image" content={image} /> : null}
      <meta property="product:price:amount" content={offer.price} />
      <meta property="product:price:currency" content="INR" />
      {offer.sale ? (
        <>
          <meta property="product:sale_price:amount" content={offer.sale} />
          <meta property="product:sale_price:currency" content="INR" />
        </>
      ) : null}
      <meta property="product:availability" content={offer.availability} />
      <meta property="product:condition" content="new" />
      <meta property="product:brand" content={SITE_NAME} />
      <meta property="product:retailer_item_id" content={String(product.id || product.slug)} />
    </>
  )
}

export default async function ProductPage({ params }) {
  const { slug } = await params
  let showInstagram = false
  let showRelated = false
  let product = null
  let missing = false
  try {
    const settings = await getStoreSettings()
    showInstagram = settings.productDetailInstagramEnabled === true
    showRelated = settings.productDetailRelatedEnabled === true
    product = await getPublicProduct(slug)
    missing = !product
  } catch (err) {
    console.error(err)
  }
  if (missing) notFound()
  return (
    <>
      {product ? <ProductMeta product={product} /> : null}
      {product ? <ProductJsonLd product={product} /> : null}
      <ProductClient
        showInstagram={showInstagram}
        showRelated={showRelated}
        initialProduct={product}
      />
    </>
  )
}
