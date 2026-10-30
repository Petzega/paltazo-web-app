import type { Category } from '@/types'

// 8 colores Tailwind del spec (docs/use-case/categories/categories.md)
const TAILWIND_COLORS = ['red', 'orange', 'amber', 'emerald', 'teal', 'blue', 'indigo', 'purple'] as const

export function getCategoryColorClass(color: string): string {
  if (!TAILWIND_COLORS.includes(color as typeof TAILWIND_COLORS[number])) return 'bg-surface-container text-on-surface-variant'
  return `bg-${color}-500/15 text-${color}-600 dark:text-${color}-400`
}

export function findCategory<T extends { id: string; isProtected: boolean }>(categories: T[], id: string): T {
  return categories.find((c) => c.id === id) ?? categories.find((c) => c.isProtected) ?? categories[0]
}
