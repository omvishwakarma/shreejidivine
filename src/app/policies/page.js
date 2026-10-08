import Link from 'next/link'
import PolicyFrame from '../../components/PolicyFrame'
import { POLICIES } from '../../lib/policies'
import { SITE_NAME } from '../../lib/site'
import '../ecom.css'

export const metadata = {
  title: 'Policies',
  description: 'Refund, shipping, privacy, terms, cashback, and cancellation policies for Shreeji Divine.',
}

export default function PoliciesPage() {
  return (
    <PolicyFrame title="Policies">
      <p>These are the policies that apply when you shop with {SITE_NAME}.</p>
      <ul className="policy__list">
        {POLICIES.map((item) => (
          <li key={item.href}>
            <Link href={item.href}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </PolicyFrame>
  )
}
