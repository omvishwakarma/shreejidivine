'use client'

import { useEffect, useRef, useState } from 'react'
import './Testimonials.css'

function SideReview({ item, onSelect }) {
  if (!item) return null
  const image = item.poster || item.photo
  return (
    <button type="button" className="testimonials__card is-side" onClick={onSelect} aria-label={`Show review by ${item.name}`}>
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" />
      ) : (
        <span>{item.name}</span>
      )}
    </button>
  )
}

function ReviewVideo({ src, poster, embed }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !src) return undefined

    const play = async () => {
      el.muted = false
      try {
        await el.play()
      } catch {
        el.muted = true
        try {
          await el.play()
        } catch {
          /* browser blocked playback */
        }
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) play()
        else el.pause()
      },
      { threshold: 0.45 }
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      el.pause()
    }
  }, [src])

  if (src) {
    return (
      <video
        ref={ref}
        className="testimonials__video"
        src={src}
        poster={poster || undefined}
        controls
        playsInline
        preload="auto"
      />
    )
  }

  if (!embed) return null

  return (
    <iframe
      className="testimonials__embed"
      src={embed}
      title="Instagram review"
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowFullScreen
    />
  )
}

export default function Testimonials() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState(0)
  const [copy, setCopy] = useState({
    title: 'Testimonials',
    lead: 'Loved in homes across India',
  })

  useEffect(() => {
    fetch('/api/homepage')
      .then((r) => r.json())
      .then((d) => {
        if (d?.testimonials) setCopy(d.testimonials)
      })
      .catch(() => {})
  }, [])

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
    if (active >= total) setActive(0)
  }, [active, total])

  function at(offset) {
    if (!total) return null
    return reviews[(active + offset + total) % total]
  }

  if (!loading && reviews.length === 0) return null

  const previous = total > 1 ? at(-1) : null
  const next = total > 2 ? at(1) : null

  return (
    <section className="testimonials" id="testimonials" aria-labelledby="testimonials-heading">
      <div className="container">
        <div className="testimonials__head reveal">
          <h2 id="testimonials-heading" className="section-title">
            {copy.title}
          </h2>
          <p className="section-lead">{copy.lead}</p>
        </div>

        {loading || !review ? (
          <div className="testimonials__skel" aria-hidden="true" />
        ) : (
          <>
            <div className="testimonials__stage reveal">
              {previous ? (
                <SideReview item={previous} onSelect={() => setActive((active - 1 + total) % total)} />
              ) : null}

              <div className="testimonials__card is-current" key={review.id || review.handle}>
                <ReviewVideo src={review.playback} poster={review.poster || review.photo} embed={review.embed} />
              </div>

              {next ? (
                <SideReview item={next} onSelect={() => setActive((active + 1) % total)} />
              ) : null}
            </div>

            <div className="testimonials__stars" aria-label="5 out of 5 stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} aria-hidden="true">
                  ★
                </span>
              ))}
            </div>

            <p className="testimonials__name">
              —{' '}
              {review.instagram ? (
                <a href={review.instagram} target="_blank" rel="noopener noreferrer">
                  {review.name}
                </a>
              ) : (
                review.name
              )}
            </p>

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
