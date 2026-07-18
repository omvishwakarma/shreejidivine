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
    const els = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    els.forEach((el) => observer.observe(el))
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
