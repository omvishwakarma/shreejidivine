export function normalizeCategoryAssignments(list) {
  const raw = Array.isArray(list) ? list : []
  const seen = new Set()
  const assignments = []

  for (const item of raw) {
    const categorySlug = String(item?.categorySlug || '').trim()
    const subcategorySlug = String(item?.subcategorySlug || '').trim()
    if (!categorySlug) continue
    const key = `${categorySlug}::${subcategorySlug}`
    if (seen.has(key)) continue
    seen.add(key)
    assignments.push({ categorySlug, subcategorySlug })
    if (assignments.length >= 12) break
  }

  return assignments
}

export function categoryAssignmentsForProduct(product) {
  const stored = normalizeCategoryAssignments(product?.categoryAssignments)
  if (stored.length) return stored
  const categorySlug = String(product?.categorySlug || '').trim()
  if (!categorySlug) return []
  return [
    {
      categorySlug,
      subcategorySlug: String(product?.subcategorySlug || '').trim(),
    },
  ]
}

export function primaryCategoryFields(assignments) {
  const first = assignments[0] || { categorySlug: '', subcategorySlug: '' }
  return {
    categorySlug: first.categorySlug || '',
    subcategorySlug: first.subcategorySlug || '',
    category: first.categorySlug === 'divine' ? 'kits' : 'singles',
  }
}

export function applyCategoryAssignments(data) {
  const assignments = Array.isArray(data.categoryAssignments)
    ? normalizeCategoryAssignments(data.categoryAssignments)
    : categoryAssignmentsForProduct(data)
  const primary = primaryCategoryFields(assignments)
  return {
    ...data,
    categoryAssignments: assignments,
    categorySlug: primary.categorySlug,
    subcategorySlug: primary.subcategorySlug,
    category: assignments.length ? primary.category : data.category || 'singles',
  }
}

export function categoryMatchQuery(category, subcategory) {
  if (subcategory) {
    return {
      $or: [
        { subcategorySlug: subcategory },
        { 'categoryAssignments.subcategorySlug': subcategory },
      ],
    }
  }
  if (category) {
    return {
      $or: [
        { categorySlug: category },
        { subcategorySlug: category },
        { 'categoryAssignments.categorySlug': category },
        { 'categoryAssignments.subcategorySlug': category },
      ],
    }
  }
  return null
}
