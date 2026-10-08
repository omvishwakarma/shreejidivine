import Link from 'next/link'
import PolicyFrame from '../../components/PolicyFrame'
import { CONTACT_EMAIL, SITE_NAME } from '../../lib/site'
import '../ecom.css'

export const metadata = {
  title: 'Terms of Service',
  description:
    'Terms for browsing and buying from Shreeji Divine, including orders, prices, accounts, and related policies.',
}

export default function TermsPage() {
  return (
    <PolicyFrame title="Terms of Service">
      <p>
        These terms apply when you browse or buy from <strong>{SITE_NAME}</strong>. Placing an
        order means you accept these terms and the policies linked below.
      </p>

      <section>
        <h2>1. The shop</h2>
        <p>
          {SITE_NAME} sells spiritual wearables and related products for personal use and gifting.
          Product descriptions, photographs, and the Know your Product guide are for choosing a
          product. They are not medical, legal, or financial advice.
        </p>
      </section>

      <section>
        <h2>2. Orders and prices</h2>
        <ul>
          <li>Prices are shown in Indian rupees and include the charges displayed at checkout.</li>
          <li>An order is confirmed when online payment succeeds, or when a cash on delivery order is accepted.</li>
          <li>We may cancel an order we cannot fulfil, including when a product is out of stock or the payment cannot be verified. Any amount already collected is handled under the Cancellation Policy.</li>
          <li>Please check the size, mukhi, and product details before you pay. Change of mind and size selection are covered in the Refund &amp; Return Policy.</li>
        </ul>
      </section>

      <section>
        <h2>3. Related policies</h2>
        <p>These policies are part of your purchase:</p>
        <ul>
          <li>
            <Link href="/refund-policy">Refund &amp; Return Policy</Link>
          </li>
          <li>
            <Link href="/shipping-policy">Shipping Policy</Link>
          </li>
          <li>
            <Link href="/privacy-policy">Privacy Policy</Link>
          </li>
          <li>
            <Link href="/cashback-policy">Cashback Policy</Link>
          </li>
          <li>
            <Link href="/cancellation-policy">Cancellation Policy</Link>
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Accounts</h2>
        <p>
          You are responsible for the login you use on this site. Give a phone number and address
          where the courier can reach you. We may refuse or close an account that is used to place
          fraudulent orders or to abuse offers.
        </p>
      </section>

      <section>
        <h2>5. Offers</h2>
        <p>
          Coupons, cart rewards, and free-gift buttons apply only as shown in the cart or on the
          offer itself. We may change or end an offer. One order cannot be combined in a way the
          cart does not allow.
        </p>
      </section>

      <section>
        <h2>6. Site content</h2>
        <p>
          The {SITE_NAME} name, logo, product photographs, and site text belong to us or to the
          people who licensed them to us. You may not copy them for another shop.
        </p>
      </section>

      <section>
        <h2>7. Liability</h2>
        <p>
          To the extent the law allows, our responsibility for an order is limited to the amount
          you paid for that order, and to the replacement, store credit, or refund described in
          the Refund &amp; Return Policy.
        </p>
      </section>

      <section>
        <h2>8. Law</h2>
        <p>These terms are governed by the laws of India. Courts in India have jurisdiction.</p>
        <p>
          Questions about these terms can be sent to{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
        <p>We may update these terms. The current version is the one published on this page.</p>
      </section>
    </PolicyFrame>
  )
}
