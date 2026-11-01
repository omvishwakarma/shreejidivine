import Link from 'next/link'
import Image from 'next/image'
import AddToCartButton from './AddToCartButton'
import { discountPct, formatINR, toTitleCase } from '../lib/products'
import { isBlobSrc, storeImageSrc } from '../lib/storeImage'

export default function ProductCard({ product, heading = 'h2', className = '' }) {
  const off = discountPct(product.price, product.compareAt)
  const Title = heading

  return (
    <article className={`product-card${className ? ` ${className}` : ''}`}>
      <Link href={`/shop/${product.slug}`} className="product-card__media">
        {product.badge ? <span className="product-card__badge">{product.badge}</span> : null}
        <Image
          src={storeImageSrc(product.image, 720)}
          alt={product.name}
          width={700}
          height={600}
          sizes="(max-width:560px) 50vw, (max-width:960px) 45vw, 360px"
          unoptimized={isBlobSrc(product.image)}
        />
      </Link>
      <div className="product-card__body">
        <Link href={`/shop/${product.slug}`}>
          <Title className="product-card__name">{toTitleCase(product.name)}</Title>
        </Link>
        <div className="product-card__price">
          <strong>{formatINR(product.price)}</strong>
          {product.compareAt ? <s>{formatINR(product.compareAt)}</s> : null}
          {off > 0 ? <span className="product-card__save">{off}% off</span> : null}
        </div>
        <div className="product-card__actions">
          <AddToCartButton product={product} />
        </div>
      </div>
    </article>
  )
}
