import './Features.css'

const features = [
  {
    title: 'Smoke-Free Ritual',
    text: 'Natural gypsum & clay stones — ash-free aroma for home and pooja room.',
  },
  {
    title: 'Long-Lasting Oils',
    text: 'A few drops create hours of sacred fragrance that fills the room.',
  },
  {
    title: 'Gift-Ready',
    text: 'Premium packaging for festivals, housewarmings, and auspicious occasions.',
  },
  {
    title: 'Handmade in India',
    text: 'Crafted with devotion — bringing temple feeling into everyday living.',
  },
]

export default function Features() {
  return (
    <section className="features" id="features" aria-labelledby="features-heading">
      <div className="container">
        <div className="features__head reveal">
          <p className="section-label">Why Choose Us</p>
          <h2 id="features-heading" className="section-title">
            Crafted for mindful living
          </h2>
        </div>

        <ul className="features__grid">
          {features.map((f, i) => (
            <li key={f.title} className={`reveal reveal-delay-${(i % 4) + 1}`}>
              <span className="features__index" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
