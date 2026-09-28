import { NextResponse } from 'next/server'
import { z } from 'zod'
import { dbConnect, requireAdmin } from '@/lib/mongo/auth'
import { Expense } from '@/lib/mongo/Expense'

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  type: z.enum(['ads', 'packaging', 'website', 'product', 'other']),
  amount: z.number().min(0),
  image: z.string().optional().default(''),
  date: z.string().min(8),
  spentBy: z.enum(['Sanket', 'Om', 'Vikrant']),
})

export async function GET(request) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error
  try {
    await dbConnect()
    const expenses = await Expense.find().sort({ date: -1, createdAt: -1 })
    return NextResponse.json({ expenses: expenses.map((item) => item.toJSONSafe()) })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Could not load expenses' }, { status: 500 })
  }
}

export async function POST(request) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error
  try {
    await dbConnect()
    const data = schema.parse(await request.json())
    const expense = await Expense.create({
      name: data.name,
      type: data.type,
      amount: data.amount,
      image: data.image || '',
      date: new Date(data.date),
      spentBy: data.spentBy,
    })
    return NextResponse.json({ expense: expense.toJSONSafe() }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors?.[0]?.message || err.issues?.[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    console.error(err)
    return NextResponse.json({ error: 'Could not save expense' }, { status: 500 })
  }
}
