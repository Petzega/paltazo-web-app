'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppState } from '@/lib/store'

export default function SettingsPage() {
  const router = useRouter()
  const { budget, setBudget, logout } = useAppState()
  const [newLimit, setNewLimit] = useState(budget.monthlyLimit.toString())
  const [saved, setSaved] = useState(false)

  const handleSaveBudget = async () => {
    const val = parseFloat(newLimit)
    if (val <= 0) return
    await setBudget(val)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <main className="min-h-screen bg-surface pb-24 max-w-xl mx-auto px-gutter">
      <div className="pt-16 pb-6 flex flex-col">
        <div className="mb-space-md">
          <h1 className="text-headline-lg-mobile text-on-surface font-bold tracking-tight">
            Ajustes ⚙️
          </h1>
          <p className="text-body-sm text-text-secondary mt-0.5">
            Personaliza tu experiencia Paltazo
          </p>
        </div>

        <div className="space-y-space-lg">
          <section className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm">
            <h3 className="text-label-lg text-on-surface font-semibold mb-space-sm flex items-center gap-2">
              💰 Presupuesto mensual
            </h3>
            <div className="flex gap-space-sm">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-body-md">
                  {budget.currency}
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 rounded-xl bg-surface-container-lowest border border-outline text-on-surface text-body-md focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <button
                onClick={handleSaveBudget}
                disabled={!newLimit || parseFloat(newLimit) <= 0}
                className="px-5 py-3 rounded-xl bg-primary text-on-primary text-label-md font-semibold hover:bg-secondary transition-colors disabled:opacity-50"
              >
                {saved ? '✓' : 'Guardar'}
              </button>
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
                <span className="text-label-md text-on-surface">IndexedDB (Dexie.js)</span>
              </div>
            </div>
          </section>

          <button
            onClick={() => {
              if (confirm('¿Borrar todos los datos? Esta acción no se puede deshacer.')) {
                logout()
                localStorage.clear()
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
