'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { expenseRepo, budgetRepo } from '@/lib/repositories/expense-repository'
import type { Expense, Budget } from '@/types'

interface AppState {
  expenses: Expense[]
  budget: Budget
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>
  setBudget: (monthlyLimit: number) => Promise<void>
  isLoading: boolean
}

const AppContext = createContext<AppState | undefined>(undefined)

const DEFAULT_USER_ID = 'default'

const DEFAULT_BUDGET: Budget = {
  userId: DEFAULT_USER_ID,
  monthlyLimit: 500,
  currency: 'S/',
  updatedAt: new Date().toISOString(),
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [budget, setBudgetState] = useState<Budget>(DEFAULT_BUDGET)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [expensesData, budgetData] = await Promise.all([
          expenseRepo.getAll(DEFAULT_USER_ID),
          budgetRepo.get(DEFAULT_USER_ID),
        ])

        setExpenses(expensesData)
        if (budgetData) setBudgetState(budgetData)
      } catch (err) {
        console.error('Failed to load from IndexedDB', err)
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense = await expenseRepo.add(expense)
    setExpenses((prev) => [newExpense, ...prev])
  }

  const setBudget = async (monthlyLimit: number) => {
    const updated: Budget = {
      ...budget,
      monthlyLimit,
      updatedAt: new Date().toISOString(),
    }
    await budgetRepo.upsert(updated)
    setBudgetState(updated)
  }

  if (isLoading) return null

  return (
    <AppContext.Provider value={{ expenses, budget, addExpense, setBudget, isLoading }}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppState = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppState must be used within AppProvider')
  return context
}
