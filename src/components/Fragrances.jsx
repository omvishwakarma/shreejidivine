import Image from 'next/image'
import Link from 'next/link'
import { CAMPAIGN_SCENTS } from '../lib/campaign'
import './Fragrances.css'

export default function Fragrances() {
  return (
    <section className="fragrances" id="fragrances" aria-labelledby="fragrances-heading">
      <div className="container fragrances__intro reveal">
        <p className="section-label">Signature scents</p>
        <h2 id="fragrances-heading" className="section-title">
          Five fragrance stories
        </h2>
        <p className="section-lead">
          From monsoon earth to temple jasmine — each oil is crafted for aroma stones, diffusers,
          and quiet luxury at home.
        </p>
      </div>

      <ul className="fragrances__stories">
        {CAMPAIGN_SCENTS.map((scent, i) => (
          <li
            key={scent.id}
            className={`fragrance-story reveal ${i % 2 === 1 ? 'fragrance-story--flip' : ''}`}
            style={{ '--f-tone': scent.tone }}
          >
            <div className="fragrance-story__media">
              <Image
                src={scent.image}
                alt={`${scent.name} campaign — ${scent.headline}`}
                width={576}
                height={1024}
                sizes="(max-width: 900px) 100vw, 42vw"
              />
            </div>
            <div className="fragrance-story__body">
              <p className="fragrance-story__tag">{scent.name}</p>
              <h3>{scent.headline}</h3>
              <p>{scent.line}</p>
              <Link href="/shop" className="fragrance-story__link">
                Shop this scent
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
