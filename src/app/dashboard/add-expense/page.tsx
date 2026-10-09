'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAppState } from '@/lib/store'
import { EXPENSE_CATEGORIES } from '@/lib/categories'
import type { ExpenseCategory } from '@/types'

const CURRENCY_OPTIONS = [
  { value: 'S/', label: 'S/' },
  { value: '$', label: '$' },
]

function formatAmount(digits: string): string {
  if (!digits) return '0.00'
  const padded = digits.padStart(3, '0')
  const intPart = padded.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const decPart = padded.slice(-2)
  return `${intPart}.${decPart}`
}

export default function AddExpensePage() {
  const router = useRouter()
  const { addExpense, budget } = useAppState()
  const [digits, setDigits] = useState('')
  const [currency, setCurrency] = useState(budget.currency || 'S/')
  const [category, setCategory] = useState<ExpenseCategory>('food')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [focused, setFocused] = useState(false)

  const presets = ['15.00', '30.00', '50.00', '100.00']

  const numericValue = digits ? parseFloat(formatAmount(digits).replace(/,/g, '')) : 0

  const handlePreset = useCallback((val: string) => {
    const clean = val.replace(/,/g, '')
    const [intPart, decPart] = clean.split('.')
    setDigits(`${intPart}${decPart || '00'}`.replace(/^0+/, '') || '')
  }, [])

  const handleSave = async () => {
    if (numericValue <= 0) return
    await addExpense({
      userId: 'default',
      amount: numericValue,
      currency,
      category,
      description: description || undefined,
      date,
    })
    router.push('/dashboard')
  }

  const handleClear = () => {
    setDigits('')
    setDescription('')
  }

  const categoryNames: Record<ExpenseCategory, string> = {
    food: 'Comida',
    transport: 'Transporte',
    services: 'Servicios',
    entertainment: 'Ocio',
    other: 'Otros',
  }

  const displayText = formatAmount(digits)

  return (
    <>
      <div
        className="hidden md:block fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={() => router.back()}
      />
      <main className="min-h-screen bg-surface pb-24 max-w-xl mx-auto px-gutter md:fixed md:right-0 md:top-0 md:bottom-0 md:w-[420px] md:max-w-none md:z-50 md:overflow-y-auto md:shadow-[-8px_0_24px_rgba(0,0,0,0.1)] md:bg-surface md:pb-space-xl">
        <div className="flex flex-col pt-16 pb-6 md:pt-space-lg">
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
              onClick={handleClear}
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

              <div className="flex items-center justify-center gap-space-sm w-full relative z-10 my-space-xs">
                <div className="flex gap-1">
                  {CURRENCY_OPTIONS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCurrency(c.value)}
                      className={`min-w-[52px] px-3 py-1 rounded-full text-label-lg font-bold transition-all ${
                        currency === c.value
                          ? 'bg-primary-container text-on-primary-container'
                          : 'bg-surface-container text-text-secondary hover:bg-surface-container-high'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div
                className={`w-full relative z-10 my-space-xs rounded-lg px-3 py-2 transition-all duration-200 ${
                  focused
                    ? 'bg-primary-container/20 shadow-sm ring-1 ring-primary-container/40'
                    : 'bg-transparent'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span
                    className={`text-headline-lg-mobile font-bold select-none transition-colors duration-200 ${
                      focused ? 'text-primary' : 'text-outline-variant'
                    }`}
                  >
                    {currency}
                  </span>
                  <div className="relative flex-1 flex items-center justify-center max-w-[200px]">
                    <span
                      className={`text-headline-xl-mobile font-bold tracking-tight transition-all duration-200 ${
                        digits ? 'text-on-surface' : focused ? 'text-on-surface-variant' : 'text-outline-variant'
                      }`}
                    >
                      {displayText}
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*"
                      value={digits}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, '').slice(0, 9)
                        setDigits(raw)
                      }}
                      placeholder=""
                      className="absolute inset-0 w-full h-full opacity-0 cursor-text caret-transparent focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-space-xs mt-space-xs overflow-x-auto w-full justify-center py-space-xs">
                {presets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePreset(preset)}
                    className="min-w-[80px] px-3 py-1 rounded-full bg-surface-container text-on-surface-variant text-label-sm hover:bg-secondary-fixed hover:text-on-secondary-fixed transition-colors"
                  >
                    {currency} {preset}
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
                disabled={numericValue <= 0}
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
    </>
  )
}
