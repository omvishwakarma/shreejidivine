import mongoose from 'mongoose'

export const EXPENSE_TYPES = ['ads', 'packaging', 'website', 'product', 'other']
export const EXPENSE_BY = ['Sanket', 'Om', 'Vikrant']

const expenseSchema = new mongoose.Schema(
  {
    type: { type: String, enum: EXPENSE_TYPES, required: true },
    amount: { type: Number, required: true, min: 0 },
    image: { type: String, default: '' },
    date: { type: Date, required: true },
    spentBy: { type: String, enum: EXPENSE_BY, required: true },
  },
  { timestamps: true }
)

expenseSchema.methods.toJSONSafe = function () {
  return {
    id: this._id.toString(),
    type: this.type,
    amount: this.amount,
    image: this.image || '',
    date: this.date,
    spentBy: this.spentBy,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  }
}

if (mongoose.models.Expense) {
  delete mongoose.models.Expense
}

export const Expense = mongoose.model('Expense', expenseSchema)
