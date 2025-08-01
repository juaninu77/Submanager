'use client'

import { motion, useAnimationControls, useMotionValue, useTransform } from 'framer-motion'
import { forwardRef, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

// Magnetic Button - follows cursor when nearby
interface MagneticButtonProps {
  children: React.ReactNode
  className?: string
  magnetStrength?: number
  onClick?: () => void
}

export const MagneticButton = forwardRef<HTMLButtonElement, MagneticButtonProps>(({
  children,
  className,
  magnetStrength = 0.3,
  onClick
}, ref) => {
  const [isHovered, setIsHovered] = useState(false)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const x = useTransform(mouseX, [-100, 100], [-20 * magnetStrength, 20 * magnetStrength])
  const y = useTransform(mouseY, [-100, 100], [-20 * magnetStrength, 20 * magnetStrength])

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    mouseX.set(e.clientX - centerX)
    mouseY.set(e.clientY - centerY)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <motion.button
      ref={ref}
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        className
      )}
      style={{ x: isHovered ? x : 0, y: isHovered ? y : 0 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  )
})

MagneticButton.displayName = 'MagneticButton'

// Morphing Container - smooth shape transitions
interface MorphingContainerProps {
  children: React.ReactNode
  className?: string
  isExpanded: boolean
  collapsedHeight?: number
  expandedHeight?: number
}

export const MorphingContainer: React.FC<MorphingContainerProps> = ({
  children,
  className,
  isExpanded,
  collapsedHeight = 60,
  expandedHeight = 200
}) => {
  return (
    <motion.div
      className={cn('overflow-hidden', className)}
      animate={{
        height: isExpanded ? expandedHeight : collapsedHeight,
        borderRadius: isExpanded ? 24 : 16
      }}
      transition={{ 
        duration: 0.6, 
        ease: [0.23, 1, 0.32, 1] // Custom easing
      }}
    >
      <motion.div
        animate={{ 
          opacity: isExpanded ? 1 : 0.7,
          scale: isExpanded ? 1 : 0.95
        }}
        transition={{ duration: 0.4, delay: isExpanded ? 0.2 : 0 }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

// Stagger Animation Container
interface StaggerContainerProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className,
  staggerDelay = 0.1
}) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
    >
      {children}
    </motion.div>
  )
}

// Stagger Item
interface StaggerItemProps {
  children: React.ReactNode
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right'
}

export const StaggerItem: React.FC<StaggerItemProps> = ({
  children,
  className,
  direction = 'up'
}) => {
  const directions = {
    up: { y: 20, x: 0 },
    down: { y: -20, x: 0 },
    left: { y: 0, x: 20 },
    right: { y: 0, x: -20 }
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { 
          opacity: 0, 
          ...directions[direction]
        },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: {
            duration: 0.5,
            ease: 'easeOut'
          }
        }
      }}
    >
      {children}
    </motion.div>
  )
}

// Pulse Feedback - for successful actions
interface PulseFeedbackProps {
  isActive: boolean
  children: React.ReactNode
  className?: string
  color?: string
}

export const PulseFeedback: React.FC<PulseFeedbackProps> = ({
  isActive,
  children,
  className,
  color = 'rgb(34, 197, 94)' // green-500
}) => {
  return (
    <motion.div
      className={cn('relative', className)}
      animate={isActive ? 'pulse' : 'idle'}
      variants={{
        idle: { scale: 1 },
        pulse: {
          scale: [1, 1.05, 1],
          transition: {
            duration: 0.6,
            ease: 'easeInOut'
          }
        }
      }}
    >
      {children}
      
      {/* Pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 pointer-events-none"
        style={{ borderColor: color }}
        animate={isActive ? 'expand' : 'hidden'}
        variants={{
          hidden: { scale: 1, opacity: 0 },
          expand: {
            scale: [1, 1.3],
            opacity: [0.8, 0],
            transition: {
              duration: 0.8,
              ease: 'easeOut'
            }
          }
        }}
      />
    </motion.div>
  )
}

// Shake Animation - for errors or invalid actions
interface ShakeAnimationProps {
  isShaking: boolean
  children: React.ReactNode
  className?: string
}

export const ShakeAnimation: React.FC<ShakeAnimationProps> = ({
  isShaking,
  children,
  className
}) => {
  const controls = useAnimationControls()

  useEffect(() => {
    if (isShaking) {
      controls.start({
        x: [0, -10, 10, -10, 10, 0],
        transition: {
          duration: 0.5,
          ease: 'easeInOut'
        }
      })
    }
  }, [isShaking, controls])

  return (
    <motion.div
      className={className}
      animate={controls}
    >
      {children}
    </motion.div>
  )
}

// Loading Shimmer Effect
interface ShimmerProps {
  className?: string
  height?: number
  width?: string
}

export const Shimmer: React.FC<ShimmerProps> = ({
  className,
  height = 20,
  width = '100%'
}) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg bg-neutral-200 dark:bg-neutral-700',
        className
      )}
      style={{ height, width }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 dark:via-neutral-600/60 to-transparent"
        animate={{
          x: [-200, 200]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
    </div>
  )
}