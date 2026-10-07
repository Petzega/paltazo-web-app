export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'services'
  | 'entertainment'
  | 'other'

export type BudgetAlertLevel = 'warning' | 'critical' | 'exceeded'

export interface Expense {
  id: string
  userId: string
  amount: number
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

export interface BudgetAlert {
  id: string
  userId: string
  expenseId: string
  level: BudgetAlertLevel
  percentage: number
  createdAt: string
}

export interface Profile {
  id: string
  email: string
  displayName?: string
  monthlyBudget: number
  createdAt: string
}
