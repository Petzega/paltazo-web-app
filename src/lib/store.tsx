'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { expenseRepo, budgetRepo } from '@/lib/repositories/expense-repository'
import type { Expense, Budget } from '@/types'

interface AppState {
  expenses: Expense[]
  budget: Budget
  isLoggedIn: boolean
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>
  updateExpense: (id: string, changes: Partial<Expense>) => Promise<void>
  deleteExpense: (id: string) => Promise<void>
  setBudget: (monthlyLimit: number) => Promise<void>
  login: () => void
  logout: () => void
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
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem('paltazo_logged_in') === 'true')

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

  const updateExpense = async (id: string, changes: Partial<Expense>) => {
    await expenseRepo.update(id, changes)
    const allExpenses = await expenseRepo.getAll(DEFAULT_USER_ID)
    setExpenses(allExpenses)
  }

  const deleteExpense = async (id: string) => {
    await expenseRepo.delete(id)
    setExpenses((prev) => prev.filter((e) => e.id !== id))
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

  const login = () => {
    localStorage.setItem('paltazo_logged_in', 'true')
    setIsLoggedIn(true)
  }

  const logout = () => {
    localStorage.removeItem('paltazo_logged_in')
    setIsLoggedIn(false)
  }

  if (isLoading) return null

  return (
    <AppContext.Provider value={{ expenses, budget, isLoggedIn, addExpense, updateExpense, deleteExpense, setBudget, login, logout, isLoading }}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppState = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppState must be used within AppProvider')
  return context
}
