import './Testimonials.css'

const REVIEWS = [
  {
    quote:
      'The Mogra aroma stone fills our pooja room with a calm temple feeling. Soft, lasting, and never overpowering.',
    name: 'Ananya R.',
  },
  {
    quote:
      'Gifted the Divine Ritual Kit for a housewarming — packaging felt premium and the sandalwood scent is beautiful.',
    name: 'Rohit M.',
  },
  {
    quote:
      'Smoke-free and easy to use. Lavender Bliss is my evening reset after long workdays.',
    name: 'Sonal K.',
  },
  {
    quote:
      'Royal Chandan smells pure and sacred. Ordering again for festival gifting.',
    name: 'Vijay L.',
  },
]

export default function Testimonials() {
  return (
    <section className="testimonials" id="testimonials" aria-labelledby="testimonials-heading">
      <div className="container">
        <div className="testimonials__head reveal">
          <p className="section-label">Testimonials</p>
          <h2 id="testimonials-heading" className="section-title">
            Loved in homes across India
          </h2>
        </div>

        <ul className="testimonials__grid">
          {REVIEWS.map((r, i) => (
            <li key={r.name} className={`reveal reveal-delay-${(i % 4) + 1}`}>
              <blockquote>
                <span className="testimonials__mark" aria-hidden="true">
                  “
                </span>
                <p>{r.quote}</p>
                <footer>{r.name}</footer>
              </blockquote>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
