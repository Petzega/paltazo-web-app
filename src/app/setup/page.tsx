'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppState } from '@/lib/store'
import { Button } from '@/components/ui/Button'

const CURRENCIES = [
  { value: 'S/', label: 'Soles (S/)' },
  { value: '$', label: 'Dólares ($)' },
  { value: '€', label: 'Euros (€)' },
]

export default function SetupPage() {
  const router = useRouter()
  const { hasCompletedOnboarding, completeOnboarding, isLoading } = useAppState()
  const [currency, setCurrency] = useState('S/')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isLoading && hasCompletedOnboarding) {
      router.replace('/dashboard')
    }
  }, [isLoading, hasCompletedOnboarding, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const monthlyLimit = parseFloat(amount)
    if (!amount || isNaN(monthlyLimit) || monthlyLimit <= 0) {
      setError('Ingresa un monto mayor a 0')
      return
    }
    setError('')
    setLoading(true)
    try {
      await completeOnboarding(currency, monthlyLimit)
      router.replace('/dashboard')
    } catch {
      setError('Error al guardar. Intenta de nuevo.')
      setLoading(false)
    }
  }

  if (isLoading || hasCompletedOnboarding) return null

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary/5 to-surface flex items-center justify-center px-space-lg py-space-xl">
      <div className="w-full max-w-md">
        <div className="text-center mb-space-xl">
          <span className="text-6xl mb-space-md block">🥑</span>
          <h1 className="text-headline-lg text-on-surface font-bold mb-space-xs">
            ¡Bienvenido a Paltazo!
          </h1>
          <p className="text-body-lg text-text-secondary">
            Configura tu presupuesto inicial
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-2xl shadow-sm p-space-lg space-y-space-lg">
          <div>
            <label className="text-label-lg text-on-surface font-semibold block mb-space-sm">
              Moneda principal
            </label>
            <div className="grid grid-cols-3 gap-space-sm">
              {CURRENCIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCurrency(c.value)}
                  className={`py-space-md rounded-xl text-label-lg font-semibold transition-all ${
                    currency === c.value
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="amount" className="text-label-lg text-on-surface font-semibold block mb-space-sm">
              Presupuesto mensual
            </label>
            <div className="relative">
              <span className="absolute left-space-md top-1/2 -translate-y-1/2 text-body-lg text-on-surface font-semibold pointer-events-none">
                {currency}
              </span>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError('') }}
                placeholder="0.00"
                className="w-full pl-space-xl pr-space-md py-space-md bg-surface-container border border-outline rounded-xl text-body-lg text-on-surface focus:outline-none focus:border-primary transition-colors"
                disabled={loading}
              />
            </div>
            {error && (
              <p className="text-body-sm text-error mt-space-xs">{error}</p>
            )}
          </div>

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Guardando...' : 'Comenzar →'}
          </Button>

          <p className="text-body-sm text-text-secondary text-center">
            Puedes cambiar tu presupuesto después en Ajustes
          </p>
        </form>
      </div>
    </main>
  )
}
