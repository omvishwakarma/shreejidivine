import Image from 'next/image'
import { CONTACT_EMAIL, SITE_URL } from '../lib/site'
import './Footer.css'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer" id="contact" aria-labelledby="contact-heading">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Image
            src="/images/logo.png"
            alt="Shreeji Divine"
            width={516}
            height={358}
            className="footer__logo"
            sizes="220px"
          />
          <p>Fragrance that brings divine presence home.</p>
          <p className="footer__url">
            <a href={SITE_URL}>shreejidivinearoma.com</a>
          </p>
        </div>

        <nav className="footer__links" aria-label="Footer">
          <h2 id="contact-heading" className="footer__nav-title">
            Explore
          </h2>
          <a href="#products">Products</a>
          <a href="#inside">What&apos;s Inside</a>
          <a href="#stones">Stones</a>
          <a href="#fragrances">Fragrances</a>
          <a href="#how-to-use">How to Use</a>
        </nav>

        <div className="footer__contact">
          <h2 className="footer__nav-title">Connect</h2>
          <p>For orders, wholesale &amp; gifting enquiries</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="footer__email">
            {CONTACT_EMAIL}
          </a>
          <a href="#products" className="btn btn-gold footer__btn">
            View Collection
          </a>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>© {year} Shreeji Divine. Made in India. All rights reserved.</p>
          <p className="footer__tag">Ghar Par Mandir Ki Feeling</p>
        </div>
      </div>
    </footer>
  )
}
