'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppState } from '@/lib/store'

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { hasCompletedOnboarding, isLoading } = useAppState()

  useEffect(() => {
    if (!isLoading && !hasCompletedOnboarding) {
      router.replace('/setup')
    }
  }, [isLoading, hasCompletedOnboarding, router])

  if (isLoading || !hasCompletedOnboarding) return null
  return <>{children}</>
}
