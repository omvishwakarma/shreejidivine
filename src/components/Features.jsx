import './Features.css'

const features = [
  {
    title: 'Divine Fragrance',
    text: 'Creates a temple-like environment at home, office or pooja room.',
  },
  {
    title: 'Natural & Safe',
    text: 'Made from natural gypsum & clay — smoke-free and ash-free.',
  },
  {
    title: 'Long Lasting',
    text: 'Just a few drops for hours of lasting, sacred aroma.',
  },
  {
    title: 'Perfect Gift',
    text: 'Ideal for festivals, housewarmings and all auspicious occasions.',
  },
  {
    title: 'Handmade with Love',
    text: 'Each stone is crafted with devotion — Made in India.',
  },
  {
    title: 'Reusable',
    text: 'Refill whenever the fragrance fades. Eco-friendly by design.',
  },
]

export default function Features() {
  return (
    <section className="features" id="features">
      <div className="container">
        <div className="features__head reveal">
          <p className="section-label">Why Shreeji Divine</p>
          <h2 className="section-title">Fragrance That Brings Divine Presence Home</h2>
        </div>

        <ul className="features__grid">
          {features.map((f, i) => (
            <li key={f.title} className={`reveal reveal-delay-${(i % 3) + 1}`}>
              <span className="features__mark" aria-hidden="true" />
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </li>
          ))}
        </ul>

        <figure className="features__visual reveal">
          <img
            src="/images/aroma-brochure.png"
            alt="Shreeji Divine Aroma Stone product details and packaging"
          />
        </figure>
      </div>
    </section>
  )
}
