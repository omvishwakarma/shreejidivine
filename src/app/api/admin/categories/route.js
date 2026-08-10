import { NextResponse } from 'next/server'
import { z } from 'zod'
import { dbConnect, requireAdmin } from '@/lib/mongo/auth'
import { Category, slugifyCategory } from '@/lib/mongo/Category'
import { ensureDefaultCategories, getCategoryTree } from '@/lib/categories'

export async function GET(request) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error
  await dbConnect()
  await ensureDefaultCategories()
  const tree = await getCategoryTree({ activeOnly: false })
  const flat = await Category.find().sort({ sortOrder: 1, name: 1 })
  return NextResponse.json({
    categories: tree,
    flat: flat.map((c) => c.toJSONSafe()),
  })
}

export async function POST(request) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error

  try {
    await dbConnect()
    const schema = z.object({
      name: z.string().min(2),
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
    const slug = slugifyCategory(data.slug || data.name)
    if (!slug) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
    }
    const exists = await Category.findOne({ slug })
    if (exists) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }

    let parent = null
    if (data.parent) {
      const parentDoc = await Category.findById(data.parent)
      if (!parentDoc) {
        return NextResponse.json({ error: 'Parent category not found' }, { status: 400 })
      }
      if (parentDoc.parent) {
        return NextResponse.json(
          { error: 'Only one level of subcategories is supported' },
          { status: 400 }
        )
      }
      parent = parentDoc._id
    }

    const category = await Category.create({
      name: data.name,
      slug,
      parent,
      description: data.description || '',
      image: data.image || '',
      sortOrder: data.sortOrder ?? 0,
      active: data.active !== false,
      showInNav: data.showInNav !== false,
      showInHome: data.showInHome !== false,
    })

    return NextResponse.json({ category: category.toJSONSafe() }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors?.[0]?.message || err.issues?.[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    console.error(err)
    return NextResponse.json({ error: 'Could not create category' }, { status: 500 })
  }
}
