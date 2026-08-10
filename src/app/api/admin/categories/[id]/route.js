import { NextResponse } from 'next/server'
import { z } from 'zod'
import { dbConnect, requireAdmin } from '@/lib/mongo/auth'
import { Category, slugifyCategory } from '@/lib/mongo/Category'
import { Product } from '@/lib/mongo/Product'

export async function PATCH(request, { params }) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error

  try {
    await dbConnect()
    const { id } = await params
    const schema = z.object({
      name: z.string().min(2).optional(),
      slug: z.string().optional(),
      parent: z.string().nullable().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
      sortOrder: z.number().int().optional(),
      active: z.boolean().optional(),
      showInNav: z.boolean().optional(),
      showInHome: z.boolean().optional(),
    })
    const data = schema.parse(await request.json())
    const category = await Category.findById(id)
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    if (data.name !== undefined) category.name = data.name
    if (data.slug !== undefined) {
      const slug = slugifyCategory(data.slug)
      const clash = await Category.findOne({ slug, _id: { $ne: id } })
      if (clash) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
      }
      category.slug = slug
    }
    if (data.parent !== undefined) {
      if (data.parent === null || data.parent === '') {
        category.parent = null
      } else {
        if (String(data.parent) === String(id)) {
          return NextResponse.json({ error: 'Category cannot be its own parent' }, { status: 400 })
        }
        const parentDoc = await Category.findById(data.parent)
        if (!parentDoc || parentDoc.parent) {
          return NextResponse.json({ error: 'Invalid parent category' }, { status: 400 })
        }
        const hasChildren = await Category.exists({ parent: id })
        if (hasChildren) {
          return NextResponse.json(
            { error: 'Move or delete subcategories before nesting this category' },
            { status: 400 }
          )
        }
        category.parent = parentDoc._id
      }
    }
    if (data.description !== undefined) category.description = data.description
    if (data.image !== undefined) category.image = data.image
    if (data.sortOrder !== undefined) category.sortOrder = data.sortOrder
    if (data.active !== undefined) category.active = data.active
    if (data.showInNav !== undefined) category.showInNav = data.showInNav
    if (data.showInHome !== undefined) category.showInHome = data.showInHome

    await category.save()
    return NextResponse.json({ category: category.toJSONSafe() })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors?.[0]?.message || err.issues?.[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    console.error(err)
    return NextResponse.json({ error: 'Could not update category' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error
  await dbConnect()
  const { id } = await params

  const childCount = await Category.countDocuments({ parent: id })
  if (childCount > 0) {
    return NextResponse.json(
      { error: 'Delete subcategories first' },
      { status: 400 }
    )
  }

  const category = await Category.findById(id)
  if (!category) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 })
  }

  const inUse = await Product.countDocuments({
    $or: [{ categorySlug: category.slug }, { subcategorySlug: category.slug }],
  })
  if (inUse > 0) {
    return NextResponse.json(
      { error: `Category is used by ${inUse} product(s). Reassign them first.` },
      { status: 400 }
    )
  }

  await Category.findByIdAndDelete(id)
  return NextResponse.json({ ok: true })
}
