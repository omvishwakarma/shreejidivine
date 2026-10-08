import Link from 'next/link'
import StoreHeader from './StoreHeader'
import Footer from './Footer'
import { POLICIES } from '../lib/policies'
import './policy.css'

export default function PolicyFrame({ title, children }) {
  return (
    <div className="ecom-page">
      <StoreHeader />
      <main className="policy" id="main-content">
        <div className="container policy__wrap">
          <p className="section-label">Policies</p>
          <nav className="policy__nav" aria-label="Policies">
            {POLICIES.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          <h1 className="policy__title">{title}</h1>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}
