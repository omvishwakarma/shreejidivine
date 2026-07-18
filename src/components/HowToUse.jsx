import './HowToUse.css'

const steps = [
  {
    num: '01',
    title: 'Choose Your Stone',
    text: 'Place the aroma stone on a clean, dry surface.',
  },
  {
    num: '02',
    title: 'Add The Oil',
    text: 'Add 3–5 drops of Shreeji Divine fragrance oil.',
  },
  {
    num: '03',
    title: 'Place & Enjoy',
    text: 'Set it in your space — aroma spreads in minutes.',
  },
  {
    num: '04',
    title: 'Refill When Fades',
    text: 'Add 2–3 drops again when the fragrance softens.',
  },
]

export default function HowToUse() {
  return (
    <section className="howto" id="how-to-use" aria-labelledby="howto-heading">
      <div className="container">
        <div className="howto__head reveal">
          <p className="section-label">Simple Ritual</p>
          <h2 id="howto-heading" className="section-title">
            How to Use
          </h2>
          <p className="section-lead">
            Four quiet steps to transform any corner into a sacred space.
          </p>
        </div>

        <ol className="howto__steps">
          {steps.map((s, i) => (
            <li key={s.num} className={`reveal reveal-delay-${(i % 4) + 1}`}>
              <span className="howto__num">{s.num}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
