import { NextResponse } from 'next/server'
import { z } from 'zod'
import { dbConnect, requireAdmin } from '@/lib/mongo/auth'
import { Expense } from '@/lib/mongo/Expense'

const schema = z.object({
  type: z.enum(['ads', 'packaging', 'website', 'product', 'other']),
  amount: z.number().min(0),
  image: z.string().optional().default(''),
  date: z.string().min(8),
  spentBy: z.enum(['Sanket', 'Om', 'Vikrant']),
})

export async function PATCH(request, { params }) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error
  try {
    await dbConnect()
    const { id } = await params
    const data = schema.parse(await request.json())
    const expense = await Expense.findByIdAndUpdate(
      id,
      {
        type: data.type,
        amount: data.amount,
        image: data.image || '',
        date: new Date(data.date),
        spentBy: data.spentBy,
      },
      { new: true, runValidators: true }
    )
    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }
    return NextResponse.json({ expense: expense.toJSONSafe() })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors?.[0]?.message || err.issues?.[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    console.error(err)
    return NextResponse.json({ error: 'Could not update expense' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error
  try {
    await dbConnect()
    const { id } = await params
    const expense = await Expense.findByIdAndDelete(id)
    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Could not delete expense' }, { status: 500 })
  }
}
