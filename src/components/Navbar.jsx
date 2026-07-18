import { useState, useEffect } from 'react'
import './Navbar.css'

const links = [
  { href: '#products', label: 'Products' },
  { href: '#inside', label: "What's Inside" },
  { href: '#stones', label: 'Stones' },
  { href: '#fragrances', label: 'Fragrances' },
  { href: '#how-to-use', label: 'How to Use' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="nav__inner container">
        <a href="#top" className="nav__brand" aria-label="Shreeji Divine home">
          <span className="nav__om" aria-hidden="true">ॐ</span>
          <span className="nav__name">
            <strong>SHREEJI</strong>
            <em>DIVINE</em>
          </span>
        </a>

        <nav className={`nav__links ${open ? 'nav__links--open' : ''}`}>
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <a href="#contact" className="nav__cta" onClick={() => setOpen(false)}>
            Contact
          </a>
        </nav>

        <button
          className={`nav__toggle ${open ? 'nav__toggle--open' : ''}`}
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  )
}
