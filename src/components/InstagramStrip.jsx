'use client'

import { useEffect, useState } from 'react'
import { SITE_NAME, SOCIAL } from '../lib/site'
import './InstagramStrip.css'

export default function InstagramStrip() {
  const [igUrl, setIgUrl] = useState(SOCIAL.instagram || 'https://www.instagram.com/shreeji.divine/')
  const [handle, setHandle] = useState(SOCIAL.instagramHandle || '@shreeji.divine')
  const [label, setLabel] = useState('Follow us on Instagram')
  const [cta, setCta] = useState('Visit Instagram')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    fetch('/api/instagram?limit=6')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        if (data.profileUrl) setIgUrl(data.profileUrl)
        if (data.handle) setHandle(data.handle)
        if (data.label) setLabel(data.label)
        if (data.cta) setCta(data.cta)
        setPosts(Array.isArray(data.posts) ? data.posts : [])
        if (data.error && !(data.posts || []).length) setError(data.error)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load Instagram feed')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="ig-strip" aria-labelledby="ig-strip-heading">
      <div className="container">
        <div className="ig-strip__head reveal">
          <p className="section-label">{label}</p>
          <h2 id="ig-strip-heading" className="section-title">
            <a href={igUrl} target="_blank" rel="noopener noreferrer">
              {handle}
            </a>
          </h2>
          <a
            href={igUrl}
            className="ig-strip__cta btn btn-ink"
            target="_blank"
            rel="noopener noreferrer"
          >
            {cta}
          </a>
        </div>
      </div>

      {loading ? (
        <div className="ig-strip__rail ig-strip__rail--skeleton" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="ig-strip__skel" />
          ))}
        </div>
      ) : posts.length > 0 ? (
        <ul className="ig-strip__rail">
          {posts.map((post) => {
            const isVideo = post.type === 'VIDEO'
            const href = post.permalink || igUrl
            const alt = post.caption
              ? post.caption.slice(0, 120)
              : `${SITE_NAME} on Instagram`

            return (
              <li key={post.id}>
                <a
                  href={href}
                  className="ig-strip__item"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={alt}
                >
                  {isVideo && post.mediaUrl ? (
                    <video
                      className="ig-strip__media"
                      src={post.mediaUrl}
                      poster={post.thumbnailUrl || undefined}
                      muted
                      loop
                      playsInline
                      autoPlay
                      preload="metadata"
                    />
                  ) : (
                    // Instagram CDN URLs change often — use native img
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="ig-strip__media"
                      src={post.mediaUrl || post.thumbnailUrl}
                      alt={alt}
                      loading="lazy"
                    />
                  )}
                  {isVideo ? (
                    <span className="ig-strip__play" aria-hidden="true">
                      ▶
                    </span>
                  ) : null}
                </a>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="ig-strip__empty">
          <p>{error || 'Instagram posts will appear here shortly.'}</p>
          <a href={igUrl} target="_blank" rel="noopener noreferrer">
            Open Instagram profile
          </a>
        </div>
      )}
    </section>
  )
}
