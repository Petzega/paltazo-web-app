'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppState } from '@/lib/store'

export default function Home() {
  const router = useRouter()
  const { isLoggedIn, isLoading } = useAppState()

  useEffect(() => {
    if (isLoading) return
    router.replace(isLoggedIn ? '/dashboard' : '/onboarding')
  }, [router, isLoggedIn, isLoading])

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-4">
        <span className="text-6xl animate-bounce">🥑</span>
        <h1 className="text-headline-lg text-primary font-bold">Paltazo</h1>
      </div>
    </main>
  )
}
