'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react'
import * as db from '@/lib/supabase/repositories'
import { onAuthStateChange, getSession, signOut } from '@/lib/supabase/auth'
import type { Expense, Budget, Category } from '@/types'
import * as offline from '@/lib/offline'

interface AppState {
  expenses: Expense[]
  budget: Budget
  budgets: Record<string, Budget>
  categories: Category[]
  hasCompletedOnboarding: boolean
  isLoggedIn: boolean
  userId: string | null
  isOnline: boolean
  pendingCount: number
  notificationPermission: NotificationPermission | 'unsupported'
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
  syncPending: () => Promise<void>
  requestNotificationPermission: () => Promise<NotificationPermission | 'unsupported'>
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
  const [isOnline, setIsOnline] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>(
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission
  )
  const syncInProgress = useRef(false)

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
    const now = new Date().toISOString()
    const tempId = crypto.randomUUID()
    const optimisticExpense: Expense = {
      ...expense,
      id: tempId,
      userId,
      currency: expense.currency || budget.currency,
      createdAt: now,
      syncedAt: undefined,
    }
    setExpenses((prev) => [optimisticExpense, ...prev])

    if (offline.isOnline()) {
      try {
        const newExpense = await db.addExpense(optimisticExpense)
        setExpenses((prev) => prev.map((e) => e.id === tempId ? newExpense : e))
        checkBudgetThreshold(optimisticExpense.currency, optimisticExpense.amount)
      } catch {
        await offline.addOperation({ type: 'addExpense', payload: expense })
        setPendingCount((prev) => prev + 1)
      }
    } else {
      await offline.addOperation({ type: 'addExpense', payload: expense })
      setPendingCount((prev) => prev + 1)
    }
  }

  const updateExpense = async (id: string, changes: Partial<Expense>) => {
    if (!userId) return
    setExpenses((prev) => prev.map((e) => e.id === id ? { ...e, ...changes } : e))
    
    if (offline.isOnline()) {
      try {
        await db.updateExpense(id, userId, changes)
      } catch {
        await offline.addOperation({ type: 'updateExpense', payload: { id, changes } })
        setPendingCount((prev) => prev + 1)
      }
    } else {
      await offline.addOperation({ type: 'updateExpense', payload: { id, changes } })
      setPendingCount((prev) => prev + 1)
    }
  }

  const deleteExpense = async (id: string) => {
    if (!userId) return
    setExpenses((prev) => prev.filter((e) => e.id !== id))
    
    if (offline.isOnline()) {
      try {
        await db.deleteExpense(id, userId)
      } catch {
        await offline.addOperation({ type: 'deleteExpense', payload: { id } })
        setPendingCount((prev) => prev + 1)
      }
    } else {
      await offline.addOperation({ type: 'deleteExpense', payload: { id } })
      setPendingCount((prev) => prev + 1)
    }
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
    // Transacción atómica: elimina gastos + presupuesto de esa moneda
    await db.deleteCurrencyWithPurge(userId, currency)
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

  const syncPending = async () => {
    if (syncInProgress.current || !userId) return
    syncInProgress.current = true
    try {
      const operations = await offline.getPendingOperations()
      for (const op of operations) {
        try {
          switch (op.type) {
            case 'addExpense':
              await db.addExpense({ ...(op.payload as Omit<Expense, 'id' | 'createdAt' | 'userId'>), userId })
              break
            case 'updateExpense': {
              const { id, changes } = op.payload as { id: string; changes: Partial<Expense> }
              await db.updateExpense(id, userId, changes)
              break
            }
            case 'deleteExpense': {
              const { id } = op.payload as { id: string }
              await db.deleteExpense(id, userId)
              break
            }
          }
          await offline.removeOperation(op.id)
          setPendingCount((prev) => prev - 1)
        } catch (err) {
          console.error(`Failed to sync operation ${op.id}`, err)
          break
        }
      }
    } finally {
      syncInProgress.current = false
    }
  }

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      syncPending()
    }
    const handleOffline = () => setIsOnline(false)
    
    setIsOnline(offline.isOnline())
    offline.getPendingOperations().then((ops) => setPendingCount(ops.length))
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    if (offline.isOnline() && userId) {
      syncPending()
    }
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [userId])

  const subscribeToPush = async () => {
    if (typeof Notification === 'undefined' || !('serviceWorker' in navigator)) return
    try {
      const reg = await navigator.serviceWorker.ready
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      })
      const { endpoint, keys } = subscription.toJSON()
      if (endpoint && keys?.p256dh && keys?.auth) {
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint, p256dh: keys.p256dh, auth: keys.auth }),
        })
      }
    } catch (err) {
      console.error('Failed to subscribe to push:', err)
    }
  }

  const requestNotificationPermission = async (): Promise<NotificationPermission | 'unsupported'> => {
    if (typeof Notification === 'undefined' || !('serviceWorker' in navigator)) {
      return 'unsupported'
    }
    const permission = await Notification.requestPermission()
    setNotificationPermission(permission)
    if (permission === 'granted') {
      await subscribeToPush()
    }
    return permission
  }

  const checkBudgetThreshold = (currency: string, amount: number) => {
    if (notificationPermission !== 'granted') return
    const currentBudget = budgets[currency]
    if (!currentBudget?.monthlyLimit) return
    const monthlySpent = expenses
      .filter((e) => {
        const expDate = new Date(e.createdAt)
        const now = new Date()
        return e.currency === currency && expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear()
      })
      .reduce((sum, e) => sum + e.amount, 0)
    const newTotal = monthlySpent + amount
    const threshold = currentBudget.monthlyLimit * 0.8
    if (newTotal >= threshold && monthlySpent < threshold) {
      new Notification('⚠️ Alerta de presupuesto', {
        body: `Has gastado ${Math.round((newTotal / currentBudget.monthlyLimit) * 100)}% de tu presupuesto mensual en ${currency}`,
        icon: '/icons/icon-192.png',
        tag: 'budget-alert',
      })
    }
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
      isLoggedIn: !!userId, userId, isOnline, pendingCount, notificationPermission,
      addExpense, updateExpense, deleteExpense, setBudget,
      addCategory, updateCategory, deleteCategory,
      addCurrency, removeCurrency,
      completeOnboarding,
      logout, syncPending, requestNotificationPermission, isLoading
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
