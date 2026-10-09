'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppState } from '@/lib/store'
import { signOut } from '@/lib/supabase/auth'

const CURRENCY_OPTIONS = [
  { value: 'S/', label: 'Soles (S/)' },
  { value: '$', label: 'Dólares ($)' },
]

export default function SettingsPage() {
  const router = useRouter()
  const { budget, budgets, setBudget, logout } = useAppState()
  const [budgetInputs, setBudgetInputs] = useState<Record<string, string>>(() => {
    const inputs: Record<string, string> = {}
    if (budget.monthlyLimit > 0) inputs[budget.currency] = budget.monthlyLimit.toString()
    Object.values(budgets).forEach((b) => {
      if (b.monthlyLimit > 0) inputs[b.currency] = b.monthlyLimit.toString()
    })
    return inputs
  })
  const [saved, setSaved] = useState<string | null>(null)

  const handleSaveBudget = async (currency: string) => {
    const val = parseFloat(budgetInputs[currency] || '0')
    if (val <= 0) return
    await setBudget(val, currency)
    setSaved(currency)
    setTimeout(() => setSaved(null), 2000)
  }

  return (
    <main className="min-h-screen bg-surface pb-24 md:pb-space-xl max-w-xl mx-auto md:max-w-none px-gutter md:px-space-xl">
      <div className="pt-16 md:pt-space-xl pb-6 flex flex-col">
        <div className="mb-space-md">
          <h1 className="text-headline-lg-mobile md:text-headline-xl text-on-surface font-bold tracking-tight">
            Ajustes ⚙️
          </h1>
          <p className="text-body-sm text-text-secondary mt-0.5">
            Personaliza tu experiencia Paltazo
          </p>
        </div>

        <div className="space-y-space-lg md:grid md:grid-cols-2 md:gap-space-lg md:space-y-0">
          <section className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm md:col-span-2">
            <h3 className="text-label-lg text-on-surface font-semibold mb-space-sm flex items-center gap-2">
              💰 Presupuestos por moneda
            </h3>
            <p className="text-body-sm text-on-surface-variant mb-space-md">
              Configura un límite mensual independiente para cada moneda.
            </p>
            <div className="space-y-space-md">
              {CURRENCY_OPTIONS.map(({ value, label }) => {
                const currentValue = budgetInputs[value] || ''
                const existingBudget = budgets[value]
                const isPrimary = value === budget.currency
                return (
                  <div key={value} className="flex flex-col gap-space-sm p-space-md rounded-xl bg-surface-container-lowest">
                    <div className="flex items-center justify-between">
                      <span className="text-label-lg text-on-surface font-semibold">
                        {label}
                      </span>
                      {isPrimary && (
                        <span className="text-label-sm px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          Principal
                        </span>
                      )}
                      {existingBudget && !isPrimary && (
                        <span className="text-label-sm px-2 py-0.5 rounded-full bg-surface-container text-text-secondary">
                          Configurado
                        </span>
                      )}
                    </div>
                    <div className="flex gap-space-sm">
                      <div className="flex-1 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-body-md">
                          {value}
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          value={currentValue}
                          onChange={(e) => setBudgetInputs((prev) => ({ ...prev, [value]: e.target.value }))}
                          className="w-full pl-10 pr-3 py-3 rounded-xl bg-surface-container border border-outline text-on-surface text-body-md focus:outline-none focus:border-primary transition-colors"
                          placeholder="0.00"
                        />
                      </div>
                      <button
                        onClick={() => handleSaveBudget(value)}
                        disabled={!currentValue || parseFloat(currentValue) <= 0}
                        className="px-5 py-3 rounded-xl bg-primary text-on-primary text-label-md font-semibold hover:bg-secondary transition-colors disabled:opacity-50"
                      >
                        {saved === value ? '✓' : 'Guardar'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm">
            <h3 className="text-label-lg text-on-surface font-semibold mb-space-sm flex items-center gap-2">
              📊 Niveles de alerta
            </h3>
            <div className="space-y-space-sm text-body-md text-on-surface-variant">
              <div className="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-lowest">
                <div className="flex items-center gap-space-sm">
                  <div className="w-3 h-3 bg-warning rounded-full" />
                  <span>Advertencia</span>
                </div>
                <span className="text-label-md font-semibold text-warning">80%</span>
              </div>
              <div className="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-lowest">
                <div className="flex items-center gap-space-sm">
                  <div className="w-3 h-3 bg-danger rounded-full" />
                  <span>Límite alcanzado</span>
                </div>
                <span className="text-label-md font-semibold text-danger">100%</span>
              </div>
              <div className="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-lowest">
                <div className="flex items-center gap-space-sm">
                  <div className="w-3 h-3 bg-danger rounded-full opacity-70" />
                  <span>Superado</span>
                </div>
                <span className="text-label-md font-semibold text-danger">101%</span>
              </div>
            </div>
          </section>

          <section className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm">
            <h3 className="text-label-lg text-on-surface font-semibold mb-space-sm flex items-center gap-2">
              📴 Modo offline
            </h3>
            <p className="text-body-md text-on-surface-variant mb-space-sm">
              Paltazo guarda todos tus datos localmente. Funciona sin internet.
            </p>
            <div className="flex items-center gap-space-sm p-space-sm rounded-xl bg-secondary-fixed/30">
              <span className="text-secondary text-label-lg">✓</span>
              <span className="text-label-md text-on-surface">
                Datos almacenados en IndexedDB
              </span>
            </div>
          </section>

          <section className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm">
            <h3 className="text-label-lg text-on-surface font-semibold mb-space-sm flex items-center gap-2">
              🌿 Acerca de Paltazo
            </h3>
            <div className="space-y-space-xs text-body-md text-on-surface-variant">
              <div className="flex justify-between">
                <span>Versión</span>
                <span className="text-label-md text-on-surface">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>Tipo</span>
                <span className="text-label-md text-on-surface">PWA offline-first</span>
              </div>
              <div className="flex justify-between">
                <span>Almacenamiento</span>
                <span className="text-label-md text-on-surface">Supabase + IndexedDB</span>
              </div>
            </div>
          </section>

          <section className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm">
            <h3 className="text-label-lg text-on-surface font-semibold mb-space-sm flex items-center gap-2">
              🚪 Sesión
            </h3>
            <button
              onClick={async () => {
                await signOut()
                window.location.href = '/login'
              }}
              className="w-full py-3 rounded-xl bg-danger/10 text-danger text-label-lg font-semibold hover:bg-danger/20 transition-colors"
            >
              Cerrar sesión
            </button>
          </section>
        </div>

        <div className="mt-space-lg">
          <button
            onClick={async () => {
              if (confirm('¿Borrar todos los datos? Esta acción no se puede deshacer.')) {
                await logout()
                window.location.href = '/onboarding'
              }
            }}
            className="w-full py-3 rounded-2xl bg-danger/10 text-danger text-label-lg font-semibold hover:bg-danger/20 transition-colors"
          >
            🗑️ Borrar todos los datos
          </button>
        </div>
      </div>
    </main>
  )
}
