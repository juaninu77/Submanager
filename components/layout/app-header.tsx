'use client'

import { useState } from 'react'
import { 
  Settings, 
  Palette, 
  Moon, 
  Sun, 
  User, 
  Bell, 
  Search,
  HelpCircle,
  LogOut,
  Coins,
  Trophy,
  CreditCard
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import ThemeSwitcher from '@/components/ui/theme-switcher'

interface AppHeaderProps {
  activeTab: string
  searchQuery: string
  onSearchChange: (query: string) => void
  darkMode: boolean
  onToggleDarkMode: () => void
  currentTheme: string
  onThemeChange: (theme: string) => void
  onShowGamification: () => void
  onShowSettings: () => void
  onShowNotifications?: () => void
  className?: string
}

export default function AppHeader({
  activeTab,
  searchQuery,
  onSearchChange,
  darkMode,
  onToggleDarkMode,
  currentTheme,
  onThemeChange,
  onShowGamification,
  onShowSettings,
  onShowNotifications,
  className
}: AppHeaderProps) {
  const [notificationCount] = useState(3)
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const getPageTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      calendar: 'Calendario',
      cards: 'Suscripciones',
      analytics: 'Análisis',
      achievements: 'Logros',
      settings: 'Configuración'
    }
    return titles[activeTab as keyof typeof titles] || 'Dashboard'
  }

  const getPageDescription = () => {
    const descriptions = {
      dashboard: 'Resumen completo de tus finanzas',
      calendar: 'Visualiza todos tus pagos mensuales',
      cards: 'Gestiona todas tus suscripciones',
      analytics: 'Análisis profundo de patrones de gasto',
      achievements: 'Sistema de logros y gamificación',
      settings: 'Personaliza tu experiencia'
    }
    return descriptions[activeTab as keyof typeof descriptions] || ''
  }

  return (
    <header className={cn(
      "bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-200/50 dark:border-neutral-800/50 sticky top-0 z-40",
      className
    )}>
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left Section - Page Info */}
        <div className="flex items-center space-x-4 flex-1">
          <div className="hidden sm:block">
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              {getPageTitle()}
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {getPageDescription()}
            </p>
          </div>

          {/* Mobile Title */}
          <div className="sm:hidden">
            <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {getPageTitle()}
            </h1>
          </div>
        </div>

        {/* Center Section - Search (when applicable) */}
        {(['dashboard', 'cards'].includes(activeTab)) && (
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Buscar suscripciones..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={cn(
                  "pl-10 bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 rounded-xl transition-all duration-200",
                  isSearchFocused && "ring-2 ring-primary-500/20 border-primary-500"
                )}
              />
            </div>
          </div>
        )}

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            onClick={onShowNotifications}
          >
            <Bell className="h-4 w-4" />
            {notificationCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {notificationCount}
              </Badge>
            )}
          </Button>

          {/* Quick Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleDarkMode}
            className="h-9 w-9 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            {darkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* Configuration Menu */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              align="end" 
              className="w-80 p-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-neutral-200/80 dark:border-neutral-800/80 shadow-2xl rounded-2xl"
              sideOffset={8}
            >
              <div className="p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Settings className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                  <h3 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100">
                    Configuración
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Theme Switcher */}
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                      Tema de la aplicación
                    </label>
                    <ThemeSwitcher
                      currentTheme={currentTheme}
                      onThemeChange={onThemeChange}
                      className="w-full"
                    />
                  </div>

                  {/* Quick Actions */}
                  <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 block">
                      Acciones rápidas
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onShowGamification}
                        className="justify-start"
                      >
                        <Trophy className="h-4 w-4 mr-2" />
                        Logros
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onShowSettings}
                        className="justify-start"
                      >
                        <Coins className="h-4 w-4 mr-2" />
                        Presupuesto
                      </Button>
                    </div>
                  </div>

                  {/* App Info */}
                  <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500 dark:text-neutral-400">Versión</span>
                      <span className="text-neutral-700 dark:text-neutral-300">1.0.0</span>
                    </div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-9 w-9 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Usuario</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    usuario@submanager.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Mi Plan</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Ayuda</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem className="text-red-600 dark:text-red-400">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Search */}
      {(['dashboard', 'cards'].includes(activeTab)) && (
        <div className="px-4 pb-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Buscar suscripciones..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 rounded-xl"
            />
          </div>
        </div>
      )}
    </header>
  )
}