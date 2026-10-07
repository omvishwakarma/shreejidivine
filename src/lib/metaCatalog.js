import { SITE_NAME, SITE_URL } from './site'

const COLUMNS = [
  'id',
  'title',
  'description',
  'availability',
  'condition',
  'price',
  'sale_price',
  'link',
  'image_link',
  'additional_image_link',
  'brand',
  'product_type',
  'inventory',
]

export function catalogOrigin(request) {
  const host = (request.headers.get('x-forwarded-host') || request.headers.get('host') || '')
    .split(',')[0]
    .trim()
  if (host) {
    const proto =
      request.headers.get('x-forwarded-proto') ||
      (host.startsWith('localhost') || host.startsWith('127.') ? 'http' : 'https')
    return `${proto}://${host}`.replace(/\/$/, '')
  }
  return (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/$/, '')
}

function absoluteUrl(origin, src) {
  const value = String(src || '').trim()
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  if (value.startsWith('/')) return `${origin}${value}`
  return ''
}

function plainText(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function money(amount) {
  const n = Number(amount)
  if (!Number.isFinite(n) || n < 0) return ''
  return `${n.toFixed(2)} INR`
}

function csvCell(value) {
  const text = String(value ?? '').replace(/[\r\n]+/g, ' ').trim()
  return `"${text.replace(/"/g, '""')}"`
}

export function productToCatalogRow(product, origin) {
  const id = String(product.id || product._id || '').trim()
  const slug = String(product.slug || '').trim()
  const image = absoluteUrl(origin, product.image)
  if (!id || !slug || !image) return null

  const current = Number(product.price) || 0
  const compare = Number(product.compareAt) || 0
  const onSale = compare > current
  const gallery = (Array.isArray(product.gallery) ? product.gallery : [])
    .map((src) => absoluteUrl(origin, src))
    .filter((src) => src && src !== image)

  const description =
    plainText(product.description) || plainText(product.tagline) || plainText(product.name)
  const category = [product.category, product.stone].map(plainText).filter(Boolean).join(' > ')

  return {
    id,
    title: plainText(product.name).slice(0, 200),
    description: description.slice(0, 5000),
    availability: Number(product.stock) > 0 ? 'in stock' : 'out of stock',
    condition: 'new',
    price: money(onSale ? compare : current),
    sale_price: onSale ? money(current) : '',
    link: `${origin}/shop/${slug}`,
    image_link: image,
    additional_image_link: gallery.slice(0, 10).join(','),
    brand: SITE_NAME,
    product_type: category || 'Spiritual Wearables',
    inventory: String(Math.max(0, Math.floor(Number(product.stock) || 0))),
  }
}

export function catalogCsv(products, origin) {
  const rows = products.map((product) => productToCatalogRow(product, origin)).filter(Boolean)
  const lines = [
    COLUMNS.join(','),
    ...rows.map((row) => COLUMNS.map((key) => csvCell(row[key])).join(',')),
  ]
  return lines.join('\n')
}
