'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  Plus, 
  Calendar, 
  BarChart3, 
  Settings, 
  Search,
  Filter,
  SortAsc,
  Grid3X3,
  List,
  ChevronLeft,
  ArrowRight,
  Sparkles,
  Target,
  Bell,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/enhanced-button'
import { Card, CardContent } from '@/components/ui/enhanced-card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { useMicroInteractions } from '@/hooks/use-haptics'
import { useLocalStorage } from '@/hooks/use-local-storage'

// Navigation structure with contextual flows
interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  path: string
  badge?: number
  quickActions?: QuickAction[]
  description?: string
  shortcut?: string
}

interface QuickAction {
  id: string
  label: string
  icon: React.ReactNode
  action: () => void
  shortcut?: string
}

interface ViewMode {
  id: string
  label: string
  icon: React.ReactNode
  description: string
}

interface SortOption {
  id: string
  label: string
  icon: React.ReactNode
  field: string
  direction: 'asc' | 'desc'
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <Home className="w-5 h-5" />,
    path: 'dashboard',
    description: 'Vista general de tus suscripciones'
  },
  {
    id: 'subscriptions',
    label: 'Suscripciones',
    icon: <Grid3X3 className="w-5 h-5" />,
    path: 'subscriptions',
    description: 'Gestiona todas tus suscripciones',
    shortcut: 'Ctrl+S'
  },
  {
    id: 'calendar',
    label: 'Calendario',
    icon: <Calendar className="w-5 h-5" />,
    path: 'calendar',
    badge: 3,
    description: 'Próximos pagos y vencimientos',
    shortcut: 'Ctrl+L'
  },
  {
    id: 'analytics',
    label: 'Estadísticas',
    icon: <BarChart3 className="w-5 h-5" />,
    path: 'analytics',
    description: 'Análisis de gastos y tendencias'
  },
  {
    id: 'budget',
    label: 'Presupuesto',
    icon: <Target className="w-5 h-5" />,
    path: 'budget',
    description: 'Control de presupuesto mensual',
    shortcut: 'Ctrl+B'
  }
]

const VIEW_MODES: ViewMode[] = [
  {
    id: 'grid',
    label: 'Cuadrícula',
    icon: <Grid3X3 className="w-4 h-4" />,
    description: 'Vista en tarjetas'
  },
  {
    id: 'list',
    label: 'Lista',
    icon: <List className="w-4 h-4" />,
    description: 'Vista compacta'
  }
]

const SORT_OPTIONS: SortOption[] = [
  {
    id: 'name-asc',
    label: 'Nombre A-Z',
    icon: <SortAsc className="w-4 h-4" />,
    field: 'name',
    direction: 'asc'
  },
  {
    id: 'amount-desc',
    label: 'Precio mayor',
    icon: <SortAsc className="w-4 h-4" />,
    field: 'amount',
    direction: 'desc'
  },
  {
    id: 'date-asc',
    label: 'Próximo pago',
    icon: <Calendar className="w-4 h-4" />,
    field: 'paymentDate',
    direction: 'asc'
  },
  {
    id: 'category',
    label: 'Categoría',
    icon: <Filter className="w-4 h-4" />,
    field: 'category',
    direction: 'asc'
  }
]

interface SimplifiedNavigationProps {
  currentPath: string
  onNavigate: (path: string) => void
  onQuickAction?: (actionId: string) => void
  showSearch?: boolean
  showFilters?: boolean
  className?: string
}

