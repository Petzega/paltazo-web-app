export function getLocalDate(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function formatAmount(digits: string): string {
  if (!digits) return '0.00'
  const padded = digits.padStart(3, '0')
  const intPart = padded.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const decPart = padded.slice(-2)
  return `${intPart}.${decPart}`
}

export const CATEGORY_EMOJIS = ['🍔', '🚗', '🏠', '🎬', '🛒', '💊', '✈️', '📚', '💼', '🐾', '🎁', '💡', '⚽', '☕', '📱', '📦']

export const CATEGORY_COLORS = ['red', 'orange', 'amber', 'emerald', 'teal', 'blue', 'indigo', 'purple']
