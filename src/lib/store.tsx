'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import * as db from '@/lib/supabase/repositories'
import { onAuthStateChange, getSession, signOut } from '@/lib/supabase/auth'
import type { Expense, Budget, Category } from '@/types'

interface AppState {
  expenses: Expense[]
  budget: Budget
  budgets: Record<string, Budget>
  categories: Category[]
  hasCompletedOnboarding: boolean
  isLoggedIn: boolean
  userId: string | null
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'userId'>) => Promise<void>
  updateExpense: (id: string, changes: Partial<Expense>) => Promise<void>
  deleteExpense: (id: string) => Promise<void>
  setBudget: (monthlyLimit: number, currency?: string) => Promise<void>
  addCategory: (cat: { name: string; icon: string; color: string }) => Promise<void>
  updateCategory: (id: string, changes: Partial<Pick<Category, 'name' | 'icon' | 'color'>>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  addCurrency: (currency: string) => Promise<void>
  removeCurrency: (currency: string) => Promise<void>
  completeOnboarding: (currency: string, monthlyLimit: number) => Promise<void>
  logout: () => Promise<{ error: string | null }>
  isLoading: boolean
}

const AppContext = createContext<AppState | undefined>(undefined)

const DEFAULT_BUDGET: Budget = {
  userId: '',
  monthlyLimit: 500,
  currency: 'S/',
  updatedAt: new Date().toISOString(),
}

async function loadUserData(id: string) {
  const [expensesData, budgetsData, categoriesData, profileData] = await Promise.all([
    db.getExpenses(id),
    db.getBudgets(id),
    db.getCategories(id),
    db.getProfileOnboarding(id),
  ])
  return { expenses: expensesData, budgets: budgetsData, categories: categoriesData, profile: profileData }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [budget, setBudgetState] = useState<Budget>(DEFAULT_BUDGET)
  const [budgets, setBudgets] = useState<Record<string, Budget>>({})
  const [categories, setCategories] = useState<Category[]>([])
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const applySession = useCallback((id: string | null) => {
    setUserId(id)
    if (id) {
      loadUserData(id)
        .then(({ expenses: e, budgets: bs, categories: cats, profile }) => {
          setExpenses(e)
          setCategories(cats)
          setHasCompletedOnboarding(profile.hasCompletedOnboarding)
          const budgetsMap: Record<string, Budget> = {}
          for (const b of bs) {
            budgetsMap[b.currency] = b
          }
          setBudgets(budgetsMap)
          const currencyKey = profile.primaryCurrency || budget.currency
          const primaryBudget = budgetsMap[currencyKey]
          if (primaryBudget) {
            setBudgetState(primaryBudget)
          } else if (bs.length > 0) {
            setBudgetState(bs[0])
          }
          setIsLoading(false)
        })
        .catch((err) => {
          console.error('Failed to load from Supabase', err)
          setIsLoading(false)
        })
    } else {
      setExpenses([])
      setBudgetState(DEFAULT_BUDGET)
      setBudgets({})
      setCategories([])
      setHasCompletedOnboarding(false)
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    getSession().then((session) => {
      applySession(session?.user?.id ?? null)
    })

    const { data: { subscription } } = onAuthStateChange((id) => {
      applySession(id)
    })
    return () => subscription.unsubscribe()
  }, [applySession])

  const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt' | 'userId'>) => {
    if (!userId) return
    const newExpense = await db.addExpense({ ...expense, userId, currency: expense.currency || budget.currency })
    setExpenses((prev) => [newExpense, ...prev])
  }

  const updateExpense = async (id: string, changes: Partial<Expense>) => {
    if (!userId) return
    await db.updateExpense(id, userId, changes)
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...changes } : e))
  }

  const deleteExpense = async (id: string) => {
    if (!userId) return
    await db.deleteExpense(id, userId)
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }

  const setBudget = async (monthlyLimit: number, currency?: string) => {
    if (!userId) return
    if (isNaN(monthlyLimit) || monthlyLimit <= 0) return
    const targetCurrency = currency || budget.currency
    const updated: Budget = {
      ...budget,
      userId,
      monthlyLimit,
      currency: targetCurrency,
      updatedAt: new Date().toISOString(),
    }
    await db.upsertBudget(updated)
    setBudgets((prev) => ({ ...prev, [targetCurrency]: updated }))
    if (targetCurrency === budget.currency) {
      setBudgetState(updated)
    }
  }

  const addCurrency = async (currency: string) => {
    if (!userId) return
    if (budgets[currency]) return // Ya existe
    const newBudget: Budget = {
      userId,
      monthlyLimit: 0,
      currency,
      updatedAt: new Date().toISOString(),
    }
    await db.upsertBudget(newBudget)
    setBudgets((prev) => ({ ...prev, [currency]: newBudget }))
  }

  const removeCurrency = async (currency: string) => {
    if (!userId) return
    if (currency === budget.currency) return // No se puede eliminar la principal
    // Eliminar gastos de esa moneda
    await db.deleteExpensesByCurrency(userId, currency)
    // Eliminar el presupuesto
    await db.deleteBudgetByCurrency(userId, currency)
    // Actualizar estado local
    setBudgets((prev) => {
      const next = { ...prev }
      delete next[currency]
      return next
    })
    setExpenses((prev) => prev.filter((e) => e.currency !== currency))
  }

  const addCategory = async (cat: { name: string; icon: string; color: string }) => {
    if (!userId) return
    const newCat = await db.addCategory({ ...cat, userId })
    setCategories((prev) => [...prev, newCat])
  }

  const updateCategory = async (id: string, changes: Partial<Pick<Category, 'name' | 'icon' | 'color'>>) => {
    if (!userId) return
    await db.updateCategory(id, userId, changes)
    setCategories((prev) => prev.map((c) => c.id === id ? { ...c, ...changes } : c))
  }

  const deleteCategory = async (id: string) => {
    if (!userId) return
    const otros = categories.find((c) => c.isProtected)
    if (!otros) return
    await db.deleteCategory(id, userId, otros.id)
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }

  const completeOnboarding = async (currency: string, monthlyLimit: number) => {
    if (!userId) return
    await setBudget(monthlyLimit, currency)
    await db.completeOnboardingProfile(userId, currency)
    setHasCompletedOnboarding(true)
  }

  const logout = async (): Promise<{ error: string | null }> => {
    const { error } = await signOut()
    if (error) return { error: error.message }
    setUserId(null)
    setExpenses([])
    setCategories([])
    return { error: null }
  }

  if (isLoading) return null

  return (
    <AppContext.Provider value={{
      expenses, budget, budgets, categories, hasCompletedOnboarding,
      isLoggedIn: !!userId, userId,
      addExpense, updateExpense, deleteExpense, setBudget,
      addCategory, updateCategory, deleteCategory,
      addCurrency, removeCurrency,
      completeOnboarding,
      logout, isLoading
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppState = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppState must be used within AppProvider')
  return context
}
