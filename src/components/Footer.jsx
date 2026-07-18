import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="container footer__grid">
        <div className="footer__brand">
          <span className="footer__om" aria-hidden="true">ॐ</span>
          <strong>SHREEJI DIVINE</strong>
          <p>Fragrance that brings divine presence home.</p>
        </div>

        <div className="footer__links">
          <h3>Explore</h3>
          <a href="#products">Products</a>
          <a href="#inside">What&apos;s Inside</a>
          <a href="#stones">Stones</a>
          <a href="#fragrances">Fragrances</a>
          <a href="#how-to-use">How to Use</a>
        </div>

        <div className="footer__contact">
          <h3>Connect</h3>
          <p>For orders, wholesale &amp; gifting enquiries</p>
          <a href="mailto:hello@shreejidivine.com" className="footer__email">
            hello@shreejidivine.com
          </a>
          <a href="#products" className="btn btn-gold footer__btn">
            View Collection
          </a>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>© {new Date().getFullYear()} Shreeji Divine. Made in India.</p>
          <p className="footer__tag">Ghar Par Mandir Ki Feeling</p>
        </div>
      </div>
    </footer>
  )
}
