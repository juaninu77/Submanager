'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { motion, MotionProps } from 'framer-motion'

export interface GlassmorphismCardProps extends MotionProps {
  className?: string
  children: React.ReactNode
  variant?: 'default' | 'elevated' | 'interactive' | 'premium'
  blur?: 'sm' | 'md' | 'lg' | 'xl'
  opacity?: number
}

const GlassmorphismCard = forwardRef<HTMLDivElement, GlassmorphismCardProps>(({
  className,
  children,
  variant = 'default',
  blur = 'md',
  opacity = 0.8,
  ...props
}, ref) => {
  const variants = {
    default: 'border border-white/20 shadow-lg',
    elevated: 'border border-white/30 shadow-xl hover:shadow-2xl',
    interactive: 'border border-white/20 shadow-lg hover:shadow-xl hover:border-white/40 cursor-pointer transition-all duration-300 hover:-translate-y-1',
    premium: 'border border-white/40 shadow-2xl backdrop-saturate-150'
  }

  const blurMap = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md', 
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl'
  }

  return (
    <motion.div
      ref={ref}
      className={cn(
        'relative overflow-hidden rounded-3xl',
        blurMap[blur],
        variants[variant],
        className
      )}
      style={{
        backgroundColor: `rgba(255, 255, 255, ${opacity})`
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      {...props}
    >
      {/* Gradient overlay for extra depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      
      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg className="w-full h-full">
          <filter id="noise">
            <feTurbulence baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/>
            <feColorMatrix type="saturate" values="0"/>
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" opacity="0.1"/>
        </svg>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Animated border glow */}
      <div className="absolute inset-0 rounded-3xl border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  )
})

GlassmorphismCard.displayName = 'GlassmorphismCard'

export { GlassmorphismCard }