'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import './Collections.css'

export default function Collections() {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetch('/api/categories?home=1')
      .then((r) => r.json())
      .then((d) => {
        const tree = d.categories || []
        const tiles = []
        tree.forEach((parent) => {
          tiles.push({
            id: parent.id,
            name: parent.name,
            href: `/shop?category=${parent.slug}`,
            image: parent.image || '/images/aroma-collection.png',
          })
          ;(parent.children || []).forEach((child) => {
            tiles.push({
              id: child.id,
              name: child.name,
              href: `/shop?category=${parent.slug}&subcategory=${child.slug}`,
              image: child.image || parent.image || '/images/campaign/mogra-product.jpg',
            })
          })
        })
        setCategories(tiles.slice(0, 8))
      })
      .catch(() => {})
  }, [])

  return (
    <section className="collections" id="collections" aria-labelledby="collections-heading">
      <div className="container">
        <div className="collections__head reveal">
          <p className="section-label">Shop by Category</p>
          <h2 id="collections-heading" className="section-title">
            For Every Ritual
          </h2>
          <p className="section-lead">
            Explore Divine and Lifestyle collections — fragrance for prayer, home, and gifting.
          </p>
        </div>

        <ul className="collections__grid">
          {(categories.length
            ? categories
            : [
                {
                  id: 'divine',
                  name: 'Divine',
                  href: '/shop?category=divine',
                  image: '/images/campaign/royal-chandan.jpg',
                },
                {
                  id: 'lifestyle',
                  name: 'Lifestyle',
                  href: '/shop?category=lifestyle',
                  image: '/images/campaign/gilli-mitti-lifestyle.jpg',
                },
              ]
          ).map((c, i) => (
            <li key={c.id} className={`reveal reveal-delay-${(i % 4) + 1}`}>
              <Link href={c.href} className="collections__card">
                <span className="collections__media">
                  <Image
                    src={c.image}
                    alt={c.name}
                    width={480}
                    height={480}
                    sizes="(max-width:700px) 45vw, 220px"
                  />
                </span>
                <span className="collections__name">{c.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
