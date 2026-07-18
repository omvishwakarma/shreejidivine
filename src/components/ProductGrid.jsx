import './ProductGrid.css'

const products = [
  {
    id: 'mogra',
    name: 'Mogra Royale',
    stone: 'Ganesh Ji',
    desc: 'Traditional temple aroma that uplifts the soul.',
    color: 'var(--mogra)',
    accent: '#2d6a4f',
  },
  {
    id: 'rose',
    name: 'Rose Majesty',
    stone: 'Om / Lotus',
    desc: 'Royal & luxurious floral fragrance for a soothing ambiance.',
    color: 'var(--rose)',
    accent: '#9b2d3f',
  },
  {
    id: 'lavender',
    name: 'Lavender Bliss',
    stone: 'Charan Paduka',
    desc: 'Calm your mind, relax your senses and heal naturally.',
    color: 'var(--lavender)',
    accent: '#6b3fa0',
  },
  {
    id: 'chandan',
    name: 'Royal Chandan',
    stone: 'Kalash',
    desc: 'Sacred sandalwood for purity & positivity.',
    color: 'var(--chandan)',
    accent: '#a67c1a',
  },
]

export default function ProductGrid() {
  return (
    <section className="products" id="products">
      <div className="container">
        <div className="products__head reveal">
          <p className="section-label">The Collection</p>
          <h2 className="section-title">Four Fragrances. One Divine Feeling.</h2>
          <p className="section-lead">
            Each set pairs a handcrafted aroma stone with a 10ml bottle of concentrated fragrance oil —
            gift-ready in a premium magnetic box.
          </p>
        </div>

        <div className="products__visual reveal reveal-delay-1">
          <img
            src="/images/aroma-variants.png"
            alt="Shreeji Divine Aroma Stone variants — Mogra Royale, Rose Majesty, Lavender Bliss, and Royal Chandan"
          />
        </div>

        <ul className="products__grid">
          {products.map((p, i) => (
            <li
              key={p.id}
              className={`product-tile reveal reveal-delay-${(i % 4) + 1}`}
              style={{ '--accent': p.accent, '--base': p.color }}
            >
              <div className="product-tile__bar" aria-hidden="true" />
              <h3>{p.name}</h3>
              <p className="product-tile__stone">{p.stone}</p>
              <p className="product-tile__desc">{p.desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
