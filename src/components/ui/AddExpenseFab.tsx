'use client'

import { useRouter } from 'next/navigation'

export function AddExpenseFab() {
  const router = useRouter()

  return (
    <div className="fixed bottom-24 right-5 z-40 md:hidden">
      <button
        onClick={() => router.push('/dashboard/add-expense')}
        className="group flex items-center gap-2 px-5 py-3.5 rounded-full bg-secondary text-on-secondary shadow-[0_8px_24px_rgba(57,106,28,0.35)] hover:bg-primary transition-all duration-200 active:scale-90"
      >
        <span className="text-[24px] font-bold transition-transform duration-200 group-hover:rotate-90">➕</span>
        <span className="text-label-lg font-bold tracking-tight">Agregar gasto</span>
      </button>
    </div>
  )
}
