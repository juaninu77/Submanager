'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Zap, 
  CreditCard, 
  Calendar,
  FileText,
  Upload,
  Download,
  Copy,
  MoreVertical
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SmartActionMenuProps {
  activeTab: string
  onAddSubscription: () => void
  onQuickAdd?: () => void
  onImport?: () => void
  onExport?: () => void
  className?: string
}

export default function SmartActionMenu({
  activeTab,
  onAddSubscription,
  onQuickAdd,
  onImport,
  onExport,
  className
}: SmartActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<'bottom' | 'top'>('bottom')
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Smart positioning based on viewport
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      
      setPosition(spaceBelow < 300 && spaceAbove > spaceBelow ? 'top' : 'bottom')
    }
  }, [isOpen])

  // Get contextual actions based on active tab
  const getContextualActions = () => {
    const baseActions = [
      {
        id: 'add-subscription',
        label: 'Añadir Suscripción',
        icon: CreditCard,
        action: onAddSubscription,
        primary: true
      }
    ]

    switch (activeTab) {
      case 'dashboard':
        return [
          ...baseActions,
          {
            id: 'quick-add',
            label: 'Agregar Rápido',
            icon: Zap,
            action: onQuickAdd || onAddSubscription,
            primary: false
          },
          {
            id: 'import',
            label: 'Importar Datos',
            icon: Upload,
            action: onImport || (() => {}),
            primary: false
          }
        ]
      
      case 'cards':
        return [
          ...baseActions,
          {
            id: 'bulk-add',
            label: 'Agregar Múltiples',
            icon: Copy,
            action: onAddSubscription,
            primary: false
          },
          {
            id: 'import',
            label: 'Importar CSV',
            icon: Upload,
            action: onImport || (() => {}),
            primary: false
          }
        ]
      
      case 'calendar':
        return [
          ...baseActions,
          {
            id: 'schedule',
            label: 'Programar Pago',
            icon: Calendar,
            action: onAddSubscription,
            primary: false
          },
          {
            id: 'export-calendar',
            label: 'Exportar Calendario',
            icon: Download,
            action: onExport || (() => {}),
            primary: false
          }
        ]
      
      default:
        return baseActions
    }
  }

  const actions = getContextualActions()
  const primaryAction = actions.find(a => a.primary)
  const secondaryActions = actions.filter(a => !a.primary)

  // Quick action (just primary button)
  if (secondaryActions.length === 0) {
    return (
      <motion.button
        className={cn(
          'fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-500/20 z-40',
          className
        )}
        onClick={primaryAction?.action}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Plus className="w-6 h-6" />
      </motion.button>
    )
  }

  return (
    <div className={cn('fixed bottom-6 right-6 z-40', className)} ref={menuRef}>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/20 -z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Secondary Actions */}
            <motion.div
              className={cn(
                'absolute right-0 flex flex-col space-y-3',
                position === 'top' ? 'bottom-16 flex-col-reverse' : 'bottom-16'
              )}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2, staggerChildren: 0.05 }}
            >
              {secondaryActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <motion.button
                    key={action.id}
                    className="flex items-center space-x-3 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 px-4 py-3 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all duration-200 group whitespace-nowrap"
                    onClick={() => {
                      action.action()
                      setIsOpen(false)
                    }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                    <span className="font-medium text-sm">{action.label}</span>
                  </motion.button>
                )
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Action Button */}
      <motion.button
        ref={buttonRef}
        className="w-14 h-14 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-500/20 relative group"
        onClick={() => {
          if (secondaryActions.length > 0) {
            setIsOpen(!isOpen)
          } else {
            primaryAction?.action()
          }
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Background Pulse */}
        <motion.div
          className="absolute inset-0 rounded-full bg-white/20"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />

        {/* Icon with Rotation */}
        <motion.div
          className="relative z-10 flex items-center justify-center"
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {secondaryActions.length > 0 ? (
            <Plus className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
          ) : (
            <CreditCard className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
          )}
        </motion.div>

        {/* Tooltip */}
        <motion.div
          className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-sm px-3 py-2 rounded-lg whitespace-nowrap font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          initial={{ opacity: 0, x: 10 }}
          whileHover={{ opacity: 1, x: 0 }}
        >
          {secondaryActions.length > 0 ? 'Acciones rápidas' : primaryAction?.label}
          <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-neutral-900 dark:border-l-neutral-100" />
        </motion.div>

        {/* Context Indicator */}
        {(['dashboard', 'cards'].includes(activeTab)) && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-secondary-500 rounded-full flex items-center justify-center"
          >
            <MoreVertical className="w-3 h-3 text-white" />
          </motion.div>
        )}
      </motion.button>
    </div>
  )
}