import { NextResponse } from 'next/server'
import { getStoreSettings } from '@/lib/shipping'
import { STORE_SETTINGS_DEFAULTS as D } from '@/lib/mongo/StoreSettings'

function copyFrom(settings) {
  return {
    category: {
      label: settings.homeCategoryLabel || D.homeCategoryLabel,
      title: settings.homeCategoryTitle || D.homeCategoryTitle,
      lead: settings.homeCategoryLead || D.homeCategoryLead,
    },
    bestSellers: {
      label: settings.homeBestLabel || D.homeBestLabel,
      title: settings.homeBestTitle || D.homeBestTitle,
      lead: settings.homeBestLead || D.homeBestLead,
    },
    testimonials: {
      title: settings.homeReviewsTitle || D.homeReviewsTitle,
      lead: settings.homeReviewsLead || D.homeReviewsLead,
    },
  }
}

export async function GET() {
  try {
    const settings = await getStoreSettings()
    return NextResponse.json(copyFrom(settings), {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(copyFrom(D))
  }
}
