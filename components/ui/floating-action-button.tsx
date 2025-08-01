'use client'

import { forwardRef } from 'react'
import { motion, MotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

export interface FloatingActionButtonProps extends MotionProps {
  className?: string
  icon: LucideIcon
  label?: string
  variant?: 'primary' | 'secondary' | 'white' | 'organic'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  disabled?: boolean
}

const FloatingActionButton = forwardRef<HTMLButtonElement, FloatingActionButtonProps>(({
  className,
  icon: Icon,
  label,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  ...props
}, ref) => {
  const variants = {
    primary: 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40',
    secondary: 'bg-gradient-to-r from-secondary-400 to-secondary-500 hover:from-secondary-500 hover:to-secondary-600 text-white shadow-lg shadow-secondary-500/30 hover:shadow-xl hover:shadow-secondary-500/40',
    white: 'bg-white hover:bg-white-snow text-neutral-700 shadow-lg hover:shadow-xl border border-white-mist hover:border-white-cloud',
    organic: 'bg-gradient-to-r from-accent-400 to-accent-500 hover:from-accent-500 hover:to-accent-600 text-white shadow-lg shadow-accent-500/30 hover:shadow-xl hover:shadow-accent-500/40'
  }

  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16'
  }

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6', 
    lg: 'w-7 h-7'
  }

  return (
    <motion.button
      ref={ref}
      className={cn(
        'fixed bottom-6 right-6 z-50 rounded-full border-0 font-medium transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed group',
        sizes[size],
        variants[variant],
        className
      )}
      onClick={onClick}
      disabled={disabled}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ 
        initial: { duration: 0.4, ease: 'easeOut' },
        hover: { duration: 0.2 },
        tap: { duration: 0.1 }
      }}
      {...props}
    >
      <div className="flex items-center justify-center">
        <Icon className={cn(iconSizes[size], 'transition-transform duration-200 group-hover:scale-110')} />
      </div>
      
      {/* Ripple effect on click */}
      <motion.div
        className="absolute inset-0 rounded-full bg-white/20"
        initial={{ scale: 0, opacity: 0 }}
        whileTap={{ scale: 1.2, opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Tooltip */}
      {label && (
        <motion.div
          className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-neutral-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          initial={{ opacity: 0, x: 10 }}
          whileHover={{ opacity: 1, x: 0 }}
        >
          {label}
          <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-neutral-900" />
        </motion.div>
      )}
    </motion.button>
  )
})

FloatingActionButton.displayName = 'FloatingActionButton'

export { FloatingActionButton }