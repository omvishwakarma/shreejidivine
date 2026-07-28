'use client'

import { useEffect } from 'react'
import StoreHeader from './StoreHeader'
import Hero from './Hero'
import BestSellers from './BestSellers'
import BrandBanner from './BrandBanner'
import Collections from './Collections'
import Purpose from './Purpose'
import Features from './Features'
import HowToUse from './HowToUse'
import Footer from './Footer'

export default function HomeContent() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.reveal'))
    if (!els.length) return undefined

    const inView = (el) => {
      const rect = el.getBoundingClientRect()
      return rect.top < window.innerHeight * 0.92
    }

    els.forEach((el) => {
      if (inView(el)) {
        el.classList.add('visible')
      } else {
        el.classList.add('will-animate')
      }
    })

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            entry.target.classList.remove('will-animate')
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
      <StoreHeader />
      <main id="main-content">
        <Hero />
        <BestSellers />
        <BrandBanner />
        <Collections />
        <Purpose />
        <Features />
        <HowToUse />
      </main>
      <Footer />
    </>
  )
}
