'use client'

import { usePathname, useRouter } from 'next/navigation'

const tabs = [
  { label: 'Inicio', icon: '🏠', path: '/dashboard' },
  { label: 'Gastos', icon: '🧾', path: '/dashboard/expenses' },
  { label: 'Ajustes', icon: '⚙️', path: '/dashboard/settings' },
]

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_-2px_12px_rgba(0,0,0,0.04)] safe-bottom md:hidden">
      <div className="max-w-xl mx-auto flex justify-around items-center h-16 px-gutter">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path || (tab.path === '/dashboard' && pathname === '/dashboard')
          return (
            <button
              key={tab.path}
              onClick={() => router.push(tab.path)}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
                isActive
                  ? 'text-primary font-bold'
                  : 'text-text-secondary hover:text-on-surface'
              }`}
            >
              <span className="text-[24px]">{tab.icon}</span>
              <span className="text-label-sm mt-0.5">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
