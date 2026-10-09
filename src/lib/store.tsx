'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import * as db from '@/lib/supabase/repositories'
import { onAuthStateChange, getSession, signOut } from '@/lib/supabase/auth'
import type { Expense, Budget } from '@/types'

interface AppState {
  expenses: Expense[]
  budget: Budget
  budgets: Record<string, Budget>
  isLoggedIn: boolean
  userId: string | null
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>
  updateExpense: (id: string, changes: Partial<Expense>) => Promise<void>
  deleteExpense: (id: string) => Promise<void>
  setBudget: (monthlyLimit: number, currency?: string) => Promise<void>
  logout: () => Promise<void>
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
  const [expensesData, budgetData, budgetsData] = await Promise.all([
    db.getExpenses(id),
    db.getBudget(id),
    db.getBudgets(id),
  ])
  return { expenses: expensesData, budget: budgetData, budgets: budgetsData }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [budget, setBudgetState] = useState<Budget>(DEFAULT_BUDGET)
  const [budgets, setBudgets] = useState<Record<string, Budget>>({})
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const applySession = useCallback((id: string | null) => {
    setUserId(id)
    if (id) {
      loadUserData(id)
        .then(({ expenses: e, budget: b, budgets: bs }) => {
          setExpenses(e)
          if (b) setBudgetState(b)
          const budgetsMap: Record<string, Budget> = {}
          for (const budget of bs) {
            budgetsMap[budget.currency] = budget
          }
          setBudgets(budgetsMap)
        })
        .catch((err) => console.error('Failed to load from Supabase', err))
        .finally(() => setIsLoading(false))
    } else {
      setExpenses([])
      setBudgetState(DEFAULT_BUDGET)
      setBudgets({})
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

  const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    if (!userId) return
    const newExpense = await db.addExpense({ ...expense, userId, currency: expense.currency || budget.currency })
    setExpenses((prev) => [newExpense, ...prev])
  }

  const updateExpense = async (id: string, changes: Partial<Expense>) => {
    if (!userId) return
    await db.updateExpense(id, changes)
    const allExpenses = await db.getExpenses(userId)
    setExpenses(allExpenses)
  }

  const deleteExpense = async (id: string) => {
    await db.deleteExpense(id)
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }

  const setBudget = async (monthlyLimit: number, currency?: string) => {
    if (!userId) return
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

  const logout = async () => {
    await signOut()
    setUserId(null)
    setExpenses([])
  }

  if (isLoading) return null

  return (
    <AppContext.Provider value={{ expenses, budget, budgets, isLoggedIn: !!userId, userId, addExpense, updateExpense, deleteExpense, setBudget, logout, isLoading }}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppState = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppState must be used within AppProvider')
  return context
}