export function SimplifiedNavigation({
  currentPath,
  onNavigate,
  onQuickAction,
  showSearch = true,
  showFilters = true,
  className = ''
}: SimplifiedNavigationProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const { triggerMicroInteraction } = useMicroInteractions()
  const { value: preferences, setValue: setPreferences } = useLocalStorage('nav-preferences', {
    viewMode: 'grid',
    sortBy: 'name-asc',
    recentPaths: []
  })

  const handleNavigation = useCallback((path: string) => {
    triggerMicroInteraction('button_press')
    
    // Update recent paths
    const updatedRecent = [path, ...preferences.recentPaths.filter((p: string) => p !== path)].slice(0, 5)
    setPreferences(prev => ({ ...prev, recentPaths: updatedRecent }))
    
    onNavigate(path)
  }, [triggerMicroInteraction, preferences.recentPaths, setPreferences, onNavigate])

  const currentItem = NAV_ITEMS.find(item => item.path === currentPath)

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Navigation Bar */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center">
            {/* Primary Navigation */}
            <div className="flex-1 flex items-center overflow-x-auto scrollbar-hide">
              {NAV_ITEMS.map((item, index) => (
                <NavButton
                  key={item.id}
                  item={item}
                  isActive={currentPath === item.path}
                  onClick={() => handleNavigation(item.path)}
                  delay={index * 0.05}
                />
              ))}
            </div>

            {/* Secondary Actions */}
            <div className="flex items-center space-x-2 px-4 border-l border-gray-200 dark:border-gray-700">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onQuickAction?.('notifications')}
                className="relative"
              >
                <Bell className="w-4 h-4" />
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                  2
                </Badge>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleNavigation('profile')}>
                    Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNavigation('settings')}>
                    Configuración
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contextual Search and Filters */}
      <AnimatePresence>
        {(showSearch || showFilters) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Smart Search */}
                  {showSearch && (
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder={getSearchPlaceholder(currentPath)}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        className="pl-10"
                      />
                      
                      {/* Search suggestions */}
                      <AnimatePresence>
                        {isSearchFocused && searchQuery.length > 0 && (
                          <SearchSuggestions
                            query={searchQuery}
                            context={currentPath}
                            onSelect={(suggestion) => {
                              setSearchQuery(suggestion)
                              setIsSearchFocused(false)
                            }}
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* View and Sort Controls */}
                  {showFilters && (
                    <div className="flex items-center space-x-2">
                      {/* View Mode Toggle */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            {VIEW_MODES.find(mode => mode.id === preferences.viewMode)?.icon}
                            <span className="hidden sm:inline ml-2">Vista</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Modo de vista</DropdownMenuLabel>
                          {VIEW_MODES.map(mode => (
                            <DropdownMenuItem
                              key={mode.id}
                              onClick={() => {
                                setPreferences(prev => ({ ...prev, viewMode: mode.id }))
                                triggerMicroInteraction('toggle')
                              }}
                            >
                              <div className="flex items-center space-x-2">
                                {mode.icon}
                                <div>
                                  <div className="font-medium">{mode.label}</div>
                                  <div className="text-xs text-gray-500">{mode.description}</div>
                                </div>
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Sort Options */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <SortAsc className="w-4 h-4" />
                            <span className="hidden sm:inline ml-2">Ordenar</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
                          {SORT_OPTIONS.map(option => (
                            <DropdownMenuItem
                              key={option.id}
                              onClick={() => {
                                setPreferences(prev => ({ ...prev, sortBy: option.id }))
                                triggerMicroInteraction('selection')
                              }}
                            >
                              <div className="flex items-center space-x-2">
                                {option.icon}
                                <span>{option.label}</span>
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Quick Filters for current context */}
                      <QuickFilters context={currentPath} />
                    </div>
                  )}
                </div>

                {/* Breadcrumb Navigation */}
                <BreadcrumbNavigation
                  currentPath={currentPath}
                  onNavigate={handleNavigation}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Action FAB for Mobile */}
      <QuickActionFAB
        context={currentPath}
        onAction={onQuickAction}
      />
    </div>
  )
}

// Navigation button component
interface NavButtonProps {
  item: NavItem
  isActive: boolean
  onClick: () => void
  delay: number
}

function NavButton({ item, isActive, onClick, delay }: NavButtonProps) {
  const { triggerMicroInteraction } = useMicroInteractions()

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Button
        variant={isActive ? "default" : "ghost"}
        size="sm"
        onClick={() => {
          triggerMicroInteraction('button_press')
          onClick()
        }}
        className={`relative flex items-center space-x-2 px-4 py-2 whitespace-nowrap ${
          isActive ? 'shadow-sm' : ''
        }`}
      >
        {item.icon}
        <span className="hidden sm:inline">{item.label}</span>
        {item.badge && item.badge > 0 && (
          <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
            {item.badge > 9 ? '9+' : item.badge}
          </Badge>
        )}
        {item.shortcut && (
          <Badge variant="outline" className="hidden lg:inline-flex text-xs ml-2">
            {item.shortcut}
          </Badge>
        )}
      </Button>
    </motion.div>
  )
}

// Search suggestions component
interface SearchSuggestionsProps {
  query: string
  context: string
  onSelect: (suggestion: string) => void
}

function SearchSuggestions({ query, context, onSelect }: SearchSuggestionsProps) {
  const suggestions = getContextualSuggestions(query, context)

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute top-full left-0 right-0 z-50 mt-1"
    >
      <Card className="shadow-lg border">
        <CardContent className="p-2">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded text-sm"
              onClick={() => onSelect(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Breadcrumb navigation
interface BreadcrumbNavigationProps {
  currentPath: string
  onNavigate: (path: string) => void
}

function BreadcrumbNavigation({ currentPath, onNavigate }: BreadcrumbNavigationProps) {
  const breadcrumbs = getBreadcrumbs(currentPath)

  if (breadcrumbs.length <= 1) return null

  return (
    <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.path}>
            {index > 0 && <ChevronLeft className="w-3 h-3 rotate-180" />}
            <button
              onClick={() => onNavigate(crumb.path)}
              className={`hover:text-gray-900 dark:hover:text-gray-100 transition-colors ${
                index === breadcrumbs.length - 1 ? 'font-medium text-gray-900 dark:text-gray-100' : ''
              }`}
            >
              {crumb.label}
            </button>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

// Quick filters for context
interface QuickFiltersProps {
  context: string
}

function QuickFilters({ context }: QuickFiltersProps) {
  const filters = getContextualFilters(context)

  if (filters.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline ml-2">Filtrar</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Filtros rápidos</DropdownMenuLabel>
        {filters.map(filter => (
          <DropdownMenuItem key={filter.id}>
            {filter.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Quick action FAB
interface QuickActionFABProps {
  context: string
  onAction?: (actionId: string) => void
}

function QuickActionFAB({ context, onAction }: QuickActionFABProps) {
  const primaryAction = getPrimaryActionForContext(context)

  if (!primaryAction) return null

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="fixed bottom-6 right-6 z-40 md:hidden"
    >
      <Button
        size="lg"
        onClick={() => onAction?.(primaryAction.id)}
        className="h-14 w-14 rounded-full shadow-lg"
      >
        {primaryAction.icon}
      </Button>
    </motion.div>
  )
}

// Helper functions
function getSearchPlaceholder(context: string): string {
  switch (context) {
    case 'subscriptions': return 'Buscar suscripciones...'
    case 'calendar': return 'Buscar por fecha o servicio...'
    case 'analytics': return 'Buscar estadísticas...'
    case 'budget': return 'Buscar categorías...'
    default: return 'Buscar...'
  }
}

function getContextualSuggestions(query: string, context: string): string[] {
  // Mock suggestions based on context
  const suggestions = {
    subscriptions: ['Netflix', 'Spotify', 'Adobe', 'Microsoft 365'],
    calendar: ['Próximos 7 días', 'Este mes', 'Vencidos'],
    analytics: ['Gastos por categoría', 'Tendencias mensuales', 'Comparar períodos'],
    budget: ['Video', 'Música', 'Productividad', 'Diseño']
  }

  return (suggestions[context as keyof typeof suggestions] || [])
    .filter(s => s.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5)
}

function getBreadcrumbs(currentPath: string) {
  const pathSegments = currentPath.split('/')
  const breadcrumbs = []

  for (let i = 0; i < pathSegments.length; i++) {
    const path = pathSegments.slice(0, i + 1).join('/')
    const item = NAV_ITEMS.find(item => item.path === path)
    if (item) {
      breadcrumbs.push({
        path: item.path,
        label: item.label
      })
    }
  }

  return breadcrumbs
}

function getContextualFilters(context: string) {
  const filters = {
    subscriptions: [
      { id: 'active', label: 'Activas' },
      { id: 'expensive', label: 'Más de $20' },
      { id: 'recent', label: 'Agregadas recientemente' }
    ],
    calendar: [
      { id: 'this-week', label: 'Esta semana' },
      { id: 'overdue', label: 'Vencidas' },
      { id: 'upcoming', label: 'Próximas' }
    ]
  }

  return filters[context as keyof typeof filters] || []
}

function getPrimaryActionForContext(context: string) {
  const actions = {
    subscriptions: { id: 'add-subscription', icon: <Plus className="w-6 h-6" /> },
    calendar: { id: 'add-reminder', icon: <Bell className="w-6 h-6" /> },
    budget: { id: 'adjust-budget', icon: <Target className="w-6 h-6" /> }
  }

  return actions[context as keyof typeof actions]
}

export { NAV_ITEMS, VIEW_MODES, SORT_OPTIONS }