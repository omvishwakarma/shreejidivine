import ProductClient from './ProductClient'
import { getStoreSettings } from '../../../lib/shipping'

export async function generateMetadata({ params }) {
  const { slug } = await params
  return {
    title: slug
      ?.split('-')
      .map((w) => w[0]?.toUpperCase() + w.slice(1))
      .join(' '),
  }
}

export default async function ProductPage() {
  let showInstagram = false
  let showRelated = false
  try {
    const settings = await getStoreSettings()
    showInstagram = settings.productDetailInstagramEnabled === true
    showRelated = settings.productDetailRelatedEnabled === true
  } catch (err) {
    console.error(err)
  }
  return <ProductClient showInstagram={showInstagram} showRelated={showRelated} />
}
