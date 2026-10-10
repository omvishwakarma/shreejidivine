import Link from 'next/link'
import PolicyFrame from '../../components/PolicyFrame'
import { CONTACT_EMAIL, SITE_NAME } from '../../lib/site'
import '../ecom.css'

export const metadata = {
  title: 'Cashback Policy',
  description:
    'How Shreeji Divine cart offers, store credit, and gift cards work. Cashback is store value for a future order, not a transfer to a bank account.',
  alternates: { canonical: '/cashback-policy' },
}

export default function CashbackPolicyPage() {
  return (
    <PolicyFrame title="Cashback Policy">
      <p>
        <strong>{SITE_NAME}</strong> offers are store value: a discount on the current order, a
        free-shipping unlock, a gift shown in the cart, or credit you can use on a later order.
        They are not a transfer to your bank account or UPI ID.
      </p>

      <section>
        <h2>1. Cart offers</h2>
        <p>
          The cart shows spend levels and what each level unlocks, such as free shipping or an
          amount off. The offer applies only when your cart reaches that amount before you place
          the order.
        </p>
        <ul>
          <li>When more than one money-off level is unlocked, the larger one is applied.</li>
          <li>A free-shipping unlock removes the shipping fee. It does not add a separate cash amount.</li>
          <li>A gift unlock is fulfilled only while that gift is in stock.</li>
          <li>The discount cannot be more than the product total of the order.</li>
        </ul>
        <p>Levels can change. The cart at checkout is the offer that applies to that order.</p>
      </section>

      <section>
        <h2>2. Coupons</h2>
        <p>
          A coupon code works only if it is valid, not expired, and the cart meets its conditions.
          A coupon is entered at checkout. It is not cash and cannot be exchanged for money.
        </p>
      </section>

      <section>
        <h2>3. Store credit from a return</h2>
        <p>
          Where the <Link href="/refund-policy">Refund &amp; Return Policy</Link> approves store
          credit, that credit is issued as in-store wallet credit, a discount code, or a gift
          card. It can be used on a future purchase on {SITE_NAME}.
        </p>
        <ul>
          <li>Store credit is not transferable and cannot be withdrawn as cash.</li>
          <li>It applies to products sold on this site, up to the credit balance.</li>
          <li>Shipping or handling fees called out in the Refund &amp; Return Policy, including the ₹100 colour-fading replacement fee, are not paid from a demand for cashback.</li>
        </ul>
      </section>

      <section>
        <h2>4. Partial prepaid amount</h2>
        <p>
          The ₹59 partial prepaid amount on an eligible cash on delivery order is not refunded as
          cash. If that order returns to origin, the amount may be used toward a future order, as
          stated in the Refund &amp; Return Policy.
        </p>
      </section>

      <section>
        <h2>5. Contact</h2>
        <p>
          If an approved credit does not appear, write to{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with your order number.
        </p>
        <p>We may update this Cashback Policy. The current version is the one published on this page.</p>
      </section>
    </PolicyFrame>
  )
}
