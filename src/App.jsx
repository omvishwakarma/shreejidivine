import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import ProductGrid from './components/ProductGrid'
import WhatsInside from './components/WhatsInside'
import Stones from './components/Stones'
import Fragrances from './components/Fragrances'
import HowToUse from './components/HowToUse'
import Features from './components/Features'
import PerfectFor from './components/PerfectFor'
import Footer from './components/Footer'

function App() {
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
      <Navbar />
      <main>
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

export default App
