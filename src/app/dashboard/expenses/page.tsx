'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppState } from '@/lib/store'
import { getCategoryInfo } from '@/lib/categories'
import type { Expense, ExpenseCategory } from '@/types'

export default function ExpensesPage() {
  const router = useRouter()
  const { expenses, budget, updateExpense, deleteExpense } = useAppState()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ amount: '', description: '', category: '' as ExpenseCategory, date: '' })

  const sorted = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const grouped = sorted.reduce<Record<string, Expense[]>>((acc, exp) => {
    const key = exp.date
    if (!acc[key]) acc[key] = []
    acc[key].push(exp)
    return acc
  }, {})

  const startEdit = (exp: Expense) => {
    setEditingId(exp.id)
    setEditForm({ amount: exp.amount.toString(), description: exp.description || '', category: exp.category, date: exp.date })
  }

  const saveEdit = async () => {
    if (!editingId || !editForm.amount || parseFloat(editForm.amount) <= 0) return
    await updateExpense(editingId, {
      amount: parseFloat(editForm.amount),
      description: editForm.description || undefined,
      category: editForm.category,
      date: editForm.date,
    })
    setEditingId(null)
  }

  const handleDelete = async (id: string) => {
    await deleteExpense(id)
    setEditingId(null)
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  return (
    <main className="min-h-screen bg-surface pb-24 md:pb-space-xl max-w-xl mx-auto md:max-w-none px-gutter md:px-space-xl">
      <div className="pt-16 md:pt-space-xl pb-6 flex flex-col">
        <div className="mb-space-md flex items-center justify-between">
          <div>
            <h1 className="text-headline-lg-mobile md:text-headline-xl text-on-surface font-bold tracking-tight">
              Mis gastos 🧾
            </h1>
            <p className="text-body-sm text-text-secondary mt-0.5">
              {expenses.length} {expenses.length === 1 ? 'registro' : 'registros'} este mes
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/add-expense')}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-on-secondary text-label-md font-semibold hover:bg-primary transition-all shadow-sm"
          >
            <span className="text-[18px]">➕</span>
            Agregar gasto
          </button>
        </div>

        <div className="mb-space-md p-space-md rounded-2xl bg-surface-container-lowest shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-label-sm text-text-secondary block">Total gastado</span>
              <span className="text-headline-sm text-on-surface font-bold">
                {budget.currency} {expenses.reduce((s, e) => s + e.amount, 0).toFixed(2)}
              </span>
            </div>
            <span className="text-label-sm text-text-secondary">
              Límite: {budget.currency} {budget.monthlyLimit.toFixed(2)}
            </span>
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="text-center py-space-xl flex flex-col items-center gap-space-md">
            <span className="text-5xl">📭</span>
            <p className="text-body-md text-on-surface-variant">No hay gastos registrados</p>
            <button
              onClick={() => router.push('/dashboard/add-expense')}
              className="text-label-lg text-secondary font-bold hover:text-primary"
            >
              + Agregar primer gasto
            </button>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-container-high">
                    <th className="text-left text-label-sm text-text-secondary font-semibold px-4 py-3">Fecha</th>
                    <th className="text-left text-label-sm text-text-secondary font-semibold px-4 py-3">Categoría</th>
                    <th className="text-left text-label-sm text-text-secondary font-semibold px-4 py-3">Descripción</th>
                    <th className="text-right text-label-sm text-text-secondary font-semibold px-4 py-3">Monto</th>
                    <th className="text-right text-label-sm text-text-secondary font-semibold px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((expense) => {
                    const catInfo = getCategoryInfo(expense.category)
                    const isEditing = editingId === expense.id

                    if (isEditing) {
                      return (
                        <tr key={expense.id}>
                          <td colSpan={5} className="px-4 py-3 bg-surface-container-lowest">
                            <div className="flex flex-wrap gap-space-sm items-end">
                              <div className="flex-1 min-w-[120px]">
                                <label className="text-label-sm text-text-secondary block mb-1">Monto</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editForm.amount}
                                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline text-on-surface text-body-md focus:outline-none focus:border-primary"
                                />
                              </div>
                              <div className="flex-1 min-w-[120px]">
                                <label className="text-label-sm text-text-secondary block mb-1">Descripción</label>
                                <input
                                  type="text"
                                  value={editForm.description}
                                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline text-on-surface text-body-md focus:outline-none focus:border-primary"
                                  placeholder="Descripción"
                                />
                              </div>
                              <div className="flex-1 min-w-[120px]">
                                <label className="text-label-sm text-text-secondary block mb-1">Categoría</label>
                                <select
                                  value={editForm.category}
                                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value as ExpenseCategory })}
                                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline text-on-surface text-body-md focus:outline-none focus:border-primary"
                                >
                                  {['food', 'transport', 'services', 'entertainment', 'other'].map((c) => (
                                    <option key={c} value={c}>{getCategoryInfo(c as ExpenseCategory).label}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-label-sm text-text-secondary block mb-1">Fecha</label>
                                <input
                                  type="date"
                                  value={editForm.date}
                                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline text-on-surface text-body-md focus:outline-none focus:border-primary"
                                />
                              </div>
                              <div className="flex gap-space-xs">
                                <button onClick={saveEdit} className="px-4 py-2 rounded-full bg-primary text-on-primary text-label-md font-semibold hover:bg-secondary transition-colors">
                                  ✓ Guardar
                                </button>
                                <button onClick={() => setEditingId(null)} className="px-4 py-2 rounded-full bg-surface-container text-on-surface-variant text-label-md hover:bg-surface-variant transition-colors">
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )
                    }

                    return (
                      <tr key={expense.id} className="border-b border-surface-container-last hover:bg-surface-container-low transition-colors last:border-0">
                        <td className="px-4 py-3 text-body-md text-on-surface">
                          {new Date(expense.date).toLocaleDateString('es-PE')}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 text-label-md text-on-surface">
                            <span className="text-[16px]">{catInfo.icon}</span>
                            {catInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-body-md text-on-surface-variant">
                          {expense.description || '—'}
                        </td>
                        <td className="px-4 py-3 text-right text-label-lg font-bold text-on-surface">
                          -{budget.currency} {expense.amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={() => startEdit(expense)}
                              className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-text-secondary hover:text-primary hover:bg-primary/10 text-sm transition-colors"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(expense.id)}
                              className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-text-secondary hover:text-danger hover:bg-danger/10 text-sm transition-colors"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-space-lg">
              {Object.entries(grouped).map(([date, dayExpenses]) => (
                <div key={date}>
                  <div className="flex justify-between items-center mb-space-sm">
                    <h3 className="text-label-lg text-on-surface font-semibold capitalize">
                      {formatDate(date)}
                    </h3>
                    <span className="text-label-md text-text-secondary font-medium">
                      {budget.currency} {dayExpenses.reduce((s, e) => s + e.amount, 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="space-y-space-xs">
                    {dayExpenses.map((expense) => {
                      const catInfo = getCategoryInfo(expense.category)
                      const isEditing = editingId === expense.id

                      if (isEditing) {
                        return (
                          <div key={expense.id} className="p-3 rounded-2xl bg-surface-container-lowest shadow-sm space-y-space-sm">
                            <div className="grid grid-cols-2 gap-space-sm">
                              <input
                                type="number"
                                step="0.01"
                                value={editForm.amount}
                                onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl bg-surface-container-lowest border border-outline text-on-surface text-body-md focus:outline-none focus:border-primary"
                                placeholder="Monto"
                              />
                              <input
                                type="date"
                                value={editForm.date}
                                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl bg-surface-container-lowest border border-outline text-on-surface text-body-md focus:outline-none focus:border-primary"
                              />
                            </div>
                            <input
                              type="text"
                              value={editForm.description}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl bg-surface-container-lowest border border-outline text-on-surface text-body-md focus:outline-none focus:border-primary"
                              placeholder="Descripción"
                            />
                            <select
                              value={editForm.category}
                              onChange={(e) => setEditForm({ ...editForm, category: e.target.value as ExpenseCategory })}
                              className="w-full px-3 py-2 rounded-xl bg-surface-container-lowest border border-outline text-on-surface text-body-md focus:outline-none focus:border-primary"
                            >
                              {['food', 'transport', 'services', 'entertainment', 'other'].map((c) => (
                                <option key={c} value={c}>{getCategoryInfo(c as ExpenseCategory).label}</option>
                              ))}
                            </select>
                            <div className="flex gap-space-sm">
                              <button onClick={saveEdit} className="flex-1 py-2 rounded-full bg-primary text-on-primary text-label-md font-semibold hover:bg-secondary transition-colors">
                                ✓ Guardar
                              </button>
                              <button onClick={() => setEditingId(null)} className="flex-1 py-2 rounded-full bg-surface-container text-on-surface-variant text-label-md hover:bg-surface-variant transition-colors">
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )
                      }

                      return (
                        <div
                          key={expense.id}
                          className="p-3 rounded-2xl bg-surface-container-lowest hover:bg-surface-container-low transition-colors flex items-center justify-between gap-3 shadow-sm"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-[22px] shrink-0 ${
                              expense.category === 'food' ? 'bg-secondary-fixed text-secondary' :
                              expense.category === 'transport' ? 'bg-primary-fixed text-primary' :
                              expense.category === 'services' ? 'bg-surface-container-high text-on-surface-variant' :
                              expense.category === 'entertainment' ? 'bg-tertiary-fixed text-tertiary' :
                              'bg-surface-container text-on-surface-variant'
                            }`}>
                              {catInfo.icon}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-label-lg text-on-surface font-semibold truncate">
                                {expense.description || catInfo.label}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-label-sm px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant">
                                  {catInfo.label}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-label-lg font-bold text-on-surface">
                              -{budget.currency}{expense.amount.toFixed(2)}
                            </span>
                            <div className="flex flex-col gap-0.5">
                              <button
                                onClick={() => startEdit(expense)}
                                className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-text-secondary hover:text-primary hover:bg-primary/10 text-xs"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDelete(expense.id)}
                                className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-text-secondary hover:text-danger hover:bg-danger/10 text-xs"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="fixed bottom-20 right-5 z-40 md:hidden">
          <button
            onClick={() => router.push('/dashboard/add-expense')}
            className="group flex items-center gap-2 px-5 py-3.5 rounded-full bg-secondary text-on-secondary shadow-[0_8px_24px_rgba(57,106,28,0.35)] hover:bg-primary transition-all duration-200 active:scale-90"
          >
            <span className="text-[24px] font-bold transition-transform duration-200 group-hover:rotate-90">➕</span>
            <span className="text-label-lg font-bold tracking-tight">Agregar gasto</span>
          </button>
        </div>
      </div>
    </main>
  )
}
