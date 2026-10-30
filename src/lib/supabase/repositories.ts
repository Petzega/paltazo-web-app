import supabase from './client'
import type { Expense, Budget, Category } from '@/types'

interface SupabaseExpenseRow {
  id: string
  user_id: string
  amount: string | number
  currency: string
  category_id: string
  description: string | null
  date: string
  created_at: string
  synced_at: string
}

interface SupabaseBudgetRow {
  id: string
  user_id: string
  currency: string
  monthly_limit: string | number
  created_at: string
  updated_at: string
}

interface SupabaseCategoryRow {
  id: string
  user_id: string
  name: string
  icon: string
  color: string
  is_default: boolean
  is_protected: boolean
}

function toCategory(row: SupabaseCategoryRow): Category {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    isDefault: row.is_default,
    isProtected: row.is_protected,
  }
}

// ── Categories ──

export async function getCategories(userId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('name')

  if (error) throw error
  return data.map((row: SupabaseCategoryRow) => toCategory(row))
}

export async function addCategory(cat: Omit<Category, 'id' | 'userId' | 'isDefault' | 'isProtected'> & { userId: string }) {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      user_id: cat.userId,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
    })
    .select()
    .single()

  if (error) throw error
  return toCategory(data as SupabaseCategoryRow)
}

export async function updateCategory(id: string, userId: string, changes: Partial<Pick<Category, 'name' | 'icon' | 'color'>>) {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (changes.name !== undefined) payload.name = changes.name
  if (changes.icon !== undefined) payload.icon = changes.icon
  if (changes.color !== undefined) payload.color = changes.color

  const { error } = await supabase.from('categories').update(payload).eq('id', id).eq('user_id', userId)
  if (error) throw error
}

export async function deleteCategory(id: string, userId: string, otrosId: string) {
  // Reasignar gastos a "Otros" antes de borrar (CU-026)
  const { error: reassignError } = await supabase
    .from('expenses')
    .update({ category_id: otrosId })
    .eq('category_id', id)
    .eq('user_id', userId)

  if (reassignError) throw reassignError

  const { error } = await supabase.from('categories').delete().eq('id', id).eq('user_id', userId)
  if (error) throw error
}

// ── Expenses ──

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
    categoryId: row.category_id,
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
      user_id: expense.userId,
      amount: expense.amount,
      currency: expense.currency,
      category_id: expense.categoryId,
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
    categoryId: data.category_id,
    description: data.description ?? undefined,
    date: data.date,
    createdAt: data.created_at,
    syncedAt: data.synced_at,
  }
}

export async function updateExpense(id: string, userId: string, changes: Partial<Expense>) {
  const payload: Record<string, unknown> = { synced_at: new Date().toISOString() }
  if (changes.amount !== undefined) payload.amount = changes.amount
  if (changes.currency !== undefined) payload.currency = changes.currency
  if (changes.categoryId !== undefined) payload.category_id = changes.categoryId
  if (changes.description !== undefined) payload.description = changes.description
  if (changes.date !== undefined) payload.date = changes.date

  const { error } = await supabase.from('expenses').update(payload).eq('id', id).eq('user_id', userId)
  if (error) throw error
}

export async function deleteExpense(id: string, userId: string) {
  const { error } = await supabase.from('expenses').delete().eq('id', id).eq('user_id', userId)
  if (error) throw error
}

// ── Budgets ──

export async function getBudgets(userId: string): Promise<Budget[]> {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error
  return data.map((row: SupabaseBudgetRow) => ({
    userId: row.user_id,
    monthlyLimit: Number(row.monthly_limit),
    currency: row.currency,
    updatedAt: row.updated_at,
  }))
}

export async function upsertBudget(budget: Budget) {
  const { error } = await supabase
    .from('budgets')
    .upsert({
      user_id: budget.userId,
      currency: budget.currency,
      monthly_limit: budget.monthlyLimit,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,currency'
    })

  if (error) throw error
}

export async function deleteBudgetByCurrency(userId: string, currency: string) {
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('user_id', userId)
    .eq('currency', currency)

  if (error) throw error
}

export async function deleteExpensesByCurrency(userId: string, currency: string) {
  const { count, error } = await supabase
    .from('expenses')
    .delete({ count: 'exact' })
    .eq('user_id', userId)
    .eq('currency', currency)

  if (error) throw error
  return count ?? 0
}

export async function countExpensesByCurrency(userId: string, currency: string): Promise<number> {
  const { count, error } = await supabase
    .from('expenses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('currency', currency)

  if (error) throw error
  return count ?? 0
}

export async function countExpensesByCategory(userId: string, categoryId: string): Promise<number> {
  const { count, error } = await supabase
    .from('expenses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('category_id', categoryId)

  if (error) throw error
  return count ?? 0
}

// ── Profile Onboarding ──

export async function getProfileOnboarding(userId: string): Promise<{ hasCompletedOnboarding: boolean; primaryCurrency: string | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('has_completed_onboarding, primary_currency')
    .eq('id', userId)
    .single()

  if (error) throw error
  return {
    hasCompletedOnboarding: data.has_completed_onboarding ?? false,
    primaryCurrency: data.primary_currency ?? null,
  }
}

export async function completeOnboardingProfile(userId: string, currency: string) {
  const { error } = await supabase
    .from('profiles')
    .update({
      has_completed_onboarding: true,
      primary_currency: currency,
    })
    .eq('id', userId)

  if (error) throw error
}
