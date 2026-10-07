'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppState } from '@/lib/store'
import { EXPENSE_CATEGORIES } from '@/lib/categories'
import type { ExpenseCategory } from '@/types'

export default function AddExpensePage() {
  const router = useRouter()
  const { addExpense } = useAppState()
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<ExpenseCategory>('food')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const presets = ['15.00', '30.00', '50.00', '100.00']

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) return
    await addExpense({
      userId: 'default',
      amount: parseFloat(amount),
      category,
      description: description || undefined,
      date,
    })
    router.push('/dashboard')
  }

  const categoryNames: Record<ExpenseCategory, string> = {
    food: 'Comida',
    transport: 'Transporte',
    services: 'Servicios',
    entertainment: 'Ocio',
    other: 'Otros',
  }

  return (
    <main className="min-h-screen bg-surface pb-24 max-w-xl mx-auto px-gutter">
      <div className="flex flex-col pt-16 pb-6">
        <div className="flex items-center justify-between py-space-sm mb-space-md">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors"
          >
            ←
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-headline-sm text-on-surface font-bold tracking-tight">Nuevo Gasto</h1>
            <span className="text-label-sm text-secondary font-medium">Registra tu gasto</span>
          </div>
          <button
            onClick={() => { setAmount(''); setDescription('') }}
            className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-text-secondary hover:text-error hover:bg-error-container transition-colors"
          >
            🗑️
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSave() }} className="flex flex-col gap-space-lg">
          <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col items-center justify-center gap-space-xs text-center">
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-secondary-fixed/30 pointer-events-none blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-primary-fixed/40 pointer-events-none blur-xl" />
            <span className="text-label-md text-text-secondary tracking-wide uppercase">Monto a registrar</span>
            <div className="flex items-baseline justify-center gap-space-xs w-full max-w-xs relative z-10 my-space-xs">
              <span className="text-headline-lg-mobile font-bold text-secondary select-none">S/</span>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-center text-headline-xl-mobile font-bold text-on-surface bg-transparent focus:outline-none tracking-tight placeholder:text-outline-variant"
                inputMode="decimal"
                placeholder="0.00"
                autoFocus
              />
            </div>
            <div className="flex items-center gap-space-xs mt-space-xs overflow-x-auto w-full justify-center py-space-xs">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant text-label-sm hover:bg-secondary-fixed hover:text-on-secondary-fixed transition-colors"
                >
                  S/ {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-space-xs">
            <label className="text-label-lg text-on-surface font-semibold px-space-xs flex items-center justify-between">
              <span>Descripción</span>
              <span className="text-label-sm text-text-secondary font-normal">Opcional pero útil</span>
            </label>
            <div className="relative flex items-center bg-surface-container-lowest rounded-xl shadow-sm px-space-md py-1 focus-within:bg-surface-container-low transition-colors">
              <span className="text-outline-variant mr-space-sm text-[20px]">✏️</span>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-12 bg-transparent text-on-surface placeholder:text-text-secondary text-body-md focus:outline-none"
                placeholder="Ej. Almuerzo, taxi a Miraflores, súper"
              />
            </div>
          </div>

          <div className="flex flex-col gap-space-sm">
            <div className="flex items-center justify-between px-space-xs">
              <label className="text-label-lg text-on-surface font-semibold">Categoría</label>
              <span className="text-label-sm text-primary font-bold">{categoryNames[category]}</span>
            </div>
            <div className="grid grid-cols-5 gap-space-xs">
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex flex-col items-center justify-center p-space-sm rounded-xl shadow-sm transition-all duration-150 transform active:scale-95 ${
                    category === cat.id
                      ? 'bg-primary-container text-on-primary-container'
                      : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[22px] mb-1 ${
                    category === cat.id ? 'bg-surface-container-lowest/80' : 'bg-surface-container'
                  }`}>
                    {cat.icon}
                  </div>
                  <span className={`text-label-sm font-medium truncate w-full text-center ${
                    category === cat.id ? 'font-semibold' : ''
                  }`}>
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <div className="w-9 h-9 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
                  📅
                </div>
                <div className="flex flex-col">
                  <span className="text-label-sm text-text-secondary">Fecha del gasto</span>
                  <span className="text-body-md font-semibold text-on-surface">
                    {new Date(date).toLocaleDateString('es-PE', { 
                      day: 'numeric', 
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              <label className="relative cursor-pointer">
                <span className="px-space-md py-1.5 rounded-full bg-surface-container text-secondary text-label-md flex items-center gap-1 hover:bg-surface-container-high transition-colors">
                  Cambiar ▾
                </span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                />
              </label>
            </div>
            <div className="w-full h-px bg-surface-container-low" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                  ☁️
                </div>
                <div className="flex flex-col">
                  <span className="text-label-sm font-semibold text-on-surface">Sincronizado offline</span>
                  <span className="text-body-sm text-text-secondary">Guardado local listo</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed-variant text-label-sm font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                Listo
              </span>
            </div>
          </div>

          <div className="flex items-center gap-space-sm p-space-md rounded-xl bg-surface-container-low text-on-surface-variant">
            <div className="w-8 h-8 shrink-0 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
              🌿
            </div>
            <p className="text-body-sm text-on-surface-variant">
              ¡Excelente hábito! Registrar tus compras diarias te acerca 15% más a tus metas mensuales.
            </p>
          </div>

          <div className="flex flex-col gap-space-sm mt-space-xs">
            <button
              type="submit"
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full h-12 rounded-full bg-primary-container text-on-primary text-headline-sm flex items-center justify-center gap-space-xs shadow-sm hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50"
            >
              ✓ Guardar Gasto
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full h-11 rounded-full bg-transparent text-text-secondary text-label-lg flex items-center justify-center hover:bg-surface-container hover:text-on-surface transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
