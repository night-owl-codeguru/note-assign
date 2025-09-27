import { ReactNode } from 'react'
import { motion } from 'framer-motion'

export default function Card({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`rounded-xl border border-gray-200 bg-white/90 shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      {children}
    </motion.div>
  )
}
