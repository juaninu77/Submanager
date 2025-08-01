'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { Plus, Sparkles, Zap, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { componentStyles } from '@/lib/design-tokens'

interface SmartAddButtonProps {
  onAddSubscription: () => void
  activeTab: string
  className?: string
}

export default function SmartAddButton({ 
  onAddSubscription, 
  activeTab,
  className 
}: SmartAddButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { scrollY } = useScroll()
  
  // Transform button position based on scroll
  const y = useTransform(scrollY, [0, 100], [0, 10])
  const scale = useTransform(scrollY, [0, 100], [1, 0.95])

  // Smart positioning based on tab
  const getButtonPosition = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'bottom-6 right-6'
      case 'cards':
        return 'bottom-6 right-6'
      case 'calendar':
        return 'bottom-24 right-6' // Higher to avoid calendar navigation
      default:
        return 'bottom-6 right-6'
    }
  }

  const getButtonVariant = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'primary'
      case 'cards':
        return 'accent'
      case 'calendar':
        return 'secondary'
      default:
        return 'primary'
    }
  }

  const buttonVariants = {
    primary: 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40',
    secondary: 'bg-gradient-to-r from-secondary-400 to-secondary-500 hover:from-secondary-500 hover:to-secondary-600 shadow-lg shadow-secondary-500/30 hover:shadow-xl hover:shadow-secondary-500/40',
    accent: 'bg-gradient-to-r from-accent-400 to-accent-500 hover:from-accent-500 hover:to-accent-600 shadow-lg shadow-accent-500/30 hover:shadow-xl hover:shadow-accent-500/40'
  }

  const quickActions = [
    { id: 'subscription', label: 'Suscripción', icon: CreditCard, action: onAddSubscription },
    { id: 'quick', label: 'Rápido', icon: Zap, action: onAddSubscription },
    { id: 'smart', label: 'Inteligente', icon: Sparkles, action: onAddSubscription },
  ]

  return (
    <div className={cn('fixed z-50', getButtonPosition(), className)}>
      <motion.div
        style={{ y, scale }}
        className="relative"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Quick Actions Menu */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.2, staggerChildren: 0.05 }}
              className="absolute bottom-16 right-0 flex flex-col space-y-3"
            >
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center space-x-3 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 px-4 py-3 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all duration-200 group"
                    onClick={action.action}
                  >
                    <Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                    <span className="font-medium text-sm whitespace-nowrap">
                      {action.label}
                    </span>
                  </motion.button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Add Button */}
        <motion.button
          className={cn(
            'w-16 h-16 rounded-full text-white border-0 font-medium transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-500/20 group relative overflow-hidden',
            buttonVariants[getButtonVariant()]
          )}
          onClick={() => setIsExpanded(!isExpanded)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          {/* Background Pulse */}
          <motion.div
            className="absolute inset-0 rounded-full bg-white/20"
            animate={{
              scale: isHovered ? [1, 1.2, 1] : 1,
              opacity: isHovered ? [0.5, 0, 0.5] : 0
            }}
            transition={{
              duration: 1.5,
              repeat: isHovered ? Infinity : 0,
              ease: 'easeInOut'
            }}
          />

          {/* Icon with Rotation */}
          <motion.div
            className="relative z-10 flex items-center justify-center"
            animate={{ rotate: isExpanded ? 45 : 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <Plus className="w-7 h-7 transition-transform duration-200 group-hover:scale-110" />
          </motion.div>

          {/* Ripple Effect */}
          <motion.div
            className="absolute inset-0 rounded-full bg-white/30"
            initial={{ scale: 0, opacity: 0 }}
            whileTap={{ scale: 1.2, opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        </motion.button>

        {/* Smart Tooltip */}
        <AnimatePresence>
          {isHovered && !isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="absolute right-20 top-1/2 transform -translate-y-1/2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-sm px-4 py-2 rounded-xl whitespace-nowrap font-medium shadow-lg"
            >
              Añadir Suscripción
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-neutral-900 dark:border-l-neutral-100" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contextual Helper */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2, duration: 0.5 }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-accent-500 rounded-full flex items-center justify-center"
          >
            <Sparkles className="w-3 h-3 text-white" />
          </motion.div>
        )}
      </motion.div>

      {/* Click Outside Handler */}
      {isExpanded && (
        <motion.div
          className="fixed inset-0 -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  )
}