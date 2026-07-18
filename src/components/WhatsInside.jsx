import Image from 'next/image'
import './WhatsInside.css'

const items = [
  {
    title: '4 Divine Aroma Stones',
    detail: 'Handcrafted with devotion from natural gypsum & clay',
  },
  {
    title: '4 Signature Fragrance Oils',
    detail: 'Long lasting & premium — 10ml each',
  },
  {
    title: 'Ritual Guide',
    detail: 'For your daily divine ritual',
  },
  {
    title: 'Blessing Card',
    detail: 'With positive energy & intentions',
  },
  {
    title: 'Premium Magnetic Gift Box',
    detail: 'Made for gifting & cherishing — 24 × 20 × 4.5 cm',
  },
]

export default function WhatsInside() {
  return (
    <section className="inside" id="inside" aria-labelledby="inside-heading">
      <div className="inside__bg" aria-hidden="true" />
      <div className="container inside__layout">
        <div className="inside__copy reveal">
          <p className="section-label">The Divine Ritual Kit</p>
          <h2 id="inside-heading" className="section-title">
            What&apos;s Inside
          </h2>
          <p className="section-lead">
            Not just a fragrance — a complete divine experience. Open the box and invite peace,
            prosperity &amp; blessings into your space.
          </p>

          <ul className="inside__list">
            {items.map((item) => (
              <li key={item.title}>
                <span className="inside__dot" aria-hidden="true" />
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <figure className="inside__figure reveal reveal-delay-2">
          <Image
            src="/images/aroma-collection.png"
            alt="Open Shreeji Divine Divine Ritual Kit gift box with four aroma stones and four fragrance oils"
            width={900}
            height={900}
            sizes="(max-width: 860px) 100vw, 560px"
          />
          <figcaption>
            May every breath bring peace, prosperity &amp; divine blessings.
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
