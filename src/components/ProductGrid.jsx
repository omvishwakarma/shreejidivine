import Image from 'next/image'
import Link from 'next/link'
import './ProductGrid.css'

const products = [
  {
    id: 'mogra',
    slug: 'mogra-royale',
    name: 'Mogra Royale',
    stone: 'Ganesh Ji',
    desc: 'Traditional temple aroma that uplifts the soul.',
    color: 'var(--mogra)',
    accent: '#2d6a4f',
  },
  {
    id: 'rose',
    slug: 'rose-majesty',
    name: 'Rose Majesty',
    stone: 'Om / Lotus',
    desc: 'Royal & luxurious floral fragrance for a soothing ambiance.',
    color: 'var(--rose)',
    accent: '#9b2d3f',
  },
  {
    id: 'lavender',
    slug: 'lavender-bliss',
    name: 'Lavender Bliss',
    stone: 'Charan Paduka',
    desc: 'Calm your mind, relax your senses and heal naturally.',
    color: 'var(--lavender)',
    accent: '#6b3fa0',
  },
  {
    id: 'chandan',
    slug: 'royal-chandan',
    name: 'Royal Chandan',
    stone: 'Kalash',
    desc: 'Sacred sandalwood for purity & positivity.',
    color: 'var(--chandan)',
    accent: '#a67c1a',
  },
]

export default function ProductGrid() {
  return (
    <section className="products" id="products" aria-labelledby="products-heading">
      <div className="container">
        <div className="products__head reveal">
          <p className="section-label">The Collection</p>
          <h2 id="products-heading" className="section-title">
            Four Fragrances. One Divine Feeling.
          </h2>
          <p className="section-lead">
            Each set pairs a handcrafted aroma stone with a 10ml bottle of concentrated fragrance oil —
            gift-ready in a premium magnetic box.
          </p>
        </div>

        <div className="products__visual products__visual--campaign reveal reveal-delay-1">
          <Image
            src="/images/campaign/mogra-product.jpg"
            alt="Shreeji Divine Mogra Bloom premium fragrance oil"
            width={576}
            height={1024}
            sizes="(max-width: 700px) 100vw, 360px"
          />
          <Image
            src="/images/campaign/divine-rose.jpg"
            alt="Shreeji Divine Rose premium fragrance oil"
            width={576}
            height={1024}
            sizes="(max-width: 700px) 100vw, 360px"
          />
          <Image
            src="/images/campaign/royal-chandan.jpg"
            alt="Shreeji Divine Royal Chandan premium fragrance oil"
            width={576}
            height={1024}
            sizes="(max-width: 700px) 100vw, 360px"
          />
        </div>

        <ul className="products__grid">
          {products.map((p, i) => (
            <li
              key={p.id}
              className={`product-tile reveal reveal-delay-${(i % 4) + 1}`}
              style={{ '--accent': p.accent, '--base': p.color }}
            >
              <Link href={`/shop/${p.slug}`} className="product-tile__link">
                <div className="product-tile__bar" aria-hidden="true" />
                <h3>{p.name}</h3>
                <p className="product-tile__stone">{p.stone}</p>
                <p className="product-tile__desc">{p.desc}</p>
              </Link>
            </li>
          ))}
        </ul>

        <div className="products__cta reveal">
          <Link href="/shop" className="btn btn-gold">
            Shop All Products
          </Link>
        </div>
      </div>
    </section>
  )
}
