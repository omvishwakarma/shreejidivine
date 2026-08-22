'use client'

import { useEffect, useState } from 'react'
import './Testimonials.css'

const REVIEWS = [
  {
    title: 'Beautiful fragrance for home',
    quote:
      'Shreeji Divine aroma stones make our home feel calm and divine. Soft fragrance that lasts — perfect for daily pooja.',
    name: 'Pooja Mayur Parmar',
    handle: '@poojamayurparmar',
    photo: '/images/reviews/poojamayurparmar.jpg',
    instagram: 'https://www.instagram.com/poojamayurparmar/',
  },
  {
    title: 'Premium quality',
    quote:
      'Very nice packaging and pure fragrance. Royal Chandan smells sacred — highly recommend for gifting too.',
    name: 'Vishnu Parmar',
    handle: '@_vp_parmar_',
    photo: '/images/reviews/_vp_parmar_.jpg',
    instagram: 'https://www.instagram.com/_vp_parmar_/',
  },
  {
    title: 'Love the aroma',
    quote:
      'Mogra Royale is so soothing. Smoke-free and easy to use — my go-to for evening rituals at home.',
    name: 'Urvashi Bhatia',
    handle: '@urmii_empire',
    photo: '/images/reviews/urmii_empire.jpg',
    instagram: 'https://www.instagram.com/urmii_empire/',
  },
  {
    title: 'My favourite scent',
    quote:
      'Lavender Bliss is refreshing after a long day. The aroma stone looks beautiful and the scent is gentle, not overpowering.',
    name: 'Vaishnavi Gupta',
    handle: '@_vaishnavi_.23',
    photo: '/images/reviews/_vaishnavi_.23.jpg',
    instagram: 'https://www.instagram.com/_vaishnavi_.23/',
  },
  {
    title: 'Perfect for gifting',
    quote:
      'Ordered the Divine Ritual Kit for family — everyone loved it. Feels premium and smells divine.',
    name: 'Sakshi Gupta',
    handle: '@gupta_sakshiiiii',
    photo: '/images/reviews/gupta_sakshiiiii.jpg',
    instagram: 'https://www.instagram.com/gupta_sakshiiiii/',
  },
  {
    title: 'Truly divine fragrance',
    quote:
      'Rose Majesty creates such a peaceful atmosphere. Will definitely order again for festivals.',
    name: 'Nishi Gupta',
    handle: '@nishivikrantgupta',
    photo: '/images/reviews/nishivikrantgupta.jpg',
    instagram: 'https://www.instagram.com/nishivikrantgupta/',
  },
  {
    title: 'So calming',
    quote:
      'The fragrance fills the room gently and lasts long. Feels peaceful every time I light the aroma stone.',
    name: 'Anamika Gupta',
    handle: '@anamikagupta____',
    photo: '/images/reviews/anamikagupta____.jpg',
    instagram: 'https://www.instagram.com/anamikagupta____/',
  },
  {
    title: 'Natural and pure',
    quote:
      'Love how clean and natural the scent feels. Perfect for pooja room and everyday home fragrance.',
    name: 'Prakriti Path',
    handle: '@path.prakriti',
    photo: '/images/reviews/path.prakriti.jpg',
    instagram: 'https://www.instagram.com/path.prakriti/',
  },
]

export default function Testimonials() {
  const [active, setActive] = useState(0)
  const total = REVIEWS.length
  const review = REVIEWS[active]

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % total)
    }, 6000)
    return () => clearInterval(id)
  }, [total])

  function go(dir) {
    setActive((i) => (i + dir + total) % total)
  }

  function avatarIndex(offset) {
    return (active + offset + total) % total
  }

  const slots = [-2, -1, 0, 1, 2]

  return (
    <section className="testimonials" id="testimonials" aria-labelledby="testimonials-heading">
      <div className="container">
        <div className="testimonials__head reveal">
          <h2 id="testimonials-heading" className="section-title">
            Testimonials
          </h2>
          <p className="section-lead">Loved in homes across India</p>
        </div>

        <div className="testimonials__stage reveal">
          <button
            type="button"
            className="testimonials__nav"
            aria-label="Previous review"
            onClick={() => go(-1)}
          >
            ←
          </button>

          <div className="testimonials__avatars" aria-hidden="true">
            {slots.map((offset) => {
              const idx = avatarIndex(offset)
              const item = REVIEWS[idx]
              const isCenter = offset === 0
              return (
                <button
                  key={offset}
                  type="button"
                  className={`testimonials__avatar has-photo ${
                    isCenter ? 'is-active' : ''
                  } is-offset-${Math.abs(offset)}`}
                  onClick={() => setActive(idx)}
                  tabIndex={isCenter ? -1 : 0}
                  aria-label={`Show review by ${item.name}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.photo} alt="" />
                </button>
              )
            })}
          </div>

          <button
            type="button"
            className="testimonials__nav"
            aria-label="Next review"
            onClick={() => go(1)}
          >
            →
          </button>
        </div>

        <div className="testimonials__stars" aria-label="5 out of 5 stars">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} aria-hidden="true">
              ★
            </span>
          ))}
        </div>

        <blockquote className="testimonials__quote reveal" key={review.handle}>
          <h3>{review.title}</h3>
          <p>{review.quote}</p>
          <footer>
            —{' '}
            <a href={review.instagram} target="_blank" rel="noopener noreferrer">
              {review.name}
            </a>
          </footer>
        </blockquote>

        <p className="testimonials__ig">
          <a href={review.instagram} target="_blank" rel="noopener noreferrer">
            View on Instagram → {review.handle}
          </a>
        </p>

        <div className="testimonials__dots" role="tablist" aria-label="Reviews">
          {REVIEWS.map((item, i) => (
            <button
              key={item.handle}
              type="button"
              role="tab"
              aria-selected={i === active}
              className={i === active ? 'is-active' : ''}
              aria-label={`Review ${i + 1}`}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
