export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'services'
  | 'entertainment'
  | 'other'

export interface Expense {
  id: string
  userId: string
  amount: number
  currency: string
  category: ExpenseCategory
  description?: string
  date: string
  createdAt: string
  syncedAt?: string
}

export interface Budget {
  userId: string
  monthlyLimit: number
  currency: string
  updatedAt: string
}
