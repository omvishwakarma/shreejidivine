import Link from 'next/link'
import PolicyFrame from '../../components/PolicyFrame'
import { CONTACT_EMAIL, SITE_NAME } from '../../lib/site'
import '../ecom.css'

export const metadata = {
  title: 'Cancellation Policy',
  description:
    'How to cancel a Shreeji Divine order before dispatch, and what happens to prepaid and cash on delivery orders after the parcel has shipped.',
}

export default function CancellationPolicyPage() {
  return (
    <PolicyFrame title="Cancellation Policy">
      <p>
        You can ask <strong>{SITE_NAME}</strong> to cancel an order before it is dispatched. Once
        the parcel is with the courier, cancellation is no longer available and the{' '}
        <Link href="/refund-policy">Refund &amp; Return Policy</Link> applies.
      </p>

      <section>
        <h2>1. How to cancel</h2>
        <p>Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with:</p>
        <ul>
          <li>Your order number</li>
          <li>The phone number used at checkout</li>
          <li>A clear request to cancel</li>
        </ul>
        <p>
          We cancel the order if it has not been handed to the courier. If it has already been
          dispatched, we will tell you and the request will not be treated as a cancellation.
        </p>
      </section>

      <section>
        <h2>2. Prepaid orders cancelled before dispatch</h2>
        <p>
          If we cancel a prepaid order before dispatch, the amount collected for that order is
          returned as in-store wallet credit, a discount code, or a gift card, unless we approve
          an exceptional refund to the original payment method.
        </p>
        <p>
          An exceptional refund to the original method, when approved, can take about 4–5 business
          days to show in your account. Your bank or payment provider may take longer.
        </p>
      </section>

      <section>
        <h2>3. Cash on delivery</h2>
        <p>
          A cash on delivery order cancelled before dispatch has no balance to collect. A ₹59
          partial prepaid amount, if it was charged, is non-refundable and may be used toward a
          future order.
        </p>
      </section>

      <section>
        <h2>4. After dispatch</h2>
        <p>
          Refusing a parcel after it has shipped is not a cancellation. For a prepaid order that
          cannot be delivered, any applicable amount is handled as store credit after shipping
          charges, under the Refund &amp; Return Policy.
        </p>
        <p>
          A wrong, damaged, or defective product is a replacement request, not a cancellation.
          Contact us within 1 day of delivery and include the unboxing video required by that
          policy.
        </p>
      </section>

      <section>
        <h2>5. When we cancel</h2>
        <p>
          We may cancel an order if the product is unavailable, the payment cannot be confirmed,
          or the address cannot be served. We will email the address on the order. Amounts already
          collected follow section 2.
        </p>
        <p>We may update this Cancellation Policy. The current version is the one published on this page.</p>
      </section>
    </PolicyFrame>
  )
}
