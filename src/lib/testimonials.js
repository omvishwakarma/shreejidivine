/**
 * Homepage testimonials — defaults + helpers.
 * Live reviews are stored in StoreSettings (admin-managed).
 */

export const DEFAULT_TESTIMONIALS = [
  {
    id: 'poojamayurparmar',
    title: 'Beautiful fragrance for home',
    quote:
      'Shreeji Divine aroma stones make our home feel calm and divine. Soft fragrance that lasts — perfect for daily pooja.',
    name: 'Pooja Mayur Parmar',
    handle: '@poojamayurparmar',
    photo: '/images/reviews/poojamayurparmar.jpg',
    instagram: 'https://www.instagram.com/poojamayurparmar/',
    active: true,
    sortOrder: 0,
  },
  {
    id: '_vp_parmar_',
    title: 'Premium quality',
    quote:
      'Very nice packaging and pure fragrance. Royal Chandan smells sacred — highly recommend for gifting too.',
    name: 'Vishnu Parmar',
    handle: '@_vp_parmar_',
    photo: '/images/reviews/_vp_parmar_.jpg',
    instagram: 'https://www.instagram.com/_vp_parmar_/',
    active: true,
    sortOrder: 1,
  },
  {
    id: 'urmii_empire',
    title: 'Love the aroma',
    quote:
      'Mogra Royale is so soothing. Smoke-free and easy to use — my go-to for evening rituals at home.',
    name: 'Urvashi Bhatia',
    handle: '@urmii_empire',
    photo: '/images/reviews/urmii_empire.jpg',
    instagram: 'https://www.instagram.com/urmii_empire/',
    active: true,
    sortOrder: 2,
  },
  {
    id: '_vaishnavi_.23',
    title: 'My favourite scent',
    quote:
      'Lavender Bliss is refreshing after a long day. The aroma stone looks beautiful and the scent is gentle, not overpowering.',
    name: 'Vaishnavi Gupta',
    handle: '@_vaishnavi_.23',
    photo: '/images/reviews/_vaishnavi_.23.jpg',
    instagram: 'https://www.instagram.com/_vaishnavi_.23/',
    active: true,
    sortOrder: 3,
  },
  {
    id: 'gupta_sakshiiiii',
    title: 'Perfect for gifting',
    quote:
      'Ordered the Divine Ritual Kit for family — everyone loved it. Feels premium and smells divine.',
    name: 'Sakshi Gupta',
    handle: '@gupta_sakshiiiii',
    photo: '/images/reviews/gupta_sakshiiiii.jpg',
    instagram: 'https://www.instagram.com/gupta_sakshiiiii/',
    active: true,
    sortOrder: 4,
  },
  {
    id: 'nishivikrantgupta',
    title: 'Truly divine fragrance',
    quote:
      'Rose Majesty creates such a peaceful atmosphere. Will definitely order again for festivals.',
    name: 'Nishi Gupta',
    handle: '@nishivikrantgupta',
    photo: '/images/reviews/nishivikrantgupta.jpg',
    instagram: 'https://www.instagram.com/nishivikrantgupta/',
    active: true,
    sortOrder: 5,
  },
  {
    id: 'anamikagupta____',
    title: 'So calming',
    quote:
      'The fragrance fills the room gently and lasts long. Feels peaceful every time I light the aroma stone.',
    name: 'Anamika Gupta',
    handle: '@anamikagupta____',
    photo: '/images/reviews/anamikagupta____.jpg',
    instagram: 'https://www.instagram.com/anamikagupta____/',
    active: true,
    sortOrder: 6,
  },
  {
    id: 'path.prakriti',
    title: 'Natural and pure',
    quote:
      'Love how clean and natural the scent feels. Perfect for pooja room and everyday home fragrance.',
    name: 'Prakriti Path',
    handle: '@path.prakriti',
    photo: '/images/reviews/path.prakriti.jpg',
    instagram: 'https://www.instagram.com/path.prakriti/',
    active: true,
    sortOrder: 7,
  },
]

export function instagramHandleFromUrl(url) {
  const m = String(url || '').match(/instagram\.com\/([^/?#]+)/i)
  if (!m?.[1]) return ''
  const handle = m[1].replace(/^@/, '')
  return handle ? `@${handle}` : ''
}

export function normalizeTestimonial(raw, index = 0) {
  const instagram = String(raw?.instagram || '').trim()
  const handle =
    String(raw?.handle || '').trim() || instagramHandleFromUrl(instagram) || ''
  const id =
    String(raw?.id || '').trim() ||
    handle.replace(/^@/, '') ||
    `review-${index}`

  return {
    id,
    title: String(raw?.title || '').trim() || 'Customer review',
    quote: String(raw?.quote || '').trim(),
    name: String(raw?.name || '').trim() || 'Customer',
    handle,
    photo: String(raw?.photo || '').trim(),
    instagram,
    active: raw?.active !== false,
    sortOrder: Number.isFinite(Number(raw?.sortOrder)) ? Number(raw.sortOrder) : index,
  }
}

export function normalizeTestimonials(list) {
  const arr = Array.isArray(list) ? list : []
  const source = arr.length ? arr : DEFAULT_TESTIMONIALS
  return source
    .map((item, i) => normalizeTestimonial(item, i))
    .filter((item) => item.quote && item.name)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id))
}
