'use client'

import BestSellers from './BestSellers'

const COPY = {
  label: 'Festive offers',
  title: 'Diwali Offer Sale',
  lead: 'Every product, lowest price first.',
}

function byPrice(list) {
  return [...list].sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0))
}

export default function DiwaliOfferSale() {
  return (
    <BestSellers
      id="diwali-offer"
      headingId="diwali-offer-heading"
      endpoint="/api/products"
      copyKey=""
      ariaLabel="Diwali offer sale"
      sectionClass="diwali-offer"
      festive
      sortProducts={byPrice}
      fallbackCopy={COPY}
    />
  )
}
