'use client'

import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const router = useRouter()

  const handleContinue = () => {
    router.push('/login')
  }

  return (
    <main className="min-h-screen flex flex-col bg-surface-container-low">
      <div className="flex-1 flex flex-col items-center justify-center px-gutter text-center">
        <div className="w-24 h-24 bg-primary-container rounded-full flex items-center justify-center mb-space-lg">
          <svg className="w-12 h-12 text-primary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>

        <h1 className="text-headline-xl-mobile text-on-surface mb-space-sm">
          Controla tus gastos
        </h1>
        
        <p className="text-body-lg text-on-surface-variant mb-space-xl">
          Detecta el paltazo antes de que te detecte a ti
        </p>

        <div className="flex gap-space-sm mb-space-lg">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          <div className="w-2 h-2 bg-outline-variant rounded-full"></div>
          <div className="w-2 h-2 bg-outline-variant rounded-full"></div>
        </div>
      </div>

      <div className="px-gutter pb-space-xl">
        <button
          onClick={handleContinue}
          className="w-full bg-primary text-on-primary text-label-lg py-4 rounded-full"
        >
          Comenzar
        </button>
      </div>
    </main>
  )
}
