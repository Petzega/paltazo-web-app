'use client'

import { usePathname, useRouter } from 'next/navigation'
import { signOut } from '@/lib/supabase/auth'

const links = [
  { label: 'Inicio', icon: '🏠', path: '/dashboard' },
  { label: 'Gastos', icon: '🧾', path: '/dashboard/expenses' },
  { label: 'Ajustes', icon: '⚙️', path: '/dashboard/settings' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className="flex flex-col h-screen p-space-lg sticky top-0">
      <div className="flex items-center gap-2 mb-space-xl">
        <span className="text-3xl">🥑</span>
        <span className="text-headline-sm font-bold text-on-surface">Paltazo</span>
      </div>

      <nav className="flex flex-col gap-space-xs flex-1">
        {links.map((link) => {
          const isActive = pathname === link.path
          return (
            <button
              key={link.path}
              onClick={() => router.push(link.path)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
                isActive
                  ? 'bg-primary-container text-on-primary-container font-semibold'
                  : 'text-text-secondary hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <span className="text-[22px]">{link.icon}</span>
              <span className="text-label-lg">{link.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="pt-space-md border-t border-surface-container-high mt-space-md flex flex-col gap-space-xs">
        <button
          onClick={async () => { await signOut(); window.location.href = '/login' }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-left text-text-secondary hover:bg-danger/10 hover:text-danger transition-colors"
        >
          <span className="text-[22px]">🚪</span>
          <span className="text-label-lg">Cerrar sesión</span>
        </button>
        <p className="text-body-sm text-text-secondary px-4">Paltazo v1.0.0</p>
      </div>
    </div>
  )
}
