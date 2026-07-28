import Link from 'next/link'
import Image from 'next/image'
import './Collections.css'

const COLLECTIONS = [
  {
    name: 'Ritual Kit',
    href: '/shop/divine-ritual-kit',
    image: '/images/aroma-collection.png',
  },
  {
    name: 'Mogra',
    href: '/shop/mogra-royale',
    image: '/images/campaign/mogra-product.jpg',
  },
  {
    name: 'Rose',
    href: '/shop/rose-majesty',
    image: '/images/campaign/divine-rose.jpg',
  },
  {
    name: 'Lavender',
    href: '/shop/lavender-bliss',
    image: '/images/campaign/peaceful-lavender.jpg',
  },
  {
    name: 'Chandan',
    href: '/shop/royal-chandan',
    image: '/images/campaign/royal-chandan.jpg',
  },
  {
    name: 'All Products',
    href: '/shop',
    image: '/images/campaign/gilli-mitti.jpg',
  },
]

export default function Collections() {
  return (
    <section className="collections" id="collections" aria-labelledby="collections-heading">
      <div className="container">
        <div className="collections__head reveal">
          <p className="section-label">Our Collections</p>
          <h2 id="collections-heading" className="section-title">
            Find your fragrance
          </h2>
        </div>

        <ul className="collections__rail">
          {COLLECTIONS.map((c, i) => (
            <li key={c.name} className={`reveal reveal-delay-${(i % 3) + 1}`}>
              <Link href={c.href} className="collections__item">
                <span className="collections__media">
                  <Image
                    src={c.image}
                    alt={c.name}
                    width={400}
                    height={400}
                    sizes="160px"
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
