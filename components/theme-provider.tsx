'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { storage } from '@/lib/storage'

type AppTheme = 'default' | 'neon' | 'minimal' | 'gradient' | 'brutalist'

interface AppThemeContextType {
  appTheme: AppTheme
  setAppTheme: (theme: AppTheme) => void
  cycleAppTheme: () => void
  getThemeClasses: () => {
    background: string
    card: string
    accent: string
    button: string
  }
}

const AppThemeContext = createContext<AppThemeContextType | undefined>(undefined)

function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [appTheme, setAppThemeState] = useState<AppTheme>('default')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = storage.getItem('appTheme', 'default') as AppTheme
    setAppThemeState(savedTheme)
  }, [])

  const setAppTheme = (newTheme: AppTheme) => {
    if (!mounted) return
    setAppThemeState(newTheme)
    storage.setItem('appTheme', newTheme)
  }

  const cycleAppTheme = () => {
    const themes: AppTheme[] = ['default', 'neon', 'minimal', 'gradient', 'brutalist']
    const currentIndex = themes.indexOf(appTheme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    setAppTheme(nextTheme)
  }

  const getThemeClasses = () => {
    switch (appTheme) {
      case 'neon':
        return {
          background: 'bg-black',
          card: 'bg-gray-900 border-green-400/30',
          accent: 'text-green-400',
          button: 'bg-green-400 hover:bg-green-500 text-black'
        }
      case 'minimal':
        return {
          background: 'bg-white dark:bg-neutral-950',
          card: 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800',
          accent: 'text-neutral-600 dark:text-neutral-400',
          button: 'bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-black'
        }
      case 'gradient':
        return {
          background: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950',
          card: 'bg-gradient-to-br from-white to-purple-50/50 dark:from-purple-900/50 dark:to-pink-900/50 border-purple-200 dark:border-purple-700',
          accent: 'text-purple-600 dark:text-purple-400',
          button: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
        }
      case 'brutalist':
        return {
          background: 'bg-yellow-50 dark:bg-neutral-900',
          card: 'bg-white dark:bg-neutral-800 border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]',
          accent: 'text-black dark:text-white font-bold',
          button: 'bg-yellow-300 hover:bg-yellow-400 border-4 border-black text-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
        }
      default:
        return {
          background: 'bg-neutral-50 dark:bg-neutral-950',
          card: 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800',
          accent: 'text-blue-600 dark:text-blue-400',
          button: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white'
        }
    }
  }

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <AppThemeContext.Provider value={{
      appTheme,
      setAppTheme,
      cycleAppTheme,
      getThemeClasses
    }}>
      {children}
    </AppThemeContext.Provider>
  )
}

export function useAppTheme() {
  const context = useContext(AppThemeContext)
  if (context === undefined) {
    throw new Error('useAppTheme must be used within an AppThemeProvider')
  }
  return context
}

export function ThemeProvider({ children, ...props }: { children: React.ReactNode; [key: string]: any }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <AppThemeProvider>
        {children}
      </AppThemeProvider>
    </NextThemesProvider>
  )
}
