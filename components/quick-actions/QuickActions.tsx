'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Calculator, 
  Calendar, 
  Settings, 
  Zap,
  Command,
  DollarSign,
  Clock,
  Target,
  X,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useSubscriptionsContext } from '@/contexts/AppContext'
import { useMicroInteractions } from '@/hooks/use-haptics'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  shortcut?: string
  action: () => void
  category: 'create' | 'navigate' | 'calculate' | 'settings'
  keywords: string[]
}

interface QuickActionsProps {
  onAddSubscription?: () => void
  onNavigate?: (path: string) => void
  className?: string
}

export function QuickActions({ onAddSubscription, onNavigate, className = '' }: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const { subscriptions, totalMonthly } = useSubscriptionsContext()
  const { triggerMicroInteraction } = useMicroInteractions()
  const inputRef = useRef<HTMLInputElement>(null)

  // Quick Actions Definition
  const quickActions: QuickAction[] = [
    {
      id: 'add-subscription',
      title: 'Agregar Suscripción',
      description: 'Añadir nueva suscripción rápidamente',
      icon: <Plus className="w-5 h-5" />,
      shortcut: 'Ctrl+N',
      action: () => {
        onAddSubscription?.()
        setIsOpen(false)
      },
      category: 'create',
      keywords: ['agregar', 'nuevo', 'crear', 'suscripcion', 'servicio', 'add']
    },
    {
      id: 'quick-calculator',
      title: 'Calculadora Rápida',
      description: 'Calcular gastos totales y proyecciones',
      icon: <Calculator className="w-5 h-5" />,
      shortcut: 'Ctrl+C',
      action: () => {
        alert(`Gasto total: $${totalMonthly.toFixed(2)}/mes\nProyección anual: $${(totalMonthly * 12).toFixed(2)}`)
        setIsOpen(false)
      },
      category: 'calculate',
      keywords: ['calcular', 'total', 'suma', 'gasto', 'calculator', 'math']
    },
    {
      id: 'view-calendar',
      title: 'Ver Calendario',
      description: 'Ir al calendario de pagos',
      icon: <Calendar className="w-5 h-5" />,
      shortcut: 'Ctrl+L',
      action: () => {
        onNavigate?.('calendar')
        setIsOpen(false)
      },
      category: 'navigate',
      keywords: ['calendario', 'pagos', 'fechas', 'calendar', 'schedule']
    },
    {
      id: 'search-subscriptions',
      title: 'Buscar Suscripciones',
      description: 'Buscar entre tus suscripciones',
      icon: <Search className="w-5 h-5" />,
      shortcut: 'Ctrl+F',
      action: () => {
        onNavigate?.('search')
        setIsOpen(false)
      },
      category: 'navigate',
      keywords: ['buscar', 'encontrar', 'filtrar', 'search', 'find']
    },
    {
      id: 'budget-status',
      title: 'Estado del Presupuesto',
      description: 'Ver resumen del presupuesto actual',
      icon: <Target className="w-5 h-5" />,
      shortcut: 'Ctrl+B',
      action: () => {
        const budget = 200 // From context
        const usage = (totalMonthly / budget) * 100
        alert(`Presupuesto: $${budget}\nUsado: $${totalMonthly.toFixed(2)} (${usage.toFixed(1)}%)\nDisponible: $${(budget - totalMonthly).toFixed(2)}`)
        setIsOpen(false)
      },
      category: 'calculate',
      keywords: ['presupuesto', 'budget', 'gasto', 'disponible', 'restante']
    },
    {
      id: 'upcoming-payments',
      title: 'Próximos Pagos',
      description: 'Ver pagos de los próximos días',
      icon: <Clock className="w-5 h-5" />,
      shortcut: 'Ctrl+U',
      action: () => {
        onNavigate?.('upcoming')
        setIsOpen(false)
      },
      category: 'navigate',
      keywords: ['proximos', 'pagos', 'upcoming', 'payments', 'next']
    },
    {
      id: 'settings',
      title: 'Configuración',
      description: 'Ir a la configuración de la app',
      icon: <Settings className="w-5 h-5" />,
      shortcut: 'Ctrl+,',
      action: () => {
        onNavigate?.('settings')
        setIsOpen(false)
      },
      category: 'settings',
      keywords: ['configuracion', 'settings', 'opciones', 'preferencias']
    }
  ]

  // Filter actions based on search
  const filteredActions = React.useMemo(() => {
    if (!searchQuery.trim()) return quickActions

    const query = searchQuery.toLowerCase()
    return quickActions.filter(action =>
      action.title.toLowerCase().includes(query) ||
      action.description.toLowerCase().includes(query) ||
      action.keywords.some(keyword => keyword.includes(query))
    )
  }, [searchQuery, quickActions])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Open quick actions with Cmd/Ctrl + K
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setIsOpen(true)
        setSearchQuery('')
        setSelectedIndex(0)
        return
      }

      // Close with Escape
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
        return
      }

      // Navigate with arrows when open
      if (isOpen) {
        if (event.key === 'ArrowDown') {
          event.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, filteredActions.length - 1))
        } else if (event.key === 'ArrowUp') {
          event.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
        } else if (event.key === 'Enter') {
          event.preventDefault()
          if (filteredActions[selectedIndex]) {
            triggerMicroInteraction('button_press')
            filteredActions[selectedIndex].action()
          }
        }
        return
      }

      // Individual shortcuts when not open
      quickActions.forEach(action => {
        if (action.shortcut) {
          const keys = action.shortcut.toLowerCase().split('+')
          const ctrlKey = keys.includes('ctrl')
          const metaKey = keys.includes('cmd')
          const key = keys[keys.length - 1]

          if (
            (ctrlKey && event.ctrlKey || metaKey && event.metaKey) &&
            event.key.toLowerCase() === key
          ) {
            event.preventDefault()
            triggerMicroInteraction('button_press')
            action.action()
          }
        }
      })
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredActions, selectedIndex, quickActions, triggerMicroInteraction])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [searchQuery])

  const getCategoryIcon = (category: QuickAction['category']) => {
    switch (category) {
      case 'create': return '🆕'
      case 'navigate': return '🧭'
      case 'calculate': return '🧮'
      case 'settings': return '⚙️'
      default: return '⚡'
    }
  }

  const getCategoryColor = (category: QuickAction['category']) => {
    switch (category) {
      case 'create': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
      case 'navigate': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
      case 'calculate': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200'
      case 'settings': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200'
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
    }
  }

  return (
    <>
      {/* Quick Actions Trigger Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setIsOpen(true)
          triggerMicroInteraction('button_press')
        }}
        className={`relative ${className}`}
      >
        <Zap className="w-4 h-4 mr-2" />
        Acciones
        <Badge variant="secondary" className="ml-2 text-xs">
          ⌘K
        </Badge>
      </Button>

      {/* Quick Actions Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl p-0" hideCloseButton>
          <div className="border-b border-border p-4">
            <div className="flex items-center space-x-3">
              <Command className="w-5 h-5 text-gray-400" />
              <Input
                ref={inputRef}
                placeholder="Buscar acciones o escribir comando..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 focus:ring-0 text-lg"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto p-2">
            {filteredActions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No se encontraron acciones</p>
                <p className="text-sm mt-1">Intenta con otros términos</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredActions.map((action, index) => (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        index === selectedIndex 
                          ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : ''
                      }`}
                      onClick={() => {
                        triggerMicroInteraction('card_tap')
                        action.action()
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="text-gray-600 dark:text-gray-400">
                              {action.icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                  {action.title}
                                </h3>
                                <Badge className={getCategoryColor(action.category)}>
                                  {getCategoryIcon(action.category)}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {action.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {action.shortcut && (
                              <Badge variant="outline" className="text-xs">
                                {action.shortcut}
                              </Badge>
                            )}
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-border p-3 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-4">
                <span>↑↓ Navegar</span>
                <span>↵ Ejecutar</span>
                <span>Esc Cerrar</span>
              </div>
              <span>{filteredActions.length} acciones</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Floating Quick Add Button
interface FloatingQuickAddProps {
  onAddSubscription: () => void
  className?: string
}

export function FloatingQuickAdd({ onAddSubscription, className = '' }: FloatingQuickAddProps) {
  const { triggerMicroInteraction } = useMicroInteractions()
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className={`fixed bottom-6 right-6 z-50 ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        size="lg"
        onClick={() => {
          triggerMicroInteraction('add')
          onAddSubscription()
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
      >
        <motion.div
          animate={{ rotate: isHovered ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Plus className="w-6 h-6" />
        </motion.div>
      </Button>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap shadow-lg"
          >
            Agregar suscripción
            <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Context Menu for Right-Click Actions
interface ContextMenuProps {
  children: React.ReactNode
  actions: Array<{
    label: string
    icon: React.ReactNode
    action: () => void
    shortcut?: string
  }>
}

export function ContextMenu({ children, actions }: ContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const { triggerMicroInteraction } = useMicroInteractions()

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault()
    setPosition({ x: event.clientX, y: event.clientY })
    setIsOpen(true)
    triggerMicroInteraction('card_tap')
  }

  useEffect(() => {
    const handleClick = () => setIsOpen(false)
    const handleScroll = () => setIsOpen(false)

    if (isOpen) {
      document.addEventListener('click', handleClick)
      document.addEventListener('scroll', handleScroll)
    }

    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('scroll', handleScroll)
    }
  }, [isOpen])

  return (
    <>
      <div onContextMenu={handleContextMenu}>
        {children}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            transition={{ duration: 0.15 }}
            className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-48"
            style={{
              left: position.x,
              top: position.y,
            }}
          >
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.action()
                  setIsOpen(false)
                  triggerMicroInteraction('button_press')
                }}
                className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between text-sm"
              >
                <div className="flex items-center space-x-2">
                  {action.icon}
                  <span>{action.label}</span>
                </div>
                {action.shortcut && (
                  <Badge variant="outline" className="text-xs">
                    {action.shortcut}
                  </Badge>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}