import { ReactNode } from 'react'
import LoadingSpinner from './LoadingSpinner'

interface LoadingButtonProps {
  children: ReactNode
  onClick: () => void | Promise<void>
  loading?: boolean
  disabled?: boolean
  className?: string
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export default function LoadingButton({
  children,
  onClick,
  loading = false,
  disabled = false,
  className = '',
  variant = 'primary',
  size = 'md'
}: LoadingButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200'
  
  const variantClasses = {
    primary: 'bg-primary text-white hover:brightness-95 disabled:bg-primary/60',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400'
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5'
  }

  const isDisabled = disabled || loading

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${isDisabled ? 'cursor-not-allowed' : ''}`}
    >
      {loading && <LoadingSpinner size={size === 'lg' ? 'md' : 'sm'} />}
      <span className={loading ? 'opacity-70' : ''}>{children}</span>
    </button>
  )
}