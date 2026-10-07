'use client'

import { useRouter } from 'next/navigation'
import { useAppState } from '@/lib/store'
import { getCategoryInfo } from '@/lib/categories'

export default function DashboardPage() {
  const router = useRouter()
  const { expenses, budget } = useAppState()

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const currentDay = now.getDate()
  const daysRemaining = daysInMonth - currentDay

  const monthlyExpenses = expenses.filter((exp) => {
    const expDate = new Date(exp.date)
    return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear
  })

  const totalExpenses = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  const percentage = budget.monthlyLimit > 0 ? Math.min((totalExpenses / budget.monthlyLimit) * 100, 100) : 0
  const remaining = Math.max(budget.monthlyLimit - totalExpenses, 0)

  const dailyAverage = currentDay > 0 ? totalExpenses / currentDay : 0

  const alertLevel = percentage >= 101 ? 'exceeded' : percentage >= 100 ? 'critical' : percentage >= 80 ? 'warning' : 'safe'
  const alertMessage = alertLevel === 'exceeded'
    ? 'Has superado tu presupuesto mensual'
    : alertLevel === 'critical'
    ? 'Has alcanzado tu límite mensual'
    : alertLevel === 'warning'
    ? 'Ritmo de gasto moderado'
    : 'Ritmo de gasto saludable'

  const dailySuggestion = daysRemaining > 0 ? remaining / daysRemaining : 0

  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
    const today = new Date()
    const dayOfWeek = (today.getDay() + 6) % 7
    const targetDate = new Date(today)
    targetDate.setDate(today.getDate() - dayOfWeek + i)
    
    const dayExpenses = expenses.filter((exp) => {
      const expDate = new Date(exp.date)
      return expDate.toDateString() === targetDate.toDateString()
    })
    
    const dayTotal = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0)
    const maxDay = Math.max(...Array.from({ length: 7 }, (_, j) => {
      const d = new Date(today)
      d.setDate(today.getDate() - dayOfWeek + j)
      return expenses.filter((e) => new Date(e.date).toDateString() === d.toDateString())
        .reduce((s, e) => s + e.amount, 0)
    }), 1)
    
    const heightPercent = (dayTotal / maxDay) * 100
    const isHighlight = dayTotal === maxDay && dayTotal > 0
    
    return {
      day: dayNames[i],
      heightPercent,
      isHighlight,
    }
  })

  return (
    <main className="min-h-screen bg-surface pb-24 max-w-xl mx-auto px-gutter">
      <div className="pt-16 pb-6 flex flex-col">
        <div className="flex items-center justify-between mb-space-md">
          <div>
            <div className="flex items-center gap-space-xs">
              <h1 className="text-headline-lg-mobile text-on-surface font-bold tracking-tight">
                ¡Hola! 👋
              </h1>
            </div>
            <p className="text-body-sm text-text-secondary mt-0.5">
              Mantén tu economía tan fresca como una palta
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container rounded-full text-secondary text-label-md shadow-sm">
            <span className="text-[18px]">📅</span>
            <span>
              {now.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        <div className="mb-space-md p-space-md rounded-2xl bg-secondary-container/40 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            🌿
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-label-lg text-on-secondary-container font-semibold">
                {alertMessage}
              </p>
              <span className="text-label-sm px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-medium">
                Quedan {daysRemaining} días
              </span>
            </div>
            <p className="text-body-sm text-on-surface-variant mt-0.5 leading-relaxed">
              {percentage >= 80
                ? `Has alcanzado el ${percentage.toFixed(0)}% de tu presupuesto. ${
                    dailySuggestion > 0
                      ? `Te sugerimos mantener tus consumos diarios en ${budget.currency} ${dailySuggestion.toFixed(2)} para cerrar el mes en verde.`
                      : ''
                  }`
                : `Has gastado el ${percentage.toFixed(0)}% de tu presupuesto. ¡Sigue así!`
              }
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-surface-container-low p-space-lg shadow-sm mb-space-lg">
          <div className="absolute -right-8 -bottom-10 w-44 h-44 rounded-full bg-primary-fixed/20 blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-space-md">
            <div>
              <span className="text-label-sm text-text-secondary uppercase tracking-wider block">
                Presupuesto mensual
              </span>
              <span className="text-headline-lg-mobile font-bold text-on-surface">
                {budget.currency} {budget.monthlyLimit.toFixed(2)}
              </span>
            </div>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-label-md ${
              percentage >= 100
                ? 'bg-danger/15 text-danger'
                : percentage >= 80
                ? 'bg-warning/15 text-warning'
                : 'bg-primary/15 text-primary'
            }`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${
                percentage >= 100 ? 'bg-danger' : percentage >= 80 ? 'bg-warning' : 'bg-primary'
              }`} />
              {percentage.toFixed(0)}% utilizado
            </span>
          </div>

          <div className="space-y-2 mb-space-lg">
            <div className="w-full h-3.5 bg-surface-container-highest rounded-full overflow-hidden p-0.5 flex">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out shadow-xs ${
                  percentage >= 100 ? 'bg-danger' : percentage >= 80 ? 'bg-warning' : 'bg-primary'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-body-sm">
              <span className="text-on-surface-variant font-medium">
                {budget.currency} {totalExpenses.toFixed(2)} gastados ({percentage.toFixed(0)}%)
              </span>
              <span className="text-text-secondary">
                Límite {budget.currency} {budget.monthlyLimit.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="p-space-md rounded-2xl bg-surface-container-lowest flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                💰
              </div>
              <div>
                <span className="text-label-sm text-text-secondary block">Saldo disponible</span>
                <span className="text-headline-sm text-secondary font-bold">
                  {budget.currency} {remaining.toFixed(2)} restantes
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-label-sm text-text-secondary block">Días restantes</span>
              <span className="text-label-lg text-on-surface font-semibold">{daysRemaining} días</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-space-sm mt-space-md">
            <button
              onClick={() => router.push('/budget')}
              className="w-full py-2.5 px-3 rounded-full bg-surface-container-high hover:bg-surface-variant text-on-surface text-label-md flex items-center justify-center gap-1.5 transition-colors active:scale-95"
            >
              <span className="text-primary text-[18px]">📊</span>
              Ver reporte
            </button>
            <button
              onClick={() => router.push('/budget')}
              className="w-full py-2.5 px-3 rounded-full bg-surface-container-high hover:bg-surface-variant text-on-surface text-label-md flex items-center justify-center gap-1.5 transition-colors active:scale-95"
            >
              <span className="text-secondary text-[18px]">⚙️</span>
              Ajustar presupuesto
            </button>
          </div>
        </div>

        <div className="mb-space-lg p-space-md rounded-2xl bg-surface-container-low shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-label-lg font-semibold text-on-surface flex items-center gap-1.5">
              <span className="text-primary text-[18px]">📊</span>
              Distribución semanal
            </h3>
            <span className="text-label-sm text-text-secondary">
              Promedio {budget.currency} {dailyAverage.toFixed(2)}/día
            </span>
          </div>
          <div className="flex items-end justify-between gap-2 h-20 pt-2 px-1">
            {weeklyData.map((item) => (
              <div key={item.day} className="flex flex-col items-center flex-1 gap-1.5">
                <div
                  className={`w-full rounded-t-lg transition-all ${
                    item.isHighlight
                      ? 'bg-warning/60 hover:bg-warning'
                      : 'bg-primary-container/40 hover:bg-primary-container'
                  }`}
                  style={{ height: `${Math.max(item.heightPercent, 10)}%` }}
                />
                <span className={`text-label-sm ${
                  item.isHighlight ? 'text-warning font-semibold' : 'text-text-secondary'
                }`}>
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-space-sm">
            <div className="flex items-center gap-2">
              <h2 className="text-headline-sm text-on-surface font-bold">Gastos recientes</h2>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-label-sm">
                {monthlyExpenses.length}
              </span>
            </div>
          </div>

          {monthlyExpenses.length === 0 ? (
            <p className="text-body-md text-on-surface-variant text-center py-space-xl">
              No hay gastos registrados este mes
            </p>
          ) : (
            <div className="space-y-space-xs">
              {monthlyExpenses.slice(0, 5).map((expense) => {
                const catInfo = getCategoryInfo(expense.category)
                return (
                  <div
                    key={expense.id}
                    className="p-3 rounded-2xl bg-surface-container-lowest hover:bg-surface-container-low transition-colors flex items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-[22px] shrink-0 ${
                        expense.category === 'food' ? 'bg-secondary-fixed text-secondary' :
                        expense.category === 'transport' ? 'bg-primary-fixed text-primary' :
                        expense.category === 'services' ? 'bg-surface-container-high text-on-surface-variant' :
                        expense.category === 'entertainment' ? 'bg-tertiary-fixed text-tertiary' :
                        'bg-surface-container text-on-surface-variant'
                      }`}>
                        {catInfo.icon}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-label-lg text-on-surface font-semibold truncate">
                          {expense.description || catInfo.label}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-label-sm px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant">
                            {catInfo.label}
                          </span>
                          <span className="text-body-sm text-text-secondary">
                            {new Date(expense.date).toLocaleDateString('es-PE')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-label-lg font-bold text-on-surface">
                        - {budget.currency} {expense.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="mt-space-lg p-space-md rounded-2xl bg-surface-container flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            💡
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-label-md font-semibold text-on-surface">Consejo Paltazo del día</p>
            <p className="text-body-sm text-on-surface-variant line-clamp-1">
              Anotar tus gastos de inmediato reduce el gasto impulsivo en un 22%.
            </p>
          </div>
        </div>

        <div className="fixed bottom-20 right-5 z-40 max-w-xl mx-auto">
          <button
            onClick={() => router.push('/dashboard/add-expense')}
            className="group flex items-center gap-2 px-5 py-3.5 rounded-full bg-secondary text-on-secondary shadow-[0_8px_24px_rgba(57,106,28,0.35)] hover:bg-primary transition-all duration-200 active:scale-90"
          >
            <span className="text-[24px] font-bold transition-transform duration-200 group-hover:rotate-90">➕</span>
            <span className="text-label-lg font-bold tracking-tight">Agregar gasto</span>
          </button>
        </div>
      </div>
    </main>
  )
}
