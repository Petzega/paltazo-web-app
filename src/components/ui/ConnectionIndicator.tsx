'use client'

import { useAppState } from '@/lib/store'

export function ConnectionIndicator() {
  const { isOnline, pendingCount, syncPending } = useAppState()

  if (isOnline && pendingCount === 0) return null

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded-full shadow-lg text-sm font-medium transition-all ${
        isOnline
          ? 'bg-warning text-on-warning animate-pulse cursor-pointer'
          : 'bg-error text-on-error'
      }`}
      onClick={() => isOnline && pendingCount > 0 && syncPending()}
    >
      {isOnline ? (
        <>
          <span className="mr-2">⚡</span>
          {pendingCount} {pendingCount === 1 ? 'cambio pendiente' : 'cambios pendientes'}
          <span className="ml-2 text-xs opacity-75">(click para sincronizar)</span>
        </>
      ) : (
        <>
          <span className="mr-2">📡</span>
          Sin conexión
        </>
      )}
    </div>
  )
}
