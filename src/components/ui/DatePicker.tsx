'use client'

import { useState, useEffect, useMemo } from 'react'

interface DatePickerProps {
  value: string // YYYY-MM-DD
  onChange: (value: string) => void
  isOpen: boolean
  onClose: () => void
}

const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
]

function parseDate(str: string) {
  const [y, m, d] = str.split('-').map(Number)
  return { year: y, month: m - 1, day: d }
}

function formatDay(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function getLocalToday(): { year: number; month: number; day: number } {
  const d = new Date()
  return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() }
}

export function DatePicker({ value, onChange, isOpen, onClose }: DatePickerProps) {
  const { year: initialYear, month: initialMonth } = parseDate(value)
  const today = getLocalToday()
  const todayStr = formatDay(today.year, today.month, today.day)

  const [viewYear, setViewYear] = useState(initialYear)
  const [viewMonth, setViewMonth] = useState(initialMonth)

  // Sincronizar solo cuando value cambia externamente (handleClear, etc.)
  useEffect(() => {
    const { year, month } = parseDate(value)
    setViewYear(year)
    setViewMonth(month)
  }, [value])

  const days = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1)
    const startOffset = (firstDay.getDay() + 6) % 7
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate()

    const grid: { year: number; month: number; day: number; currentMonth: boolean }[] = []

    for (let i = startOffset - 1; i >= 0; i--) {
      const day = prevMonthDays - i
      const m = viewMonth === 0 ? 11 : viewMonth - 1
      const y = viewMonth === 0 ? viewYear - 1 : viewYear
      grid.push({ year: y, month: m, day, currentMonth: false })
    }
    for (let i = 1; i <= daysInMonth; i++) {
      grid.push({ year: viewYear, month: viewMonth, day: i, currentMonth: true })
    }
    const remaining = (7 - (grid.length % 7)) % 7
    for (let i = 1; i <= remaining; i++) {
      const m = viewMonth === 11 ? 0 : viewMonth + 1
      const y = viewMonth === 11 ? viewYear + 1 : viewYear
      grid.push({ year: y, month: m, day: i, currentMonth: false })
    }
    return grid
  }, [viewYear, viewMonth])

  if (!isOpen) return null

  const handleSelect = (year: number, month: number, day: number) => {
    onChange(formatDay(year, month, day))
    onClose()
  }

  const goToToday = () => {
    setViewYear(today.year)
    setViewMonth(today.month)
    onChange(todayStr)
    onClose()
  }

  const goPrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) }
    else setViewMonth(viewMonth - 1)
  }

  const goNext = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) }
    else setViewMonth(viewMonth + 1)
  }

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm p-gutter"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-space-md border-b border-surface-container-low">
          <button
            type="button"
            onClick={goPrev}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors"
            aria-label="Mes anterior"
          >
            ‹
          </button>
          <span className="text-label-lg font-semibold text-on-surface capitalize">
            {MONTHS[viewMonth]} de {viewYear}
          </span>
          <button
            type="button"
            onClick={goNext}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors"
            aria-label="Mes siguiente"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 px-space-md pt-space-sm">
          {DAYS.map((d) => (
            <div key={d} className="text-label-xs text-text-secondary text-center py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 px-space-md pb-space-sm">
          {days.map((cell, i) => {
            const formatted = formatDay(cell.year, cell.month, cell.day)
            const isSelected = formatted === value
            const isToday = formatted === todayStr
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(cell.year, cell.month, cell.day)}
                className={`relative h-10 flex items-center justify-center rounded-full transition-colors
                  ${!cell.currentMonth ? 'text-text-secondary/40' : 'text-on-surface'}
                  ${isSelected
                    ? 'bg-primary-container text-on-primary-container font-bold'
                    : isToday
                      ? 'bg-surface-container-high font-semibold'
                      : 'hover:bg-surface-container-high'
                  }`}
              >
                {cell.day}
              </button>
            )
          })}
        </div>

        <div className="flex justify-end p-space-md border-t border-surface-container-low">
          <button
            type="button"
            onClick={goToToday}
            className="px-4 py-1.5 rounded-full text-label-md text-secondary hover:bg-secondary/10 transition-colors font-medium"
          >
            Hoy
          </button>
        </div>
      </div>
    </div>
  )
}
