'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAppState } from '@/lib/store'
import { getCategoryInfo } from '@/lib/categories'

const DAY_NAMES = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function dateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

interface CurrencySummary {
  currency: string
  monthlyLimit: number
  totalExpenses: number
  percentage: number
  remaining: number
  alertLevel: 'safe' | 'warning' | 'critical' | 'exceeded'
  alertMessage: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { expenses, budget, budgets } = useAppState()

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

  const activeCurrencies = new Set(monthlyExpenses.map((e) => e.currency))
  activeCurrencies.add(budget.currency)
  if (Object.keys(budgets).length > 0) {
    Object.keys(budgets).forEach((c) => activeCurrencies.add(c))
  }

  const currencySummaries: CurrencySummary[] = Array.from(activeCurrencies).map((currency) => {
    const budgetForCurrency = budgets[currency] || (currency === budget.currency ? budget : null)
    const monthlyLimit = budgetForCurrency?.monthlyLimit || 0
    const totalExpenses = monthlyExpenses
      .filter((e) => e.currency === currency)
      .reduce((sum, e) => sum + e.amount, 0)
    const percentage = monthlyLimit > 0 ? Math.min((totalExpenses / monthlyLimit) * 100, 100) : 0
    const remaining = Math.max(monthlyLimit - totalExpenses, 0)
    const alertLevel: CurrencySummary['alertLevel'] = percentage >= 101 ? 'exceeded' : percentage >= 100 ? 'critical' : percentage >= 80 ? 'warning' : 'safe'
    const alertMessage = alertLevel === 'exceeded'
      ? `Has superado tu presupuesto en ${currency}`
      : alertLevel === 'critical'
      ? `Alcanzaste tu límite en ${currency}`
      : alertLevel === 'warning'
      ? `Ritmo de gasto moderado en ${currency}`
      : monthlyLimit > 0
      ? `${currency} dentro del límite`
      : `${currency} sin presupuesto configurado`
    return { currency, monthlyLimit, totalExpenses, percentage, remaining, alertLevel, alertMessage }
  })

  currencySummaries.sort((a, b) => {
    if (a.currency === budget.currency) return -1
    if (b.currency === budget.currency) return 1
    return a.currency.localeCompare(b.currency)
  })

  const primarySummary = currencySummaries.find((s) => s.currency === budget.currency) || currencySummaries[0]

  const todayStr = now.toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [selectedBarDate, setSelectedBarDate] = useState(todayStr)
  const [calendarMonth, setCalendarMonth] = useState(now.getMonth())
  const [calendarYear, setCalendarYear] = useState(now.getFullYear())

