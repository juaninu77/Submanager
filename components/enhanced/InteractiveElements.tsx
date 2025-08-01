import React, { useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/enhanced-button'
import { Card } from '@/components/ui/enhanced-card'
import { useMicroInteractions } from '@/hooks/use-haptics'
import { Check, X, Heart, Star, Trash2, Plus } from 'lucide-react'

// Enhanced Interactive Button with micro-interactions
interface EnhancedButtonProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'danger' | 'love'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export function EnhancedButton({ 
  children, 
  variant = 'default', 
  size = 'md',
  onClick,
  disabled = false,
  className = ''
}: EnhancedButtonProps) {
  const { triggerMicroInteraction } = useMicroInteractions()
  const [isPressed, setIsPressed] = useState(false)

  const handlePress = () => {
    if (disabled) return
    
    setIsPressed(true)
    triggerMicroInteraction('button_press', { intensity: 'light' })
    onClick?.()
    
    setTimeout(() => setIsPressed(false), 150)
  }

  const variants = {
    default: 'bg-primary-500 hover:bg-primary-600',
    success: 'bg-green-500 hover:bg-green-600',
    danger: 'bg-red-500 hover:bg-red-600',
    love: 'bg-pink-500 hover:bg-pink-600'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <motion.button
      className={`
        ${variants[variant]} ${sizes[size]}
        text-white font-medium rounded-lg
        transition-all duration-200 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
        ${className}
      `}
      onClick={handlePress}
      disabled={disabled}
      whileTap={{ scale: 0.95 }}
      animate={{ 
        scale: isPressed ? 0.95 : 1,
        boxShadow: isPressed 
          ? '0 2px 4px rgba(0,0,0,0.1)' 
          : '0 4px 8px rgba(0,0,0,0.15)'
      }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      {children}
    </motion.button>
  )
}

// Swipeable Card with gesture feedback
interface SwipeableCardProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  leftAction?: { icon: React.ReactNode; color: string; label: string }
  rightAction?: { icon: React.ReactNode; color: string; label: string }
  className?: string
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction = { icon: <Trash2 className="w-5 h-5" />, color: 'bg-red-500', label: 'Eliminar' },
  rightAction = { icon: <Heart className="w-5 h-5" />, color: 'bg-green-500', label: 'Favorito' },
  className = ''
}: SwipeableCardProps) {
  const { triggerMicroInteraction } = useMicroInteractions()
  const x = useSpring(0, { stiffness: 300, damping: 30 })
  const [isDragging, setIsDragging] = useState(false)

  const leftActionOpacity = useTransform(x, [-100, -50, 0], [1, 0.5, 0])
  const rightActionOpacity = useTransform(x, [0, 50, 100], [0, 0.5, 1])
  const cardRotate = useTransform(x, [-100, 0, 100], [-5, 0, 5])

  const handleDragStart = () => {
    setIsDragging(true)
    triggerMicroInteraction('drag_start', { intensity: 'light' })
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    const currentX = x.get()
    
    if (currentX < -80 && onSwipeLeft) {
      triggerMicroInteraction('delete', { intensity: 'medium' })
      onSwipeLeft()
    } else if (currentX > 80 && onSwipeRight) {
      triggerMicroInteraction('add', { intensity: 'medium' })
      onSwipeRight()
    }
    
    triggerMicroInteraction('drag_end', { intensity: 'light' })
    x.set(0)
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Left Action */}
      <motion.div
        className={`absolute left-0 top-0 h-full w-20 ${leftAction.color} flex items-center justify-center z-0`}
        style={{ opacity: leftActionOpacity }}
      >
        <div className="text-white text-center">
          {leftAction.icon}
          <div className="text-xs mt-1">{leftAction.label}</div>
        </div>
      </motion.div>

      {/* Right Action */}
      <motion.div
        className={`absolute right-0 top-0 h-full w-20 ${rightAction.color} flex items-center justify-center z-0`}
        style={{ opacity: rightActionOpacity }}
      >
        <div className="text-white text-center">
          {rightAction.icon}
          <div className="text-xs mt-1">{rightAction.label}</div>
        </div>
      </motion.div>

      {/* Card Content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 100 }}
        dragElastic={0.2}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{ 
          x,
          rotate: cardRotate,
          zIndex: isDragging ? 10 : 1
        }}
        animate={{
          scale: isDragging ? 1.02 : 1,
          boxShadow: isDragging 
            ? '0 8px 25px rgba(0,0,0,0.15)' 
            : '0 2px 8px rgba(0,0,0,0.1)'
        }}
        className="bg-white dark:bg-gray-800 rounded-lg cursor-grab active:cursor-grabbing"
      >
        {children}
      </motion.div>
    </div>
  )
}

// Bouncy Add Button
interface BouncyAddButtonProps {
  onAdd: () => void
  className?: string
}

export function BouncyAddButton({ onAdd, className = '' }: BouncyAddButtonProps) {
  const { triggerMicroInteraction } = useMicroInteractions()
  const [isAdding, setIsAdding] = useState(false)

  const handleAdd = () => {
    setIsAdding(true)
    triggerMicroInteraction('add', { intensity: 'medium' })
    
    setTimeout(() => {
      onAdd()
      setIsAdding(false)
    }, 300)
  }

  return (
    <motion.button
      className={`
        w-14 h-14 bg-primary-500 hover:bg-primary-600 
        text-white rounded-full shadow-lg
        flex items-center justify-center
        fixed bottom-6 right-6 z-50
        focus:outline-none focus:ring-4 focus:ring-primary-300
        ${className}
      `}
      onClick={handleAdd}
      whileTap={{ scale: 0.9 }}
      animate={isAdding ? {
        scale: [1, 1.2, 1],
        rotate: [0, 180, 360]
      } : {
        scale: 1,
        rotate: 0
      }}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 20,
        duration: isAdding ? 0.6 : 0.2
      }}
      whileHover={{ 
        scale: 1.1,
        boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
      }}
    >
      <motion.div
        animate={isAdding ? { rotate: 180 } : { rotate: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Plus className="w-6 h-6" />
      </motion.div>
    </motion.button>
  )
}

// Rating Stars with haptic feedback
interface InteractiveRatingProps {
  rating: number
  onRatingChange: (rating: number) => void
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function InteractiveRating({
  rating,
  onRatingChange,
  maxRating = 5,
  size = 'md',
  className = ''
}: InteractiveRatingProps) {
  const { triggerMicroInteraction } = useMicroInteractions()
  const [hoverRating, setHoverRating] = useState(0)

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const handleStarClick = (value: number) => {
    triggerMicroInteraction('toggle', { intensity: 'light' })
    onRatingChange(value)
  }

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {Array.from({ length: maxRating }, (_, index) => {
        const starValue = index + 1
        const isActive = starValue <= (hoverRating || rating)
        
        return (
          <motion.button
            key={index}
            className="focus:outline-none focus:ring-2 focus:ring-primary-300 rounded"
            onClick={() => handleStarClick(starValue)}
            onMouseEnter={() => setHoverRating(starValue)}
            onMouseLeave={() => setHoverRating(0)}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
            animate={{
              color: isActive ? '#fbbf24' : '#d1d5db'
            }}
            transition={{ duration: 0.15 }}
          >
            <Star 
              className={`${sizes[size]} ${isActive ? 'fill-current' : ''}`}
            />
          </motion.button>
        )
      })}
    </div>
  )
}

// Toggle Switch with micro-interactions
interface EnhancedToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function EnhancedToggle({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'md',
  className = ''
}: EnhancedToggleProps) {
  const { triggerMicroInteraction } = useMicroInteractions()

  const handleToggle = () => {
    if (disabled) return
    
    triggerMicroInteraction('toggle', { intensity: 'light' })
    onChange(!checked)
  }

  const sizes = {
    sm: { track: 'w-8 h-4', thumb: 'w-3 h-3' },
    md: { track: 'w-11 h-6', thumb: 'w-5 h-5' },
    lg: { track: 'w-14 h-7', thumb: 'w-6 h-6' }
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <motion.button
        className={`
          ${sizes[size].track}
          relative inline-flex items-center rounded-full
          transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-primary-300
          ${checked ? 'bg-primary-500' : 'bg-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onClick={handleToggle}
        disabled={disabled}
        whileTap={disabled ? {} : { scale: 0.95 }}
      >
        <motion.div
          className={`
            ${sizes[size].thumb}
            bg-white rounded-full shadow-md
            flex items-center justify-center
          `}
          animate={{
            x: checked ? 
              (size === 'sm' ? 16 : size === 'md' ? 20 : 28) : 
              2
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          {checked && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Check className="w-3 h-3 text-primary-500" />
            </motion.div>
          )}
        </motion.div>
      </motion.button>
      
      {label && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
      )}
    </div>
  )
}