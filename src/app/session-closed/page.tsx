'use client'

import { useRouter } from 'next/navigation'

export default function SessionClosedPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-surface max-w-xl mx-auto px-gutter text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl mb-space-md">
        ✅
      </div>
      <h1 className="text-headline-lg-mobile text-on-surface font-bold tracking-tight">
        Sesión cerrada
      </h1>
      <p className="text-body-md text-text-secondary mt-space-sm max-w-xs">
        Has cerrado sesión correctamente. Te esperamos de vuelta.
      </p>
      <button
        onClick={() => router.push('/login')}
        className="mt-space-lg h-12 px-6 rounded-full bg-primary text-on-primary text-label-lg font-semibold shadow-sm hover:opacity-95 active:scale-[0.99] transition-all"
      >
        Volver a ingresar →
      </button>
    </main>
  )
}
