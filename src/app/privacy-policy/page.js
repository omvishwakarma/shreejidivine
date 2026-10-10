import Link from 'next/link'
import PolicyFrame from '../../components/PolicyFrame'
import { CONTACT_EMAIL, SITE_NAME } from '../../lib/site'
import '../ecom.css'

export const metadata = {
  title: 'Privacy Policy',
  description:
    'What personal information Shreeji Divine collects for orders and accounts, and how cookies and marketing tools are used.',
  alternates: { canonical: '/privacy-policy' },
}

export default function PrivacyPolicyPage() {
  return (
    <PolicyFrame title="Privacy Policy">
      <p>
        This policy explains what <strong>{SITE_NAME}</strong> collects when you browse the shop,
        create an account, or place an order, and how that information is used.
      </p>

      <section>
        <h2>1. Information we collect</h2>
        <h3>Account</h3>
        <p>If you create an account, we store your name, email address, and phone number if you add one. A password is stored only in hashed form. If you sign in with Google, we store the Google account identifier needed to recognise that login.</p>
        <h3>Orders</h3>
        <p>Checkout collects the name, phone number, email, and delivery address needed to ship the order, plus the products, amounts, and whether you paid online or by cash on delivery.</p>
        <p>Card, UPI, and net-banking payments are processed by Razorpay. We do not store your full card number or UPI PIN.</p>
        <h3>Messages</h3>
        <p>If you email us or submit a product review, we keep that message so we can reply and, for reviews, decide whether to publish it.</p>
      </section>

      <section>
        <h2>2. How we use it</h2>
        <ul>
          <li>To create and deliver your order, including courier handover and order updates</li>
          <li>To run your account, login, and order history</li>
          <li>To apply coupons and cart offers</li>
          <li>To answer support requests about returns, replacements, and cancellations</li>
          <li>To keep the shop secure and prevent fraudulent orders</li>
        </ul>
        <p>We do not sell your personal information.</p>
      </section>

      <section>
        <h2>3. Cookies</h2>
        <p>Essential cookies keep you signed in and remember that you have answered the cookie banner. These are used whether you choose Okay or Reject.</p>
        <p>
          Marketing cookies load only if you choose <strong>Okay</strong> on the cookie banner.
          Reject keeps the shop on essential cookies. Marketing tools may include Meta Pixel and
          Google Analytics, used to understand visits and to measure ads. Choosing Okay also
          stores a random visitor id in a cookie so those tools can recognise this browser.
        </p>
        <p>You can change your choice by clearing the site cookies in your browser. The banner will show again.</p>
      </section>

      <section>
        <h2>4. Who else sees order details</h2>
        <p>We share only what a partner needs to do their part of the order:</p>
        <ul>
          <li>The courier, for delivery</li>
          <li>Razorpay, for online payment</li>
          <li>Our email provider, for order and account messages</li>
        </ul>
        <p>We may also disclose information if the law requires it.</p>
      </section>

      <section>
        <h2>5. How long we keep it</h2>
        <p>Order and account records are kept for as long as we need them to fulfil orders, handle replacements, and meet tax and accounting requirements. You can ask us to close an account that has no open order.</p>
      </section>

      <section>
        <h2>6. Contact</h2>
        <p>
          For a privacy request, write to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          Related terms are in our <Link href="/terms">Terms of Service</Link>.
        </p>
        <p>We may update this Privacy Policy. The current version is the one published on this page.</p>
      </section>
    </PolicyFrame>
  )
}
