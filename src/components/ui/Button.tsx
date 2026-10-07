import { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: Variant
  fullWidth?: boolean
}

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-secondary transition-colors',
  secondary: 'bg-primary-container text-on-primary hover:bg-primary-container/80',
  ghost: 'bg-transparent text-primary hover:bg-primary/10',
  danger: 'bg-danger text-white hover:bg-danger/90',
}

export function Button({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`text-label-lg py-4 px-6 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
