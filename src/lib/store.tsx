'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import * as db from '@/lib/supabase/repositories'
import { onAuthStateChange, signOut } from '@/lib/supabase/auth'
import type { Expense, Budget } from '@/types'

interface AppState {
  expenses: Expense[]
  budget: Budget
  isLoggedIn: boolean
  userId: string | null
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>
  updateExpense: (id: string, changes: Partial<Expense>) => Promise<void>
  deleteExpense: (id: string) => Promise<void>
  setBudget: (monthlyLimit: number) => Promise<void>
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [budget, setBudgetState] = useState<Budget>(DEFAULT_BUDGET)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange(async (id) => {
      setUserId(id)
      if (id) {
        try {
          const [expensesData, budgetData] = await Promise.all([
            db.getExpenses(id),
            db.getBudget(id),
          ])
          setExpenses(expensesData)
          if (budgetData) setBudgetState(budgetData)
        } catch (err) {
          console.error('Failed to load from Supabase', err)
        } finally {
          setIsLoading(false)
        }
      } else {
        setExpenses([])
        setBudgetState(DEFAULT_BUDGET)
        setIsLoading(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    if (!userId) return
    const newExpense = await db.addExpense({ ...expense, userId })
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

  const setBudget = async (monthlyLimit: number) => {
    if (!userId) return
    const updated: Budget = {
      ...budget,
      userId,
      monthlyLimit,
      updatedAt: new Date().toISOString(),
    }
    await db.upsertBudget(updated)
    setBudgetState(updated)
  }

  const logout = async () => {
    await signOut()
    setUserId(null)
    setExpenses([])
  }

  if (isLoading) return null

  return (
    <AppContext.Provider value={{ expenses, budget, isLoggedIn: !!userId, userId, addExpense, updateExpense, deleteExpense, setBudget, logout, isLoading }}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppState = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppState must be used within AppProvider')
  return context
}
