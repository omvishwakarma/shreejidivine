import Link from 'next/link'
import Image from 'next/image'
import ShopNav from '../../components/ShopNav'
import Footer from '../../components/Footer'
import { PRODUCTS, formatINR } from '../../lib/products'
import AddToCartButton from '../../components/AddToCartButton'
import '../ecom.css'

export const metadata = {
  title: 'Shop',
  description:
    'Shop Shreeji Divine Aroma Stones — Divine Ritual Kit, Mogra Royale, Rose Majesty, Lavender Bliss & Royal Chandan.',
}

export default function ShopPage() {
  return (
    <div className="ecom-page">
      <ShopNav />
      <div className="ecom-wrap">
        <header className="ecom-hero">
          <p className="section-label">Shreeji Divine Collection</p>
          <h1 className="ecom-title">Shop Aroma Stones</h1>
          <p className="ecom-lead">
            Premium handcrafted stones &amp; fragrance oils — gift-ready, smoke-free, Made in India.
          </p>
          <div className="ecom-trust">
            <span>Free Shipping</span>
            <span>COD Available</span>
            <span>Handmade</span>
          </div>
        </header>

        <div className="ecom-grid">
          {PRODUCTS.map((p) => (
            <article key={p.id} className="product-card">
              <Link href={`/shop/${p.slug}`} className="product-card__media">
                {p.badge ? <span className="product-card__badge">{p.badge}</span> : null}
                <Image
                  src={p.image}
                  alt={p.name}
                  width={700}
                  height={600}
                  sizes="(max-width:700px) 100vw, 360px"
                />
              </Link>
              <div className="product-card__body">
                <p className="product-card__tag">{p.tagline}</p>
                <Link href={`/shop/${p.slug}`}>
                  <h2 className="product-card__name">{p.name}</h2>
                </Link>
                <div className="product-card__price">
                  <strong>{formatINR(p.price)}</strong>
                  {p.compareAt ? <s>{formatINR(p.compareAt)}</s> : null}
                </div>
                <div className="product-card__actions">
                  <AddToCartButton product={p} />
                  <Link href={`/shop/${p.slug}`} className="btn-sm btn-ghost">
                    Details
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
