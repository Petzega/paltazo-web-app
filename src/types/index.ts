export interface Category {
  id: string
  userId: string
  name: string
  icon: string
  color: string
  isDefault: boolean
  isProtected: boolean
}

export interface Expense {
  id: string
  userId: string
  amount: number
  currency: string
  categoryId: string
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
