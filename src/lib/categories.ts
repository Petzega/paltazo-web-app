import type { Category } from '@/types'

// 8 colores Tailwind del spec (docs/use-case/categories/categories.md)
// Map estático porque Tailwind NO soporta clases dinámicas `bg-${color}-500/15`
const COLOR_CLASS_MAP: Record<string, string> = {
  red: 'bg-red-500/40 text-red-700 dark:text-red-300',
  orange: 'bg-orange-500/40 text-orange-700 dark:text-orange-300',
  amber: 'bg-amber-500/40 text-amber-700 dark:text-amber-300',
  emerald: 'bg-emerald-500/40 text-emerald-700 dark:text-emerald-300',
  teal: 'bg-teal-500/40 text-teal-700 dark:text-teal-300',
  blue: 'bg-blue-500/40 text-blue-700 dark:text-blue-300',
  indigo: 'bg-indigo-500/40 text-indigo-700 dark:text-indigo-300',
  purple: 'bg-purple-500/40 text-purple-700 dark:text-purple-300',
}

export function getCategoryColorClass(color: string): string {
  return COLOR_CLASS_MAP[color] ?? 'bg-surface-container text-on-surface-variant'
}

export function findCategory<T extends { id: string; isProtected: boolean }>(categories: T[], id: string): T {
  return categories.find((c) => c.id === id) ?? categories.find((c) => c.isProtected) ?? categories[0]
}
