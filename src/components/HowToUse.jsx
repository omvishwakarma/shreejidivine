import Image from 'next/image'
import './HowToUse.css'

const steps = [
  {
    num: '01',
    title: 'Choose Your Stone',
    text: 'Place the aroma stone on a clean, dry surface.',
    image: '/images/howto/01-choose-stone.jpg',
  },
  {
    num: '02',
    title: 'Add The Oil',
    text: 'Add 3–5 drops of Shreeji Divine fragrance oil.',
    image: '/images/howto/02-add-oil.jpg',
  },
  {
    num: '03',
    title: 'Place & Enjoy',
    text: 'Set it in your space — aroma spreads in minutes.',
    image: '/images/howto/03-place-enjoy.jpg',
  },
  {
    num: '04',
    title: 'Refill When Fades',
    text: 'Add 2–3 drops again when the fragrance softens.',
    image: '/images/howto/04-refill.jpg',
  },
]

function LotusMark() {
  return (
    <span className="howto__ornament" aria-hidden="true">
      <span className="howto__ornament-line" />
      <svg viewBox="0 0 32 28" className="howto__lotus" fill="none">
        <path
          d="M16 4c-1.2 3.4-4.6 5.6-4.6 9.2a4.6 4.6 0 0 0 9.2 0C20.6 9.6 17.2 7.4 16 4Z"
          fill="currentColor"
        />
        <path
          d="M8.2 12.2c1.8 1.2 3.2 3.2 3.2 5.4 0 1.4-.6 2.6-1.6 3.4"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M23.8 12.2c-1.8 1.2-3.2 3.2-3.2 5.4 0 1.4.6 2.6 1.6 3.4"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M6 22.5c3.2-2.2 6.6-3.2 10-3.2s6.8 1 10 3.2"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
      <span className="howto__ornament-line" />
    </span>
  )
}

export default function HowToUse() {
  return (
    <section className="howto" id="how-to-use" aria-labelledby="howto-heading">
      <div className="container">
        <div className="howto__head reveal">
          <h2 id="howto-heading" className="section-title">
            How to Use
          </h2>
          <LotusMark />
          <p className="section-lead">
            Four simple steps to transform any corner into a sacred space.
          </p>
        </div>

        <ol className="howto__steps">
          {steps.map((s, i) => (
            <li key={s.num} className={`reveal reveal-delay-${(i % 4) + 1}`}>
              <div className="howto__card">
                <span className="howto__num">{s.num}</span>
                <span className="howto__circle">
                  <Image
                    src={s.image}
                    alt={s.title}
                    fill
                    sizes="(max-width: 800px) 42vw, 180px"
                  />
                </span>
              </div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
