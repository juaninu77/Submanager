'use client'

import { useState } from 'react'
import { 
  Home, 
  Calendar, 
  CreditCard, 
  Settings, 
  Trophy, 
  TrendingUp,
  PlusCircle,
  Menu,
  X,
  User,
  Moon,
  Sun,
  PaletteIcon,
  Bell,
  Wallet,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { componentStyles } from '@/lib/design-tokens'
import { motion, AnimatePresence } from 'framer-motion'
import ThemeSwitcher from '@/components/ui/theme-switcher'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UnifiedNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onAddSubscription: () => void
  onToggleDarkMode: () => void
  onCycleTheme: () => void
  onShowGamification: () => void
  onShowSettings: () => void
  darkMode: boolean
  currentTheme: string
  onThemeChange: (theme: string) => void
  className?: string
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, shortcut: '⌘D' },
  { id: 'calendar', label: 'Calendario', icon: Calendar, shortcut: '⌘C' },
  { id: 'cards', label: 'Suscripciones', icon: CreditCard, shortcut: '⌘S' },
  { id: 'analytics', label: 'Análisis', icon: TrendingUp, shortcut: '⌘A' },
  { id: 'achievements', label: 'Logros', icon: Trophy, shortcut: '⌘L' },
]

const quickActions = [
  { id: 'gamification', label: 'Gamificación', icon: Trophy, action: 'onShowGamification' },
  { id: 'budget', label: 'Presupuesto', icon: Wallet, action: 'onShowSettings' },
  { id: 'notifications', label: 'Notificaciones', icon: Bell, action: 'onShowNotifications' },
]

export default function UnifiedNavigation({
  activeTab,
  onTabChange,
  onAddSubscription,
  onToggleDarkMode,
  onCycleTheme,
  onShowGamification,
  onShowSettings,
  darkMode,
  currentTheme,
  onThemeChange,
  className
}: UnifiedNavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(false)

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'gamification':
        onShowGamification()
        break
      case 'budget':
        onShowSettings()
        break
      case 'notifications':
        // Handle notifications
        break
    }
    setShowQuickActions(false)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 shadow-lg"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Enhanced Sidebar */}
      <motion.aside
        className={cn(
          "h-full bg-gradient-to-b from-white via-neutral-50/50 to-white dark:from-neutral-900 dark:via-neutral-800/50 dark:to-neutral-900",
          "border-r border-neutral-200/80 dark:border-neutral-800/80 backdrop-blur-xl z-50 transition-all duration-500",
          "flex flex-col shadow-xl",
          isCollapsed ? "w-20" : "w-80",
          // Mobile styles
          "fixed left-0 top-0 lg:relative lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
        initial={false}
        animate={{ width: isCollapsed ? 80 : 320 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* Enhanced Header */}
        <div className={cn(
          "flex items-center justify-between p-6 border-b border-neutral-200/50 dark:border-neutral-800/50",
          isCollapsed && "justify-center px-4"
        )}>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div 
                className="flex items-center space-x-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-display font-bold text-xl">S</span>
                </div>
                <div className="flex flex-col">
                  <span className={`${componentStyles.text.headline} text-xl`}>
                    Submanager
                  </span>
                  <span className={`${componentStyles.text.caption} text-xs`}>
                    Finanzas Inteligentes
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Control Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex h-8 w-8 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8"
              onClick={() => setIsMobileOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Enhanced Quick Add Button */}
        <div className={cn("p-6", isCollapsed && "px-4")}>
          <Button
            onClick={onAddSubscription}
            className={cn(
              "w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white border-0 rounded-2xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/25 focus:ring-2 focus:ring-primary-500/30 hover:scale-[1.02] active:scale-[0.98]",
              isCollapsed ? "px-0 py-3 aspect-square" : "px-6 py-3"
            )}
          >
            <PlusCircle className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
            {!isCollapsed && "Añadir Nueva"}
          </Button>
        </div>

        {/* Enhanced Navigation Items */}
        <nav className="flex-1 px-4 space-y-2">
          {navigationItems.map((item, index) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start transition-all duration-300 rounded-2xl h-12 relative group",
                    isActive && "bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/20",
                    !isActive && "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800",
                    isCollapsed && "justify-center px-0"
                  )}
                  onClick={() => {
                    onTabChange(item.id)
                    setIsMobileOpen(false)
                  }}
                >
                  <Icon className={cn("h-5 w-5 flex-shrink-0", !isCollapsed && "mr-3")} />
                  
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.div 
                        className="flex items-center justify-between flex-1"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <span className="font-medium">{item.label}</span>
                        <span className="text-xs opacity-50">{item.shortcut}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      className="absolute left-0 top-1/2 w-1 h-8 bg-white rounded-r-full"
                      layoutId="activeIndicator"
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    />
                  )}
                </Button>
              </motion.div>
            )
          })}
        </nav>

        {/* Simplified Quick Actions - Only core actions */}
        <div className="p-4 border-t border-neutral-200/50 dark:border-neutral-800/50">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                {/* Core Actions Only */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleQuickAction('gamification')}
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Gamificación
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleQuickAction('budget')}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Mi Presupuesto
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Enhanced User Section */}
        <div className="p-4 border-t border-neutral-200/50 dark:border-neutral-800/50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-start hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-2xl h-12",
                  isCollapsed && "justify-center px-0"
                )}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                </div>
                
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div 
                      className="flex-1 text-left ml-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                    >
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        Usuario
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Plan Personal
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={onShowGamification}>
                <Trophy className="mr-2 h-4 w-4" />
                <span>Gamificación</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={onShowSettings}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configuración</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={onCycleTheme}>
                <PaletteIcon className="mr-2 h-4 w-4" />
                <span>Cambiar Tema</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={onToggleDarkMode}>
                {darkMode ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                <span>{darkMode ? "Modo Claro" : "Modo Oscuro"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.aside>
    </>
  )
}