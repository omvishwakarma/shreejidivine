import { SITE_TAGLINE } from '../lib/site'
import './TrustBar.css'

const ITEMS = [
  { title: 'Smoke-Free', text: 'Ash-free aroma stones' },
  { title: 'Handmade', text: 'Crafted in India' },
  { title: 'Gift Ready', text: 'Festival & ritual kits' },
  { title: SITE_TAGLINE, text: 'Temple feeling at home' },
]

export default function TrustBar() {
  return (
    <section className="trust-bar" aria-label="Brand highlights">
      <div className="container trust-bar__inner">
        {ITEMS.map((item) => (
          <div key={item.title} className="trust-bar__item">
            <strong>{item.title}</strong>
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
