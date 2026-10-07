'use client'

import { useRouter } from 'next/navigation'
import { useAppState } from '@/lib/store'
import { Button } from '@/components/ui/Button'

export default function OnboardingPage() {
  const router = useRouter()
  const { expenses, budget } = useAppState()

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const monthlyExpenses = expenses.filter((exp) => {
    const expDate = new Date(exp.date)
    return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear
  })

  const totalExpenses = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  const remaining = Math.max(budget.monthlyLimit - totalExpenses, 0)

  return (
    <main className="min-h-screen flex flex-col bg-surface max-w-xl mx-auto px-gutter">
      <div className="flex flex-col items-center text-center w-full pt-4">
        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute -inset-4 bg-secondary-container/40 rounded-full blur-2xl transform scale-95 transition-all" />
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-surface-container-low flex items-center justify-center shadow-sm">
            <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center select-none">
              <span className="text-6xl sm:text-7xl">🥑</span>
            </div>
          </div>
          <span className="absolute -bottom-1 -right-1 bg-primary text-on-primary text-label-sm px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
            ⚡ PWA
          </span>
        </div>

        <h1 className="text-headline-xl-mobile text-on-surface font-bold tracking-tight">
          Paltazo
        </h1>
        <p className="text-body-lg text-on-surface-variant max-w-xs mt-2 font-normal leading-relaxed">
          Controla tus gastos antes de que te caiga la palta
        </p>
      </div>

      <div className="w-full mt-8 flex flex-col gap-3">
        <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-surface-container-low transition-transform active:scale-[0.99]">
          <div className="w-11 h-11 rounded-full bg-secondary-container flex items-center justify-center shrink-0 text-on-secondary-container">
            📴
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-label-lg text-on-surface">Offline-first total</span>
            <span className="text-body-sm text-text-secondary truncate">
              Apunta tus compras sin gastar datos ni depender de señal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-surface-container-low transition-transform active:scale-[0.99]">
          <div className="w-11 h-11 rounded-full bg-primary-container flex items-center justify-center shrink-0 text-on-primary-container">
            💰
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-label-lg text-on-surface">Presupuesto en Soles (S/)</span>
            <span className="text-body-sm text-text-secondary truncate">
              Monitorea tus topes mensuales con precisión de céntimos
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-surface-container-low transition-transform active:scale-[0.99]">
          <div className="w-11 h-11 rounded-full bg-secondary-fixed flex items-center justify-center shrink-0 text-on-secondary-fixed-variant">
            🔔
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-label-lg text-on-surface">Alertas antes de fin de mes</span>
            <span className="text-body-sm text-text-secondary truncate">
              Avisos oportunos para llegar tranquilo a tu quincena
            </span>
          </div>
        </div>
      </div>

      <div className="w-full mt-5 p-4 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-label-sm text-text-secondary uppercase tracking-wider">
              Tu balance actual
            </span>
          </div>
          <span className="text-label-md text-secondary font-bold">
            {budget.currency} {remaining.toFixed(2)} disponibles
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
          <div
            className="h-full bg-primary-container rounded-full transition-all duration-500"
            style={{
              width: `${budget.monthlyLimit > 0 ? Math.min((remaining / budget.monthlyLimit) * 100, 100) : 0}%`,
            }}
          />
        </div>
        <div className="flex justify-between text-body-sm text-text-secondary">
          <span>Gastado: {budget.currency} {totalExpenses.toFixed(2)}</span>
          <span>Límite: {budget.currency} {budget.monthlyLimit.toFixed(2)}</span>
        </div>
      </div>

      <div className="w-full mt-8 flex flex-col items-center gap-3 pb-space-xl">
        <Button
          fullWidth
          onClick={() => router.push('/login')}
          className="h-12 rounded-full bg-primary hover:bg-secondary text-on-primary text-label-lg flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all"
        >
          Comenzar →
        </Button>
        <a
          href="/login"
          className="py-2 px-4 rounded-full text-label-md text-secondary hover:text-primary transition-colors flex items-center gap-1 active:opacity-75"
        >
          ¿Ya tienes cuenta? <span className="underline font-bold">Iniciar sesión</span>
        </a>
      </div>
    </main>
  )
}
