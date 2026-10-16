'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppState } from '@/lib/store'
import { Button } from '@/components/ui/Button'

export default function OnboardingPage() {
  const router = useRouter()
  const { isLoggedIn } = useAppState()

  useEffect(() => {
    if (isLoggedIn) router.replace('/dashboard')
  }, [isLoggedIn, router])

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
