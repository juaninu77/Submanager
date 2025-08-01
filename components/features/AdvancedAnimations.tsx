import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView, useAnimation, useSpring } from 'framer-motion'
import { useAccessibility } from '@/hooks/use-accessibility'

// Animation variants
export const animationVariants = {
  // Page transitions
  pageTransition: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeInOut' }
  },

  // Slide in from different directions
  slideInLeft: {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
    transition: { duration: 0.4, ease: 'easeOut' }
  },

  slideInRight: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
    transition: { duration: 0.4, ease: 'easeOut' }
  },

  slideInUp: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
    transition: { duration: 0.4, ease: 'easeOut' }
  },

  slideInDown: {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
    transition: { duration: 0.4, ease: 'easeOut' }
  },

  // Scale animations
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },

  scaleInBounce: {
    initial: { opacity: 0, scale: 0.3 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.3 },
    transition: { 
      duration: 0.6, 
      ease: 'easeOut',
      scale: { type: 'spring', damping: 10, stiffness: 100 }
    }
  },

  // Rotate animations
  rotateIn: {
    initial: { opacity: 0, rotate: -180 },
    animate: { opacity: 1, rotate: 0 },
    exit: { opacity: 0, rotate: 180 },
    transition: { duration: 0.6, ease: 'easeOut' }
  },

  // Stagger children
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  },

  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: 'easeOut' }
  },

  // Special effects
  floatIn: {
    initial: { opacity: 0, y: 30, scale: 0.9 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: { 
      opacity: 0, 
      y: -30, 
      scale: 0.9,
      transition: { duration: 0.3 }
    }
  },

  // Hover animations
  cardHover: {
    rest: { scale: 1, y: 0 },
    hover: { 
      scale: 1.02, 
      y: -5,
      transition: { duration: 0.2, ease: 'easeOut' }
    },
    tap: { scale: 0.98 }
  },

  buttonHover: {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  }
}

// Animated wrapper component
interface AnimatedWrapperProps {
  children: React.ReactNode
  variant?: keyof typeof animationVariants
  className?: string
  delay?: number
  custom?: any
}

export function AnimatedWrapper({ 
  children, 
  variant = 'pageTransition', 
  className = '',
  delay = 0,
  custom
}: AnimatedWrapperProps) {
  const { preferences } = useAccessibility()
  const animation = animationVariants[variant]

  // Respect reduce motion preference
  if (preferences.reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={animation.initial}
      animate={animation.animate}
      exit={animation.exit}
      transition={{ ...animation.transition, delay }}
      custom={custom}
    >
      {children}
    </motion.div>
  )
}

// Scroll-triggered animations
interface ScrollAnimationProps {
  children: React.ReactNode
  variant?: keyof typeof animationVariants
  className?: string
  threshold?: number
  triggerOnce?: boolean
}

export function ScrollAnimation({ 
  children, 
  variant = 'slideInUp', 
  className = '',
  threshold = 0.1,
  triggerOnce = true
}: ScrollAnimationProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { threshold, once: triggerOnce })
  const { preferences } = useAccessibility()
  const animation = animationVariants[variant]

  if (preferences.reduceMotion) {
    return <div ref={ref} className={className}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={animation.initial}
      animate={isInView ? animation.animate : animation.initial}
      transition={animation.transition}
    >
      {children}
    </motion.div>
  )
}

// Staggered list animation
interface StaggeredListProps {
  children: React.ReactNode[]
  className?: string
  itemClassName?: string
  staggerDelay?: number
}

export function StaggeredList({ 
  children, 
  className = '',
  itemClassName = '',
  staggerDelay = 0.1
}: StaggeredListProps) {
  const { preferences } = useAccessibility()

  if (preferences.reduceMotion) {
    return (
      <div className={className}>
        {children.map((child, index) => (
          <div key={index} className={itemClassName}>
            {child}
          </div>
        ))}
      </div>
    )
  }

  return (
    <motion.div
      className={className}
      variants={animationVariants.staggerContainer}
      initial="initial"
      animate="animate"
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          className={itemClassName}
          variants={{
            ...animationVariants.staggerItem,
            transition: { 
              ...animationVariants.staggerItem.transition,
              delay: index * staggerDelay
            }
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

// Page transition wrapper
interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const { preferences } = useAccessibility()

  if (preferences.reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={className}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Floating animation for decorative elements
interface FloatingElementProps {
  children: React.ReactNode
  className?: string
  duration?: number
  yOffset?: number
}

export function FloatingElement({ 
  children, 
  className = '',
  duration = 3,
  yOffset = 10
}: FloatingElementProps) {
  const { preferences } = useAccessibility()

  if (preferences.reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      animate={{
        y: [-yOffset, yOffset, -yOffset],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  )
}

// Count up animation for numbers
interface CountUpProps {
  from: number
  to: number
  duration?: number
  className?: string
  prefix?: string
  suffix?: string
}

export function CountUp({ 
  from, 
  to, 
  duration = 2, 
  className = '',
  prefix = '',
  suffix = ''
}: CountUpProps) {
  const [count, setCount] = useState(from)
  const { preferences } = useAccessibility()

  useEffect(() => {
    if (preferences.reduceMotion) {
      setCount(to)
      return
    }

    const controls = useAnimation()
    const spring = useSpring(from, { 
      stiffness: 100, 
      damping: 30,
      restDelta: 0.001
    })

    spring.onChange((value) => {
      setCount(Math.round(value))
    })

    spring.set(to)

    return () => spring.destroy()
  }, [from, to, preferences.reduceMotion])

  return (
    <span className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}

// Loading animations
export function PulsingDot({ className = '' }: { className?: string }) {
  const { preferences } = useAccessibility()

  if (preferences.reduceMotion) {
    return <div className={`w-2 h-2 bg-current rounded-full ${className}`} />
  }

  return (
    <motion.div
      className={`w-2 h-2 bg-current rounded-full ${className}`}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [1, 0.5, 1]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
  )
}

export function BouncingDots({ className = '' }: { className?: string }) {
  const { preferences } = useAccessibility()

  if (preferences.reduceMotion) {
    return (
      <div className={`flex space-x-1 ${className}`}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-2 h-2 bg-current rounded-full" />
        ))}
      </div>
    )
  }

  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-current rounded-full"
          animate={{
            y: [-8, 8, -8]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  )
}

// Morphing button
interface MorphingButtonProps {
  children: React.ReactNode
  isLoading?: boolean
  className?: string
  onClick?: () => void
}

export function MorphingButton({ 
  children, 
  isLoading = false, 
  className = '',
  onClick
}: MorphingButtonProps) {
  const { preferences } = useAccessibility()

  return (
    <motion.button
      className={className}
      onClick={onClick}
      disabled={isLoading}
      layout
      initial={false}
      animate={{
        scale: isLoading ? 0.95 : 1,
      }}
      whileTap={preferences.reduceMotion ? {} : { scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center space-x-2"
          >
            <BouncingDots />
            <span>Cargando...</span>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}