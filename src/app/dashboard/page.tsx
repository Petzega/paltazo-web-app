'use client'

import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()

  const expenses = [
    { id: 1, category: 'Comida', amount: 45.50, date: 'Hoy' },
    { id: 2, category: 'Transporte', amount: 12.00, date: 'Hoy' },
    { id: 3, category: 'Servicios', amount: 89.90, date: 'Ayer' },
  ]

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const budget = 500
  const percentage = (totalExpenses / budget) * 100

  return (
    <main className="min-h-screen bg-surface pb-24">
      <header className="bg-primary-container px-gutter py-space-lg">
        <h1 className="text-headline-md text-on-primary-container">
          Resumen
        </h1>
        <p className="text-body-md text-on-primary-container mt-space-xs">
          Octubre 2026
        </p>
      </header>

      <section className="px-gutter -mt-space-sm">
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
          <p className="text-label-md text-on-surface-variant mb-space-xs">
            Gastos del mes
          </p>
          <p className="text-headline-lg text-primary">
            S/ {totalExpenses.toFixed(2)}
          </p>
          <div className="mt-space-md">
            <div className="flex justify-between text-body-sm text-on-surface-variant mb-space-xs">
              <span>Progreso</span>
              <span>{percentage.toFixed(0)}%</span>
            </div>
            <div className="w-full h-2 bg-surface-container-highest rounded-full">
              <div
                className="h-2 bg-primary rounded-full transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="text-body-sm text-on-surface-variant mt-space-xs">
              Presupuesto: S/ {budget}
            </p>
          </div>
        </div>
      </section>

      <section className="px-gutter mt-space-lg">
        <div className="flex justify-between items-center mb-space-md">
          <h2 className="text-headline-sm text-on-surface">
            Últimos gastos
          </h2>
          <button className="text-label-md text-primary">Ver todo</button>
        </div>

        <div className="space-y-space-sm">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="bg-surface-container-lowest rounded-lg p-space-md flex justify-between items-center"
            >
              <div>
                <p className="text-label-lg text-on-surface">{expense.category}</p>
                <p className="text-body-sm text-on-surface-variant">{expense.date}</p>
              </div>
              <p className="text-label-lg text-on-surface">
                S/ {expense.amount.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <button
        onClick={() => router.push('/dashboard/add-expense')}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center"
        aria-label="Agregar gasto"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </main>
  )
}
