'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppState } from '@/lib/store'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isLoggedIn, isLoading } = useAppState()

  useEffect(() => {
    if (isLoading) return
    if (!isLoggedIn) {
      router.replace('/login')
    }
  }, [router, isLoggedIn, isLoading])

  if (!isLoggedIn) return null
  return <>{children}</>
}
