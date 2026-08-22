'use client'

import Image from 'next/image'
import './HowToUse.css'

const steps = [
  {
    id: 'choose',
    title: 'Choose Your Stone',
    text: 'Place the aroma stone on a clean, dry surface.',
    icon: '/images/howto/icons/step-1.png',
  },
  {
    id: 'oil',
    title: 'Add The Oil',
    text: 'Add 3–5 drops of Shreeji Divine fragrance oil.',
    icon: '/images/howto/icons/step-2.png',
  },
  {
    id: 'enjoy',
    title: 'Place & Enjoy',
    text: 'Set it in your space — aroma spreads in minutes.',
    icon: '/images/howto/icons/step-3.png',
  },
  {
    id: 'refill',
    title: 'Refill When Fades',
    text: 'Add 2–3 drops again when the fragrance softens.',
    icon: '/images/howto/icons/step-4.png',
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

function StepArrow() {
  return (
    <span className="howto__arrow" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10.5" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M10.2 7.5L14.7 12l-4.5 4.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
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
            <li key={s.id} className={`reveal reveal-delay-${(i % 4) + 1}`}>
              <span className="howto__icon">
                <Image
                  src={s.icon}
                  alt=""
                  width={160}
                  height={160}
                  sizes="(max-width: 900px) 22vw, 110px"
                />
              </span>
              {i < steps.length - 1 ? <StepArrow /> : null}
              <h3 className="howto__title">{s.title}</h3>
              <span className="howto__rule" aria-hidden="true" />
              <p className="howto__text">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
