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
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { componentStyles } from '@/lib/design-tokens'

interface SidebarNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onAddSubscription: () => void
  className?: string
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'calendar', label: 'Calendario', icon: Calendar },
  { id: 'cards', label: 'Suscripciones', icon: CreditCard },
  { id: 'analytics', label: 'Análisis', icon: TrendingUp },
  { id: 'achievements', label: 'Logros', icon: Trophy },
  { id: 'settings', label: 'Configuración', icon: Settings },
]

export default function SidebarNavigation({
  activeTab,
  onTabChange,
  onAddSubscription,
  className
}: SidebarNavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Organic Sidebar */}
      <aside
        className={cn(
          "h-full bg-gradient-to-b from-surface-paper via-surface-elevated to-surface-paper dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900",
          "border-r border-primary-200/30 dark:border-primary-800/30 backdrop-blur-xl z-50 transition-all duration-500",
          "flex flex-col shadow-xl",
          isCollapsed ? "w-16" : "w-72",
          // Mobile styles - keep as fixed for mobile
          "fixed left-0 top-0 lg:relative lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        {/* Organic Header */}
        <div className={cn(
          "flex items-center justify-between p-6 border-b border-primary-200/30 dark:border-primary-800/30",
          isCollapsed && "justify-center"
        )}>
          {!isCollapsed && (
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-display font-bold text-xl">S</span>
              </div>
              <div className="flex flex-col">
                <span className={`${componentStyles.text.headline} text-xl`}>
                  Submanager
                </span>
                <span className={`${componentStyles.text.caption} text-xs`}>
                  Finanzas Orgánicas
                </span>
              </div>
            </div>
          )}
          
          {/* Collapse/Mobile Close Buttons */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Organic Quick Add Button */}
        <div className={cn("p-6", isCollapsed && "px-3")}>
          <Button
            onClick={onAddSubscription}
            className={cn(
              componentStyles.button.organic,
              "w-full",
              isCollapsed && "px-3 py-3 aspect-square"
            )}
          >
            <PlusCircle className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
            {!isCollapsed && "Añadir Nueva"}
          </Button>
        </div>

        {/* Organic Navigation Items */}
        <nav className="flex-1 px-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              
              return (
                <li key={item.id}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start transition-all duration-300 rounded-2xl",
                      isActive && componentStyles.button.primary.replace('px-6 py-3', 'px-4 py-3'),
                      !isActive && componentStyles.button.ghost.replace('px-6 py-3', 'px-4 py-3'),
                      isCollapsed && "justify-center px-3"
                    )}
                    onClick={() => {
                      onTabChange(item.id)
                      setIsMobileOpen(false)
                    }}
                  >
                    <Icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                    {!isCollapsed && (
                      <span className={componentStyles.text.bodyMedium}>{item.label}</span>
                    )}
                  </Button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">U</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                  Usuario
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                  Plan personal
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}