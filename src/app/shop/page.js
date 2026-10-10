import { Suspense } from 'react'
import ShopClient from './ShopClient'
import { dbConnect } from '../../lib/mongo/db'
import { Category } from '../../lib/mongo/Category'
import { SITE_NAME } from '../../lib/site'
import { clipText } from '../../lib/seo'

const SHOP_TITLE = 'Shop Rudraksha, Bracelets & Certified Rudraksha Only'
const SHOP_DESCRIPTION =
  'Browse Rudraksha, japa malas, rashi bracelets, lava stone aroma bracelets, and certified Rudraksha only from Shreeji Divine.'

export async function generateMetadata({ searchParams }) {
  const params = await searchParams
  const category = String(params?.category || '').trim()
  const subcategory = String(params?.subcategory || '').trim()
  const slug = subcategory || category

  if (!slug) {
    return {
      title: SHOP_TITLE,
      description: SHOP_DESCRIPTION,
      alternates: { canonical: '/shop' },
      openGraph: {
        title: SHOP_TITLE,
        description: SHOP_DESCRIPTION,
        url: '/shop',
      },
    }
  }

  try {
    await dbConnect()
    const doc = await Category.findOne({ slug, active: { $ne: false } }).select('name description').lean()
    if (doc?.name) {
      const query = subcategory
        ? `/shop?category=${encodeURIComponent(category)}&subcategory=${encodeURIComponent(subcategory)}`
        : `/shop?category=${encodeURIComponent(category)}`
      return {
        title: doc.name,
        description: clipText(
          doc.description || `Shop ${doc.name} at ${SITE_NAME}. Handcrafted in India and delivered across the country.`
        ),
        alternates: { canonical: query },
        openGraph: {
          title: doc.name,
          description: clipText(
            doc.description || `Shop ${doc.name} at ${SITE_NAME}. Handcrafted in India and delivered across the country.`
          ),
          url: query,
        },
      }
    }
  } catch (err) {
    console.error(err)
  }

  return {
    title: SHOP_TITLE,
    description: SHOP_DESCRIPTION,
    alternates: { canonical: '/shop' },
    openGraph: {
      title: SHOP_TITLE,
      description: SHOP_DESCRIPTION,
      url: '/shop',
    },
  }
}

async function shopHeading(category, subcategory) {
  const slug = subcategory || category
  if (!slug) {
    return {
      title: 'All Products',
      lead: 'Rudraksha, japa malas, rashi bracelets, lava stone aroma bracelets, and certified Rudraksha only. Handcrafted in India.',
    }
  }
  try {
    await dbConnect()
    const doc = await Category.findOne({ slug, active: { $ne: false } }).select('name description').lean()
    if (doc?.name) {
      return {
        title: doc.name,
        lead: clipText(
          doc.description || `Shop ${doc.name} at ${SITE_NAME}. Handcrafted in India and delivered across the country.`,
          220
        ),
      }
    }
  } catch (err) {
    console.error(err)
  }
  return { title: 'Shop', lead: '' }
}

export default async function ShopPage({ searchParams }) {
  const params = await searchParams
  const heading = await shopHeading(
    String(params?.category || '').trim(),
    String(params?.subcategory || '').trim()
  )
  return (
    <Suspense fallback={<div className="ecom-page"><div className="ecom-wrap empty-state">Loading shop…</div></div>}>
      <ShopClient initialTitle={heading.title} initialLead={heading.lead} />
    </Suspense>
  )
}
