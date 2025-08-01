'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette, Check, Sparkles, Zap, Gamepad2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ThemeSwitcherProps {
  currentTheme: string
  onThemeChange: (theme: string) => void
  className?: string
}

const themes = [
  {
    id: 'default',
    name: 'Orgánico',
    description: 'Finanzas naturales y sostenibles',
    icon: Sparkles,
    colors: ['#22c55e', '#eab308', '#f97316'],
    gradient: 'from-green-500 via-yellow-500 to-orange-500'
  },
  {
    id: 'revival',
    name: 'Revival',
    description: 'Energético y vibrante - Inspirado en paleta Revival',
    icon: Zap,
    colors: ['#8B0000', '#FF6B35', '#FFB84D'],
    gradient: 'from-red-800 via-orange-500 to-yellow-400'
  },
  {
    id: 'venetian',
    name: 'Venetian',
    description: 'Elegante y cálido - Inspirado en paleta Venetian',
    icon: Palette,
    colors: ['#F7EDDA', '#F0531C', '#09332C'],
    gradient: 'from-amber-200 via-orange-600 to-teal-800'
  },
  {
    id: 'gaming',
    name: 'Gaming',
    description: 'Estilo premium para gamers',
    icon: Gamepad2,
    colors: ['#00FF88', '#FF4458', '#8B5CF6'],
    gradient: 'from-green-400 via-red-400 to-purple-500'
  }
]

export default function ThemeSwitcher({ 
  currentTheme, 
  onThemeChange, 
  className 
}: ThemeSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={cn('relative', className)}>
      {/* Theme Switcher Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="relative overflow-hidden border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all duration-300"
      >
        <Palette className="h-4 w-4 mr-2" />
        <span className="font-medium">
          {themes.find(t => t.id === currentTheme)?.name || 'Tema'}
        </span>
        
        {/* Active Theme Indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1">
          {themes.map(theme => (
            theme.id === currentTheme && (
              <motion.div
                key={theme.id}
                className={`h-full bg-gradient-to-r ${theme.gradient}`}
                layoutId="activeThemeIndicator"
                transition={{ duration: 0.3 }}
              />
            )
          ))}
        </div>
      </Button>

      {/* Theme Options Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/20 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Theme Panel - Smart positioning */}
            <motion.div
              className="absolute bottom-full mb-2 right-0 w-80 bg-white/98 dark:bg-neutral-900/98 backdrop-blur-xl border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl shadow-2xl z-50 overflow-hidden"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-3 text-neutral-900 dark:text-neutral-100">
                  Elige tu Tema
                </h3>
                
                <div className="space-y-3">
                  {themes.map((theme, index) => {
                    const Icon = theme.icon
                    const isActive = currentTheme === theme.id
                    
                    return (
                      <motion.button
                        key={theme.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          'w-full p-4 rounded-xl border-2 transition-all duration-300 text-left group relative overflow-hidden',
                          isActive 
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                            : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                        )}
                        onClick={() => {
                          onThemeChange(theme.id)
                          setIsOpen(false)
                        }}
                      >
                        {/* Background Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${theme.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                        
                        {/* Content */}
                        <div className="relative z-10 flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-r ${theme.gradient}`}>
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                                  {theme.name}
                                </h4>
                                {isActive && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center"
                                  >
                                    <Check className="h-3 w-3 text-white" />
                                  </motion.div>
                                )}
                              </div>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                {theme.description}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Color Palette Preview */}
                        <div className="flex items-center space-x-2 mt-3 relative z-10">
                          {theme.colors.map((color, colorIndex) => (
                            <motion.div
                              key={colorIndex}
                              className="w-6 h-6 rounded-full border-2 border-white dark:border-neutral-800 shadow-sm"
                              style={{ backgroundColor: color }}
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.2 }}
                            />
                          ))}
                        </div>
                        
                        {/* Ripple Effect */}
                        {isActive && (
                          <motion.div
                            className="absolute inset-0 border-2 border-primary-500 rounded-xl"
                            animate={{
                              scale: [1, 1.02, 1],
                              opacity: [0.5, 0, 0.5]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'easeInOut'
                            }}
                          />
                        )}
                      </motion.button>
                    )
                  })}
                </div>
                
                <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
                    Los temas cambian colores, tipografía y efectos visuales
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}