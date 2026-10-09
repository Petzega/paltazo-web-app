import { createClient } from './client'
import { generateId } from '@/lib/repositories/expense-repository'
import type { Expense, Budget } from '@/types'

const supabase = createClient()

interface SupabaseExpenseRow {
  id: string
  user_id: string
  amount: string | number
  currency: string
  category: string
  description: string | null
  date: string
  created_at: string
  synced_at: string
}

interface SupabaseProfileRow {
  id: string
  monthly_budget: string | number
  currency: string
  created_at: string
}

export async function getExpenses(userId: string): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (error) throw error
  return data.map((row: SupabaseExpenseRow) => ({
    id: row.id,
    userId: row.user_id,
    amount: Number(row.amount),
    currency: row.currency,
    category: row.category as Expense['category'],
    description: row.description ?? undefined,
    date: row.date,
    createdAt: row.created_at,
    syncedAt: row.synced_at,
  }))
}

export async function addExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'syncedAt'>): Promise<Expense> {
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      id: generateId(),
      user_id: expense.userId,
      amount: expense.amount,
      currency: expense.currency,
      category: expense.category,
      description: expense.description ?? null,
      date: expense.date,
      created_at: now,
      synced_at: now,
    })
    .select()
    .single()

  if (error) throw error
  return {
    id: data.id,
    userId: data.user_id,
    amount: Number(data.amount),
    currency: data.currency,
    category: data.category,
    description: data.description ?? undefined,
    date: data.date,
    createdAt: data.created_at,
    syncedAt: data.synced_at,
  }
}

export async function updateExpense(id: string, changes: Partial<Expense>) {
  const payload: Record<string, unknown> = { synced_at: new Date().toISOString() }
  if (changes.amount !== undefined) payload.amount = changes.amount
  if (changes.currency !== undefined) payload.currency = changes.currency
  if (changes.category !== undefined) payload.category = changes.category
  if (changes.description !== undefined) payload.description = changes.description
  if (changes.date !== undefined) payload.date = changes.date

  const { error } = await supabase.from('expenses').update(payload).eq('id', id)
  if (error) throw error
}

export async function deleteExpense(id: string) {
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) throw error
}

export async function getBudget(userId: string): Promise<Budget | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  if (!data) return null

  const row = data as SupabaseProfileRow
  return {
    userId: row.id,
    monthlyLimit: Number(row.monthly_budget),
    currency: row.currency,
    updatedAt: row.created_at,
  }
}

export async function upsertBudget(budget: Budget) {
  const { error } = await supabase
    .from('profiles')
    .update({
      monthly_budget: budget.monthlyLimit,
      currency: budget.currency,
    })
    .eq('id', budget.userId)

  if (error) throw error
}
