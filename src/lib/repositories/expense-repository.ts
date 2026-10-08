import { db } from '@/lib/db'
import type { Expense, Budget } from '@/types'

export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export interface ExpenseRepository {
  getAll(userId: string): Promise<Expense[]>
  add(expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense>
  update(id: string, changes: Partial<Expense>): Promise<void>
  delete(id: string): Promise<void>
}

export interface BudgetRepository {
  get(userId: string): Promise<Budget | undefined>
  upsert(budget: Budget): Promise<void>
}

export const expenseRepo: ExpenseRepository = {
  async getAll(userId) {
    return db.expenses
      .where('userId')
      .equals(userId)
      .reverse()
      .sortBy('date')
  },

  async add(data) {
    const expense: Expense = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    await db.expenses.add(expense)
    return expense
  },

  async delete(id) {
    await db.expenses.delete(id)
  },

  async update(id, changes) {
    await db.expenses.update(id, changes)
  },
}

export const budgetRepo: BudgetRepository = {
  async get(userId) {
    return db.budget.get(userId)
  },

  async upsert(budget) {
    await db.budget.put(budget)
  },
}
