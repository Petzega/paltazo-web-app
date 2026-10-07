'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppState } from '@/lib/store'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

export default function BudgetPage() {
  const router = useRouter()
  const { budget, setBudget } = useAppState()
  const [monthlyLimit, setMonthlyLimit] = useState(budget.monthlyLimit.toString())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await setBudget(parseFloat(monthlyLimit))
    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen bg-surface pb-space-xl">
      <header className="bg-surface-container-low px-gutter py-space-lg flex items-center gap-space-md">
        <button
          onClick={() => router.back()}
          className="text-on-surface p-2"
          aria-label="Volver"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-headline-md text-on-surface">Configurar presupuesto</h1>
      </header>

      <form onSubmit={handleSubmit} className="px-gutter md:px-space-xl mt-space-lg space-y-space-lg">
        <Input
          type="number"
          step="0.01"
          required
          value={monthlyLimit}
          onChange={(e) => setMonthlyLimit(e.target.value)}
          label={`Límite mensual (${budget.currency})`}
          placeholder="500.00"
          helperText="Te alertaremos cuando te acerques o superes este límite"
        />

        <div className="md:flex md:gap-space-lg">
          <Card className="md:flex-1">
            <p className="text-label-lg text-on-surface mb-space-sm">Niveles de alerta:</p>
            <div className="space-y-space-xs text-body-md text-on-surface-variant">
              <div className="flex items-center gap-space-sm">
                <div className="w-3 h-3 bg-warning rounded-full"></div>
                <span>80% — Advertencia</span>
              </div>
              <div className="flex items-center gap-space-sm">
                <div className="w-3 h-3 bg-danger rounded-full"></div>
                <span>100% — Límite alcanzado</span>
              </div>
              <div className="flex items-center gap-space-sm">
                <div className="w-3 h-3 bg-danger rounded-full opacity-70"></div>
                <span>101% — Superado</span>
              </div>
            </div>
          </Card>
        </div>

        <Button type="submit" fullWidth disabled={!monthlyLimit || parseFloat(monthlyLimit) <= 0}>
          Guardar presupuesto
        </Button>
      </form>
    </main>
  )
}
