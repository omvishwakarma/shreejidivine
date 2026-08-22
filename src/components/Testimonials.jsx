'use client'

import { useEffect, useState } from 'react'
import './Testimonials.css'

export default function Testimonials() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState(0)

  useEffect(() => {
    let cancelled = false
    fetch('/api/testimonials')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        if (data.enabled === false) {
          setReviews([])
          return
        }
        setReviews(Array.isArray(data.reviews) ? data.reviews : [])
      })
      .catch(() => {
        if (!cancelled) setReviews([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const total = reviews.length
  const review = reviews[active] || null

  useEffect(() => {
    if (total < 2) return undefined
    const id = setInterval(() => {
      setActive((i) => (i + 1) % total)
    }, 6000)
    return () => clearInterval(id)
  }, [total])

  useEffect(() => {
    if (active >= total) setActive(0)
  }, [active, total])

  function go(dir) {
    if (!total) return
    setActive((i) => (i + dir + total) % total)
  }

  function avatarIndex(offset) {
    return (active + offset + total) % total
  }

  if (!loading && reviews.length === 0) return null

  const slots = total >= 5 ? [-2, -1, 0, 1, 2] : total >= 3 ? [-1, 0, 1] : [0]

  return (
    <section className="testimonials" id="testimonials" aria-labelledby="testimonials-heading">
      <div className="container">
        <div className="testimonials__head reveal">
          <h2 id="testimonials-heading" className="section-title">
            Testimonials
          </h2>
          <p className="section-lead">Loved in homes across India</p>
        </div>

        {loading || !review ? (
          <div className="testimonials__skel" aria-hidden="true" />
        ) : (
          <>
            <div className="testimonials__stage reveal">
              {total > 1 ? (
                <button
                  type="button"
                  className="testimonials__nav"
                  aria-label="Previous review"
                  onClick={() => go(-1)}
                >
                  ←
                </button>
              ) : (
                <span className="testimonials__nav-spacer" />
              )}

              <div className="testimonials__avatars" aria-hidden="true">
                {slots.map((offset) => {
                  const idx = avatarIndex(offset)
                  const item = reviews[idx]
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
                      {item.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.photo} alt="" />
                      ) : (
                        <span>{(item.name || '?').slice(0, 2).toUpperCase()}</span>
                      )}
                    </button>
                  )
                })}
              </div>

              {total > 1 ? (
                <button
                  type="button"
                  className="testimonials__nav"
                  aria-label="Next review"
                  onClick={() => go(1)}
                >
                  →
                </button>
              ) : (
                <span className="testimonials__nav-spacer" />
              )}
            </div>

            <div className="testimonials__stars" aria-label="5 out of 5 stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} aria-hidden="true">
                  ★
                </span>
              ))}
            </div>

            <blockquote className="testimonials__quote reveal" key={review.id || review.handle}>
              <h3>{review.title}</h3>
              <p>{review.quote}</p>
              <footer>
                —{' '}
                {review.instagram ? (
                  <a href={review.instagram} target="_blank" rel="noopener noreferrer">
                    {review.name}
                  </a>
                ) : (
                  review.name
                )}
              </footer>
            </blockquote>

            {review.instagram ? (
              <p className="testimonials__ig">
                <a href={review.instagram} target="_blank" rel="noopener noreferrer">
                  View on Instagram → {review.handle || review.name}
                </a>
              </p>
            ) : null}

            {total > 1 ? (
              <div className="testimonials__dots" role="tablist" aria-label="Reviews">
                {reviews.map((item, i) => (
                  <button
                    key={item.id || item.handle || i}
                    type="button"
                    role="tab"
                    aria-selected={i === active}
                    className={i === active ? 'is-active' : ''}
                    aria-label={`Review ${i + 1}`}
                    onClick={() => setActive(i)}
                  />
                ))}
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  )
}