  const daysWithExpenses = new Set(expenses.map((e) => e.date))

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (6 - i))
    const ds = d.toISOString().split('T')[0]
    const dayExpenses = expenses.filter((e) => e.date === ds)
    const dayNames = ['D', 'L', 'M', 'X', 'J', 'V', 'S']
    const dayName = dayNames[d.getDay()]
    return {
      date: ds,
      day: d.getDate(),
      dayName,
      count: dayExpenses.length
    }
  })

  const maxBarCount = Math.max(...last7Days.map(d => d.count), 1)

  const selectedBarDateExpenses = expenses
    .filter((exp) => exp.date === selectedBarDate)
    .sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return timeB - timeA
    })

  const selectedDayExpenses = expenses
    .filter((exp) => exp.date === selectedDate)
    .sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return timeB - timeA
    })

  const prevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11)
      setCalendarYear(calendarYear - 1)
    } else {
      setCalendarMonth(calendarMonth - 1)
    }
  }

  const nextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0)
      setCalendarYear(calendarYear + 1)
    } else {
      setCalendarMonth(calendarMonth + 1)
    }
  }

  const goToToday = () => {
    setCalendarMonth(now.getMonth())
    setCalendarYear(now.getFullYear())
    setSelectedDate(todayStr)
  }

  return (
    <main className="min-h-screen bg-surface pb-24 md:pb-space-xl max-w-xl mx-auto md:max-w-none px-gutter md:px-space-xl">
      <div className="pt-16 md:pt-space-xl pb-6 flex flex-col">
        <div className="flex items-center justify-between mb-space-md">
          <div>
            <h1 className="text-headline-lg-mobile md:text-headline-xl text-on-surface font-bold tracking-tight">
              ¡Hola! 👋
            </h1>
            <p className="text-body-sm text-text-secondary mt-0.5 hidden md:block">
              Mantén tu economía tan fresca como una palta
            </p>
          </div>
          <div className="flex items-center gap-space-sm">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-surface-container rounded-full text-secondary text-label-md shadow-sm">
              <span className="text-[18px]">📅</span>
              <span>{now.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}</span>
            </div>
            <button
              onClick={() => router.push('/dashboard/add-expense')}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-on-secondary text-label-md font-semibold hover:bg-primary transition-all shadow-sm"
            >
              <span className="text-[18px]">➕</span>
              Agregar gasto
            </button>
          </div>
        </div>

        <p className="text-body-sm text-text-secondary mt-0.5 md:hidden">
          Mantén tu economía tan fresca como una palta
        </p>

        <div className="mb-space-md p-space-md rounded-2xl bg-secondary-container/40 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            🌿
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-label-lg text-on-secondary-container font-semibold">
                {primarySummary.alertMessage}
              </p>
              <span className="text-label-sm px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-medium">
                Quedan {daysRemaining} días
              </span>
            </div>
            <p className="text-body-sm text-on-surface-variant mt-0.5 leading-relaxed">
              {primarySummary.percentage >= 80
                ? `Has alcanzado el ${primarySummary.percentage.toFixed(0)}% de tu presupuesto en ${primarySummary.currency}. ${
                    primarySummary.remaining / daysRemaining > 0 && daysRemaining > 0
                      ? `Te sugerimos mantener tus consumos diarios en ${primarySummary.currency} ${(primarySummary.remaining / daysRemaining).toFixed(2)} para cerrar el mes en verde.`
                      : ''
                  }`
                : `Has gastado el ${primarySummary.percentage.toFixed(0)}% de tu presupuesto en ${primarySummary.currency}. ¡Sigue así!`
              }
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 md:gap-space-lg">
          <div className="relative overflow-hidden rounded-3xl bg-surface-container-low p-space-lg shadow-sm mb-space-lg md:mb-0">
            <div className="absolute -right-8 -bottom-10 w-44 h-44 rounded-full bg-primary-fixed/20 blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between mb-space-md">
              <div>
                <span className="text-label-sm text-text-secondary uppercase tracking-wider block">
                  Presupuestos mensuales
                </span>
              </div>
              <span className="text-label-sm px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-medium">
                {currencySummaries.length} {currencySummaries.length === 1 ? 'moneda' : 'monedas'}
              </span>
            </div>

            <div className="space-y-4 mb-space-lg">
              {currencySummaries.map((summary) => (
                <div key={summary.currency} className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-headline-sm font-bold text-on-surface">
                      {summary.currency} {summary.monthlyLimit.toFixed(2)}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-label-sm ${
                      summary.percentage >= 100
                        ? 'bg-danger/15 text-danger'
                        : summary.percentage >= 80
                        ? 'bg-warning/15 text-warning'
                        : summary.monthlyLimit > 0
                        ? 'bg-primary/15 text-primary'
                        : 'bg-surface-container text-text-secondary'
                    }`}>
                      {summary.monthlyLimit > 0 ? `${summary.percentage.toFixed(0)}%` : 'Sin límite'}
                    </span>
                  </div>
                  {summary.monthlyLimit > 0 && (
                    <>
                      <div className="w-full h-2.5 bg-surface-container-highest rounded-full overflow-hidden mb-2">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out ${
                            summary.percentage >= 100 ? 'bg-danger' : summary.percentage >= 80 ? 'bg-warning' : 'bg-primary'
                          }`}
                          style={{ width: `${summary.percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-body-sm">
                        <span className="text-on-surface-variant">
                          {summary.currency} {summary.totalExpenses.toFixed(2)} gastados
                        </span>
                        <span className="text-text-secondary">
                          {summary.currency} {summary.remaining.toFixed(2)} restantes
                        </span>
                      </div>
                    </>
                  )}
                  {summary.monthlyLimit === 0 && summary.totalExpenses > 0 && (
                    <div className="text-body-sm text-on-surface-variant">
                      {summary.currency} {summary.totalExpenses.toFixed(2)} registrados (sin presupuesto configurado)
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-space-md rounded-2xl bg-surface-container-lowest flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                  📅
                </div>
                <div>
                  <span className="text-label-sm text-text-secondary block">Días restantes del mes</span>
                  <span className="text-headline-sm text-secondary font-bold">{daysRemaining} días</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-space-sm mt-space-md">
              <button
                onClick={() => router.push('/dashboard/expenses')}
                className="w-full py-2.5 px-3 rounded-full bg-surface-container-high hover:bg-surface-variant text-on-surface text-label-md flex items-center justify-center gap-1.5 transition-colors active:scale-95"
              >
                <span className="text-primary text-[18px]">📊</span>
                Ver reporte
              </button>
              <button
                onClick={() => router.push('/dashboard/settings')}
                className="w-full py-2.5 px-3 rounded-full bg-surface-container-high hover:bg-surface-variant text-on-surface text-label-md flex items-center justify-center gap-1.5 transition-colors active:scale-95"
              >
                <span className="text-secondary text-[18px]">⚙️</span>
                Ajustar presupuestos
              </button>
            </div>
          </div>

          <div className="mb-space-lg p-space-md rounded-2xl bg-surface-container-low shadow-sm h-fit">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-label-lg font-semibold text-on-surface flex items-center gap-1.5">
                <span className="text-primary text-[18px]">📅</span>
                Gastos del día
              </h3>
              <button
                onClick={goToToday}
                className="text-label-sm text-primary font-semibold hover:text-primary-container px-2 py-1 rounded-full hover:bg-primary/10 transition-colors"
              >
                Hoy
              </button>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={prevMonth}
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  ←
                </button>
                <span className="text-label-lg text-on-surface font-semibold capitalize">
                  {MONTH_NAMES[calendarMonth]} {calendarYear}
                </span>
                <button
                  onClick={nextMonth}
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  →
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAY_NAMES.map((day) => (
                  <div key={day} className="text-center text-label-sm text-text-secondary font-medium py-1">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: getFirstDayOfMonth(calendarYear, calendarMonth) }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: getDaysInMonth(calendarYear, calendarMonth) }, (_, i) => {
                  const day = i + 1
                  const ds = dateStr(calendarYear, calendarMonth, day)
                  const isToday = ds === todayStr
                  const isSelected = ds === selectedDate
                  const hasExpenses = daysWithExpenses.has(ds)

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(ds)}
                      className={`relative w-full aspect-square rounded-full text-body-sm font-medium transition-all duration-150 ${
                        isSelected
                          ? 'bg-primary text-on-primary shadow-sm'
                          : isToday
                          ? 'bg-primary/20 text-primary font-bold'
                          : hasExpenses
                          ? 'bg-surface-container-high text-on-surface hover:bg-surface-variant'
                          : 'text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      {day}
                      {hasExpenses && !isSelected && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-4">
              {selectedDayExpenses.length === 0 ? (
                <div className="text-center py-6 flex flex-col items-center gap-2">
                  <span className="text-4xl opacity-50">📭</span>
                  <p className="text-body-sm text-on-surface-variant">
                    No hay gastos registrados para el{' '}
                    {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-body-sm text-on-surface-variant px-1">
                    <span>{selectedDayExpenses.length} {selectedDayExpenses.length === 1 ? 'gasto' : 'gastos'}</span>
                    <span className="font-semibold text-on-surface">
                      Total: {primarySummary.currency} {selectedDayExpenses.reduce((s, e) => s + e.amount, 0).toFixed(2)}
                    </span>
                  </div>
                  {selectedDayExpenses.map((expense) => {
                    const catInfo = getCategoryInfo(expense.category)
                    return (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-surface-container-lowest shadow-sm"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-[18px] shrink-0 bg-surface-container">
                            {catInfo.icon}
                          </div>
                          <div className="min-w-0">
                            <p className="text-label-md text-on-surface font-medium truncate">
                              {expense.description || catInfo.label}
                            </p>
                            <span className="text-label-sm text-text-secondary">{catInfo.label}</span>
                          </div>
                        </div>
                        <span className="text-label-md font-bold text-on-surface shrink-0 ml-2">
                          {expense.currency} {expense.amount.toFixed(2)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-space-lg p-space-lg rounded-2xl bg-surface-container-low shadow-sm">
          <h2 className="text-label-lg font-semibold text-on-surface mb-4">Actividad de los últimos 7 días</h2>
          <div className="flex items-end justify-between gap-2 h-32">
            {last7Days.map((day) => {
              const isSelected = day.date === selectedBarDate
              const isToday = day.date === todayStr
              const height = day.count > 0 ? (day.count / maxBarCount) * 100 : 8
              
              return (
                <button
                  key={day.date}
                  onClick={() => setSelectedBarDate(day.date)}
                  className="flex-1 flex flex-col items-center gap-2 group"
                >
                  <div className="w-full flex flex-col items-center justify-end h-24">
                    {day.count > 0 && (
                      <span className="text-label-sm text-on-surface font-semibold mb-1">{day.count}</span>
                    )}
                    <div
                      className={`w-full max-w-[40px] rounded-t-lg transition-all duration-200 ${
                        isSelected
                          ? 'bg-primary'
                          : isToday
                          ? 'bg-secondary'
                          : day.count > 0
                          ? 'bg-surface-container-highest group-hover:bg-secondary'
                          : 'bg-surface-container-high'
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className={`text-label-sm font-medium ${
                      isSelected ? 'text-primary' : isToday ? 'text-secondary' : 'text-on-surface-variant'
                    }`}>
                      {day.dayName}
                    </span>
                    <span className={`text-label-xs ${
                      isSelected ? 'text-primary' : 'text-text-secondary'
                    }`}>
                      {day.day}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-space-sm">
            <div className="flex items-center gap-2">
              <h2 className="text-headline-sm text-on-surface font-bold">
                Gastos registrados para el día{' '}
                {new Date(selectedBarDate + 'T12:00:00').toLocaleDateString('es-PE', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'numeric', 
                  year: 'numeric' 
                })}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-label-sm">
                {selectedBarDateExpenses.length}
              </span>
            </div>
            <button
              onClick={() => router.push('/dashboard/expenses')}
              className="text-label-md text-secondary font-semibold hover:text-primary hidden md:block"
            >
              Ver todos →
            </button>
          </div>

          {selectedBarDateExpenses.length === 0 ? (
            <div className="text-center py-space-xl">
              <span className="text-5xl mb-3 block opacity-50">📭</span>
              <p className="text-body-md text-on-surface-variant">
                No hay gastos registrados para este día
              </p>
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-container-high">
                      <th className="text-left text-label-sm text-text-secondary font-semibold px-4 py-3">Categoría</th>
                      <th className="text-left text-label-sm text-text-secondary font-semibold px-4 py-3">Descripción</th>
                      <th className="text-right text-label-sm text-text-secondary font-semibold px-4 py-3">Monto</th>
                      <th className="text-right text-label-sm text-text-secondary font-semibold px-4 py-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBarDateExpenses.map((expense) => {
                      const catInfo = getCategoryInfo(expense.category)
                      return (
                        <tr key={expense.id} className="border-b border-surface-container-last hover:bg-surface-container-low transition-colors last:border-0">
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 text-label-md text-on-surface">
                              <span className="text-[16px]">{catInfo.icon}</span>
                              {catInfo.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-body-md text-on-surface-variant">
                            {expense.description || '—'}
                          </td>
                          <td className="px-4 py-3 text-right text-label-lg font-bold text-on-surface">
                            - {expense.currency} {expense.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => router.push('/dashboard/expenses')}
                              className="text-label-sm text-secondary hover:text-primary transition-colors"
                            >
                              Editar
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-space-xs">
                {selectedBarDateExpenses.map((expense) => {
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
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-label-lg font-bold text-on-surface">
                          - {expense.currency} {expense.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
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

        <div className="fixed bottom-20 right-5 z-40 md:hidden">
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
