import ProductClient from './ProductClient'

export async function generateMetadata({ params }) {
  const { slug } = await params
  return {
    title: slug
      ?.split('-')
      .map((w) => w[0]?.toUpperCase() + w.slice(1))
      .join(' '),
  }
}

export default function ProductPage() {
  return <ProductClient />
}
