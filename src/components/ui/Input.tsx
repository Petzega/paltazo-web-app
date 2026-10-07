import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
}

export function Input({ label, helperText, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="block text-label-md text-on-surface-variant mb-space-xs">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-body-lg text-on-surface focus:outline-none focus:border-primary ${className}`}
        {...props}
      />
      {helperText && (
        <p className="text-body-sm text-on-surface-variant mt-space-xs">{helperText}</p>
      )}
    </div>
  )
}
