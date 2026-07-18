import './Stones.css'

const stones = [
  {
    name: 'Ganesh Ji',
    meaning: 'For New Beginnings',
    note: 'Remover of obstacles — invite auspicious starts into your home.',
  },
  {
    name: 'Charan Paduka',
    meaning: 'Blessings & Devotion',
    note: 'Sacred footprints that remind us of divine presence and grace.',
  },
  {
    name: 'Om Design',
    meaning: 'Peace & Meditation',
    note: 'The primordial sound — center your space for calm and focus.',
  },
  {
    name: 'Kalash',
    meaning: 'Prosperity & Positivity',
    note: 'A vessel of abundance — welcome purity and good fortune.',
  },
]

export default function Stones() {
  return (
    <section className="stones" id="stones">
      <div className="container">
        <div className="stones__head reveal">
          <p className="section-label">Handcrafted Forms</p>
          <h2 className="section-title">Four Divine Aroma Stones</h2>
          <p className="section-lead">
            Carved from natural gypsum and clay — matte white forms that hold fragrance and meaning.
          </p>
        </div>

        <ul className="stones__grid">
          {stones.map((s, i) => (
            <li key={s.name} className={`reveal reveal-delay-${(i % 4) + 1}`}>
              <span className="stones__index">{String(i + 1).padStart(2, '0')}</span>
              <h3>{s.name}</h3>
              <p className="stones__meaning">{s.meaning}</p>
              <p className="stones__note">{s.note}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
