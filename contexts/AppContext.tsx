'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useSubscriptions } from '@/hooks/use-subscriptions'
import { useAppSettings } from '@/hooks/use-local-storage'
import { useGamification } from '@/hooks/use-gamification'
import type { Subscription, SubscriptionCategory, AppTheme } from '@/types/subscription'

interface AppContextType {
  // Subscriptions
  subscriptions: Subscription[]
  filteredSubscriptions: Subscription[]
  searchQuery: string
  activeFilter: SubscriptionCategory | 'all'
  totalMonthly: number
  totalYearly: number
  upcomingPayments: Subscription[]
  setSearchQuery: (query: string) => void
  setActiveFilter: (filter: SubscriptionCategory | 'all') => void
  addSubscription: (subscription: Subscription) => void
  updateSubscription: (subscription: Subscription) => void
  removeSubscription: (id: string) => void
  getSubscriptionById: (id: string) => Subscription | undefined

  // Settings
  darkMode: boolean
  setDarkMode: (value: boolean | ((val: boolean) => boolean)) => void
  appTheme: AppTheme
  setAppTheme: (value: AppTheme | ((val: AppTheme) => AppTheme)) => void
  budget: number
  setBudget: (value: number | ((val: number) => number)) => void
  firstVisit: boolean
  setFirstVisit: (value: boolean | ((val: boolean) => boolean)) => void

  // Gamification
  userXP: number
  userLevel: number
  achievements: any[]
  unlockedAchievements: any[]
  availableThemes: AppTheme[]
  addXP: (amount: number, reason: string) => void
  checkAchievements: (subscriptions: Subscription[], budget: number, totalMonthly: number) => void
  getXPForNextLevel: () => number
  getLevelProgress: () => number

  // Loading states
  isLoading: boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)

interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  const subscriptionsHook = useSubscriptions()
  const settingsHook = useAppSettings()
  const gamificationHook = useGamification()

  const isLoading = subscriptionsHook.isLoading || settingsHook.isLoading || gamificationHook.isLoading

  const value: AppContextType = {
    // Subscriptions
    ...subscriptionsHook,

    // Settings
    ...settingsHook,

    // Gamification
    ...gamificationHook,

    // Loading
    isLoading
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}

// Hooks especializados para mayor conveniencia
export function useSubscriptionsContext() {
  const context = useAppContext()
  return {
    subscriptions: context.subscriptions,
    filteredSubscriptions: context.filteredSubscriptions,
    searchQuery: context.searchQuery,
    activeFilter: context.activeFilter,
    totalMonthly: context.totalMonthly,
    totalYearly: context.totalYearly,
    upcomingPayments: context.upcomingPayments,
    setSearchQuery: context.setSearchQuery,
    setActiveFilter: context.setActiveFilter,
    addSubscription: context.addSubscription,
    updateSubscription: context.updateSubscription,
    removeSubscription: context.removeSubscription,
    getSubscriptionById: context.getSubscriptionById
  }
}

export function useSettingsContext() {
  const context = useAppContext()
  return {
    darkMode: context.darkMode,
    setDarkMode: context.setDarkMode,
    appTheme: context.appTheme,
    setAppTheme: context.setAppTheme,
    budget: context.budget,
    setBudget: context.setBudget,
    firstVisit: context.firstVisit,
    setFirstVisit: context.setFirstVisit
  }
}

export function useGamificationContext() {
  const context = useAppContext()
  return {
    userXP: context.userXP,
    userLevel: context.userLevel,
    achievements: context.achievements,
    unlockedAchievements: context.unlockedAchievements,
    availableThemes: context.availableThemes,
    addXP: context.addXP,
    checkAchievements: context.checkAchievements,
    getXPForNextLevel: context.getXPForNextLevel,
    getLevelProgress: context.getLevelProgress
  }
}