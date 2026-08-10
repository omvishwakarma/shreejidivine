import { Category, slugifyCategory } from '@/lib/mongo/Category'

const DEFAULTS = [
  {
    name: 'Divine',
    slug: 'divine',
    description: 'Sacred fragrance for prayer and pooja',
    image: '/images/campaign/royal-chandan.jpg',
    sortOrder: 1,
    children: [
      {
        name: 'Ritual Kits',
        slug: 'ritual-kits',
        image: '/images/aroma-collection.png',
        sortOrder: 1,
      },
      {
        name: 'Fragrance Oils',
        slug: 'fragrance-oils',
        image: '/images/campaign/mogra-product.jpg',
        sortOrder: 2,
      },
      {
        name: 'Aroma Stones',
        slug: 'aroma-stones',
        image: '/images/campaign/divine-rose.jpg',
        sortOrder: 3,
      },
    ],
  },
  {
    name: 'Lifestyle',
    slug: 'lifestyle',
    description: 'Everyday calm for home and work',
    image: '/images/campaign/gilli-mitti-lifestyle.jpg',
    sortOrder: 2,
    children: [
      {
        name: 'Home Fragrance',
        slug: 'home-fragrance',
        image: '/images/campaign/peaceful-lavender.jpg',
        sortOrder: 1,
      },
      {
        name: 'Gifting',
        slug: 'gifting',
        image: '/images/campaign/mogra-bloom.jpg',
        sortOrder: 2,
      },
      {
        name: 'Office & Calm',
        slug: 'office-calm',
        image: '/images/campaign/gilli-mitti.jpg',
        sortOrder: 3,
      },
    ],
  },
]

/** Ensure default Divine / Lifestyle tree exists (idempotent). */
export async function ensureDefaultCategories() {
  const count = await Category.countDocuments()
  if (count > 0) return

  for (const parent of DEFAULTS) {
    const parentDoc = await Category.create({
      name: parent.name,
      slug: parent.slug,
      description: parent.description,
      image: parent.image,
      sortOrder: parent.sortOrder,
      parent: null,
      active: true,
      showInNav: true,
      showInHome: true,
    })
    for (const child of parent.children) {
      await Category.create({
        name: child.name,
        slug: child.slug || slugifyCategory(child.name),
        image: child.image || '',
        sortOrder: child.sortOrder,
        parent: parentDoc._id,
        active: true,
        showInNav: true,
        showInHome: true,
      })
    }
  }
}

/** Nested tree for nav / homepage / admin. */
export async function getCategoryTree({ navOnly = false, homeOnly = false, activeOnly = true } = {}) {
  await ensureDefaultCategories()
  const filter = {}
  if (activeOnly) filter.active = true
  if (navOnly) filter.showInNav = true
  if (homeOnly) filter.showInHome = true

  const all = await Category.find(filter).sort({ sortOrder: 1, name: 1 })
  const parents = all.filter((c) => !c.parent)
  const children = all.filter((c) => c.parent)

  return parents.map((p) => {
    const kids = children
      .filter((c) => String(c.parent) === String(p._id))
      .map((c) => c.toJSONSafe())
    return { ...p.toJSONSafe(), children: kids }
  })
}
