import type { ExpenseCategory } from '@/types'

export interface CategoryInfo {
  id: ExpenseCategory
  label: string
  icon: string
  color: string
}

export const EXPENSE_CATEGORIES: CategoryInfo[] = [
  { id: 'food', label: 'Comida', icon: '🍽️', color: '#42690e' },
  { id: 'transport', label: 'Transporte', icon: '🚗', color: '#396a1c' },
  { id: 'services', label: 'Servicios', icon: '💡', color: '#904181' },
  { id: 'entertainment', label: 'Entretenimiento', icon: '🎬', color: '#F59E0B' },
  { id: 'other', label: 'Otros', icon: '📝', color: '#737969' },
]

export const getCategoryInfo = (id: ExpenseCategory): CategoryInfo =>
  EXPENSE_CATEGORIES.find((c) => c.id === id) ?? EXPENSE_CATEGORIES[4]

const CATEGORY_COLOR_CLASSES: Record<ExpenseCategory, string> = {
  food: 'bg-secondary-fixed text-secondary',
  transport: 'bg-primary-fixed text-primary',
  services: 'bg-surface-container-high text-on-surface-variant',
  entertainment: 'bg-tertiary-fixed text-tertiary',
  other: 'bg-surface-container text-on-surface-variant',
}

export function getCategoryColorClass(id: ExpenseCategory): string {
  return CATEGORY_COLOR_CLASSES[id]
}
