import { motion } from 'framer-motion'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'white' | 'primary' | 'gray'
}

export default function LoadingSpinner({ size = 'md', color = 'white' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-6 w-6'
  }

  const colorClasses = {
    white: 'border-white border-t-white/30',
    primary: 'border-primary border-t-primary/30',
    gray: 'border-gray-400 border-t-gray-400/30'
  }

  return (
    <motion.div
      className={`${sizeClasses[size]} border-2 rounded-full ${colorClasses[color]}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  )
}