'use client'

import { useEffect } from 'react'
import Navbar from './Navbar'
import Hero from './Hero'
import ProductGrid from './ProductGrid'
import WhatsInside from './WhatsInside'
import Stones from './Stones'
import Fragrances from './Fragrances'
import HowToUse from './HowToUse'
import Features from './Features'
import PerfectFor from './PerfectFor'
import Footer from './Footer'

export default function HomeContent() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.reveal'))
    if (!els.length) return undefined

    // Show anything already in / near the viewport immediately
    const showIfVisible = (el) => {
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight * 0.92) {
        el.classList.add('visible')
      }
    }
    els.forEach(showIfVisible)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -5% 0px' }
    )

    els.forEach((el) => {
      if (!el.classList.contains('visible')) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content">
        <Hero />
        <ProductGrid />
        <WhatsInside />
        <Stones />
        <Fragrances />
        <HowToUse />
        <Features />
        <PerfectFor />
      </main>
      <Footer />
    </>
  )
}
