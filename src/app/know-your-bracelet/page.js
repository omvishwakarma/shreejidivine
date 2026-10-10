import KnowYourBraceletClient from './KnowYourBraceletClient'

export const metadata = {
  title: 'Know Your Product',
  description:
    'Pick your rashi and what you are seeking. Shreeji Divine matches a bracelet, mala, or fragrance for health, wealth, love, or protection.',
  alternates: { canonical: '/know-your-bracelet' },
}

export default function KnowYourBraceletPage() {
  return <KnowYourBraceletClient />
}
