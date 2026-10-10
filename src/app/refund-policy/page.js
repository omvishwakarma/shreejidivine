import Link from 'next/link'
import PolicyFrame from '../../components/PolicyFrame'
import { CONTACT_EMAIL, SITE_NAME } from '../../lib/site'
import '../ecom.css'

export const metadata = {
  title: 'Refund & Return Policy',
  description:
    'Shreeji Divine 1-day replacement policy for wrong, damaged, or defective products. Unboxing video is required. Refunds are issued as store credit except in exceptional cases.',
  alternates: { canonical: '/refund-policy' },
}

export default function RefundPolicyPage() {
  return (
    <PolicyFrame title="Refund & Return Policy">
          <p>
            At <strong>{SITE_NAME}</strong>, we carefully inspect and pack every order before
            dispatch. However, if you receive an incorrect, damaged, or defective product, we are
            here to help.
          </p>
          <p>Please read the following policy carefully before placing your order.</p>

          <section>
            <h2>1. Replacement Period</h2>
            <p>
              We offer a <strong>1-day replacement policy</strong>.
            </p>
            <p>
              If you receive a wrong, damaged, or defective product, you must contact us{' '}
              <strong>within 1 day of receiving your order</strong>.
            </p>
            <p>Requests received after this period may not be accepted.</p>
          </section>

          <section>
            <h2>2. Unboxing Video is Mandatory</h2>
            <p>
              A clear <strong>unboxing video is mandatory</strong> for any claim related to a
              wrong, damaged, or defective product.
            </p>
            <p>The video should clearly show:</p>
            <ul>
              <li>The unopened package</li>
              <li>Shipping label/order details</li>
              <li>The complete unboxing process</li>
              <li>The product received and the issue/damage</li>
            </ul>
            <p>
              Without a valid unboxing video, we may not be able to approve the replacement
              request.
            </p>
          </section>

          <section>
            <h2>3. Eligible Replacement Cases</h2>
            <p>A replacement may be approved in the following situations:</p>
            <h3>Wrong Product Received</h3>
            <p>
              If you receive a product different from what you ordered, you may request a
              replacement.
            </p>
            <h3>Damaged Product</h3>
            <p>
              If your product arrives damaged, please contact us immediately with the required
              unboxing video and photographs.
            </p>
            <h3>Defective Product</h3>
            <p>
              If the product has a manufacturing defect, you may request a replacement subject to
              inspection and approval.
            </p>
            <p>All replacement requests are reviewed by our team before approval.</p>
          </section>

          <section>
            <h2>4. Products Not Eligible for Replacement</h2>
            <p>Replacement requests will not be accepted in the following cases:</p>
            <ul>
              <li>Product damaged due to customer handling or misuse</li>
              <li>Product that has been washed, altered, or modified</li>
              <li>Product that has been worn or used</li>
              <li>Product returned without its original packaging</li>
              <li>Product returned without the original box, inserts, or accessories</li>
              <li>Product not returned in the same condition in which it was received</li>
              <li>Claims submitted after the 1-day replacement period</li>
              <li>Products purchased during sale/clearance offers, wherever specifically mentioned</li>
              <li>Gift cards</li>
              <li>
                Products specifically marked as non-returnable/non-replaceable on the product page
              </li>
            </ul>
          </section>

          <section>
            <h2>5. Size &amp; Personal Preference</h2>
            <p>
              We do <strong>not accept returns or replacements due to size issues, change of mind, personal preference, or incorrect size selection</strong>, unless specifically mentioned otherwise on the product page.
            </p>
            <p>Please carefully check the product size and specifications before placing your order.</p>
          </section>

          <section>
            <h2>6. Premium &amp; Special Products</h2>
            <p>
              Certain products, including selected <strong>Premium Range products and Nepali Rudraksha products</strong>, may have special replacement terms.
            </p>
            <p>
              Premium Range products are not eligible for refunds. However, eligible Premium Range
              products may be covered under our <strong>6-month replacement policy</strong> as
              described below.
            </p>
            <p>Please check the individual product page for product-specific terms.</p>
          </section>

          <section>
            <h2>7. 6-Month Color Fading Replacement</h2>
            <p>
              Eligible products are covered by a{' '}
              <strong>one-time 6-month replacement policy for color fading issues</strong>.
            </p>
            <p>If your eligible product experiences color fading within 6 months of delivery:</p>
            <ol>
              <li>Contact our support team.</li>
              <li>Share clear photographs of the product.</li>
              <li>Our team will review the claim.</li>
              <li>If approved, we will arrange a one-time replacement.</li>
              <li>
                A <strong>₹100 shipping and handling fee</strong> will apply and must be paid in
                advance.
              </li>
            </ol>
            <p>Cash on Delivery is not available for the ₹100 shipping and handling fee.</p>
            <p>
              <strong>Important:</strong> Physical damage to the product is not covered under this
              6-month color fading replacement policy.
            </p>
          </section>

          <section>
            <h2>8. Partial Prepaid COD Orders</h2>
            <p>
              For Cash on Delivery orders where a <strong>₹59 partial prepaid amount</strong> has
              been paid, this amount is <strong>non-refundable</strong>.
            </p>
            <p>
              In case the order is returned to origin (RTO), the partial prepaid amount may be used
              toward a future order, subject to our applicable terms.
            </p>
          </section>

          <section>
            <h2>9. Return &amp; Replacement Process</h2>
            <p>To request a return or replacement:</p>
            <ol>
              <li>Initiate your request using our return/exchange process.</li>
              <li>Provide your order number and registered phone number/email.</li>
              <li>Upload clear photographs and the required unboxing video.</li>
              <li>Explain the issue with your order.</li>
              <li>Our team will review your request.</li>
              <li>If approved, we will arrange a return pickup wherever the service is available.</li>
              <li>Once the product reaches us, it will be inspected.</li>
              <li>
                After successful inspection and approval, the eligible replacement or store credit
                will be processed.
              </li>
            </ol>
            <p>
              If return pickup is not available at your pincode, you may be required to courier the
              product back to us at your own expense.
            </p>
            <p>Replacement will be processed after the product is received and successfully inspected.</p>
          </section>

          <section>
            <h2>10. Refunds</h2>
            <p>
              <strong>
                {SITE_NAME} generally does not provide refunds to UPI IDs or bank accounts for
                approved returns.
              </strong>
            </p>
            <p>
              Where applicable, approved returns may be issued as{' '}
              <strong>in-store wallet credit, discount code, or gift card</strong>, which can be
              used for a future purchase on {SITE_NAME}.
            </p>
            <h3>Exceptional Refund Cases</h3>
            <p>A refund to the original payment method may be considered in exceptional circumstances, such as:</p>
            <ul>
              <li>An order being delayed by multiple weeks; or</li>
              <li>Repeated delivery of incorrect or damaged products despite previous replacements.</li>
            </ul>
            <p>If a refund is approved, it will generally be processed to the <strong>original payment method</strong>.</p>
            <p>
              Once processed, the refund may take approximately <strong>4–5 business days</strong> to
              reflect in your account. Actual processing time may vary depending on your bank or
              payment gateway.
            </p>
          </section>

          <section>
            <h2>11. Prepaid Orders That Cannot Be Delivered</h2>
            <p>
              For prepaid orders where delivery cannot be completed because the customer is
              unavailable or the courier is unable to deliver the order, the applicable refund may
              be provided as{' '}
              <strong>in-store wallet credit after deduction of applicable shipping charges</strong>,
              subject to our policy.
            </p>
            <p>
              Customers are requested to ensure that the delivery address and contact details
              provided during checkout are accurate.
            </p>
          </section>

          <section>
            <h2>12. COD Payment Disclaimer</h2>
            <p>
              Customers are requested to verify the COD amount displayed on the order/courier bill
              before making payment.
            </p>
            <p>
              <strong>{SITE_NAME}</strong> will not be responsible for any additional amount paid to
              a courier partner due to failure to verify the payable COD amount.
            </p>
          </section>

          <section>
            <h2>13. Inspection &amp; Final Decision</h2>
            <p>All replacement and return requests are subject to verification and inspection.</p>
            <p>Our team may consider:</p>
            <ul>
              <li>Unboxing video</li>
              <li>Product photographs</li>
              <li>Condition of the product</li>
              <li>Original packaging</li>
              <li>Order details</li>
              <li>Nature of the issue</li>
            </ul>
            <p>
              The final decision regarding eligibility for replacement, return, store credit, or
              refund will be made by the <strong>{SITE_NAME}</strong> support team.
            </p>
          </section>

          <section>
            <h2>14. Contact Us</h2>
            <p>
              If you receive a damaged, defective, or incorrect product, please contact us{' '}
              <strong>as soon as possible and within 1 day of delivery</strong>.
            </p>
            <p>
              For support regarding an existing return or replacement request, write to{' '}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
            <p>
              <strong>{SITE_NAME}</strong>
              <br />
              India
            </p>
            <p>
              We reserve the right to update or modify this Refund &amp; Replacement Policy from
              time to time. Any changes will be published on this page.
            </p>
            <p>
              <Link href="/shop">Back to shop</Link>
            </p>
          </section>
    </PolicyFrame>
  )
}
