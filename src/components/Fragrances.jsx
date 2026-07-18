import './Fragrances.css'

const fragrances = [
  {
    id: 'mogra',
    name: 'Mogra Royale',
    tag: 'Temple Jasmine',
    desc: 'Traditional temple aroma that uplifts the soul.',
    color: '#1b4332',
  },
  {
    id: 'rose',
    name: 'Rose Majesty',
    tag: 'Royal Floral',
    desc: 'Luxurious floral fragrance for a soothing ambiance.',
    color: '#7b1e2e',
  },
  {
    id: 'lavender',
    name: 'Lavender Bliss',
    tag: 'Calm & Restore',
    desc: 'Calm your mind, relax your senses and heal naturally.',
    color: '#4a2c6a',
  },
  {
    id: 'chandan',
    name: 'Royal Chandan',
    tag: 'Sacred Sandalwood',
    desc: 'Sacred sandalwood fragrance for purity & positivity.',
    color: '#8b6914',
  },
]

export default function Fragrances() {
  return (
    <section className="fragrances" id="fragrances">
      <div className="container">
        <div className="fragrances__head reveal">
          <p className="section-label">Signature Scents</p>
          <h2 className="section-title">Four Fragrance Oils</h2>
          <p className="section-lead">
            Concentrated oils in amber glass with gold caps — a few drops awaken hours of divine aroma.
          </p>
        </div>

        <ul className="fragrances__grid">
          {fragrances.map((f, i) => (
            <li
              key={f.id}
              className={`fragrance reveal reveal-delay-${(i % 4) + 1}`}
              style={{ '--f-color': f.color }}
            >
              <div className="fragrance__swatch" aria-hidden="true">
                <span />
              </div>
              <div className="fragrance__body">
                <p className="fragrance__tag">{f.tag}</p>
                <h3>{f.name}</h3>
                <p>{f.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
