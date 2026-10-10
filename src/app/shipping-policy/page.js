import PolicyFrame from '../../components/PolicyFrame'
import { getStoreSettings } from '../../lib/shipping'
import { CONTACT_EMAIL, SITE_NAME } from '../../lib/site'
import '../ecom.css'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Shipping Policy',
  description:
    'Shreeji Divine shipping times, cash on delivery verification, and the free-shipping amount set in the store.',
  alternates: { canonical: '/shipping-policy' },
}

function freeShippingCopy(settings) {
  const fee = Math.max(0, Number(settings?.shippingFee) || 0)
  const minFree = Math.max(0, Math.round(Number(settings?.freeShippingMinOrder) || 0))
  if (fee === 0) {
    return {
      lead: 'We provide free shipping on all orders.',
      detail:
        'If a shipping charge applies to an order, it will be displayed at checkout before you complete your purchase.',
    }
  }
  if (minFree > 0) {
    const amount = `₹${minFree.toLocaleString('en-IN')}`
    return {
      lead: `We provide free shipping on orders above ${amount}.`,
      detail:
        'Shipping charges, if applicable to orders below the free-shipping threshold, will be displayed at checkout before you complete your purchase.',
    }
  }
  return {
    lead: 'Shipping charges for your order will be displayed at checkout before you complete your purchase.',
    detail: '',
  }
}

export default async function ShippingPolicyPage() {
  let settings = null
  try {
    settings = await getStoreSettings()
  } catch (err) {
    console.error(err)
  }
  const shipping = freeShippingCopy(settings)

  return (
    <PolicyFrame title="Shipping Policy">
      <p>
        At <strong>{SITE_NAME}</strong>, we aim to process and deliver your orders as quickly and
        smoothly as possible.
      </p>

      <section>
        <h2>Free Shipping</h2>
        <p>
          <strong>{shipping.lead}</strong>
        </p>
        {shipping.detail ? <p>{shipping.detail}</p> : null}
      </section>

      <section>
        <h2>Order Verification</h2>
        <p>
          For <strong>Cash on Delivery (COD)</strong> orders, we may contact you to verify your
          phone number, delivery address, and order details.
        </p>
        <p>This verification is carried out to prevent fraudulent or incorrect orders.</p>
        <p>
          An order will be processed for dispatch only after the required verification has been
          successfully completed.
        </p>
      </section>

      <section>
        <h2>Order Processing</h2>
        <p>
          Orders are generally processed within <strong>1 business day</strong> after successful
          order placement and verification.
        </p>
        <p>
          Most orders are dispatched within <strong>24 hours</strong>. In certain cases, dispatch
          may take up to <strong>48 hours</strong>.
        </p>
        <p>
          Please note that orders are not processed or dispatched on <strong>Sundays and applicable holidays</strong>.
        </p>
      </section>

      <section>
        <h2>Delivery Time</h2>
        <p>
          Once your order has been dispatched, the expected delivery time is approximately{' '}
          <strong>3–4 business days</strong>, depending on your delivery location and pincode.
        </p>
        <p>Delivery timelines may vary due to:</p>
        <ul>
          <li>Courier service availability</li>
          <li>Remote or difficult-to-service locations</li>
          <li>Weather conditions</li>
          <li>Public holidays</li>
          <li>Operational or logistical delays</li>
          <li>Unforeseen circumstances affecting the courier network</li>
        </ul>
      </section>

      <section>
        <h2>Courier &amp; Tracking</h2>
        <p>Orders are shipped through established and reliable courier partners operating across India.</p>
        <p>
          Once your order has been dispatched, tracking details may be shared with you through your
          registered contact details, allowing you to track the shipment until delivery.
        </p>
      </section>

      <section>
        <h2>Delivery Address</h2>
        <p>
          Please ensure that your shipping address, mobile number, and pincode are accurate and
          complete when placing your order.
        </p>
        <p>
          <strong>
            {SITE_NAME} will not be responsible for delivery delays or failed delivery caused by
            incorrect, incomplete, or inaccurate address or contact information provided by the
            customer.
          </strong>
        </p>
        <p>
          If our team or courier partner is unable to verify the delivery details, the order may be
          placed on hold or cancelled.
        </p>
      </section>

      <section>
        <h2>Delayed Deliveries</h2>
        <p>
          Although we make every effort to deliver orders within the estimated timeframe, delivery
          delays may occasionally occur due to circumstances beyond our control.
        </p>
        <p>
          If your order has not been delivered within the expected delivery period, please contact
          our customer support team with your order number, and we will assist you in tracking the
          shipment.
        </p>
      </section>

      <section>
        <h2>Contact Us</h2>
        <p>
          For any questions regarding your order, dispatch, or delivery, please contact the{' '}
          <strong>{SITE_NAME}</strong> customer support team at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
        <p>
          We reserve the right to update this Shipping Policy from time to time. Any changes will
          be published on this page.
        </p>
      </section>
    </PolicyFrame>
  )
}
