import { useState, useEffect, useCallback, useMemo } from 'react'
import { useLocalStorage } from './use-local-storage'
import { useToast } from './use-toast'
import type { Subscription, AppTheme } from '@/types/subscription'

interface Achievement {
  id: string
  title: string
  description: string
  xpReward: number
  unlocked: boolean
  unlockedAt?: string
  icon: string
  category: 'financial' | 'consistency' | 'discovery' | 'milestone'
}

interface UseGamificationReturn {
  userXP: number
  userLevel: number
  achievements: Achievement[]
  unlockedAchievements: Achievement[]
  availableThemes: AppTheme[]
  addXP: (amount: number, reason: string) => void
  checkAchievements: (subscriptions: Subscription[], budget: number, totalMonthly: number) => void
  getXPForNextLevel: () => number
  getLevelProgress: () => number
  isLoading: boolean
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_subscription',
    title: 'Primera Suscripción',
    description: 'Agrega tu primera suscripción',
    xpReward: 50,
    unlocked: false,
    icon: '🎯',
    category: 'milestone'
  },
  {
    id: 'budget_keeper',
    title: 'Guardián del Presupuesto',
    description: 'Mantén tus gastos dentro del presupuesto por un mes',
    xpReward: 100,
    unlocked: false,
    icon: '💰',
    category: 'financial'
  },
  {
    id: 'subscription_master',
    title: 'Maestro de Suscripciones',
    description: 'Gestiona 5 suscripciones diferentes',
    xpReward: 150,
    unlocked: false,
    icon: '👑',
    category: 'milestone'
  },
  {
    id: 'saver',
    title: 'Ahorrador',
    description: 'Cancela una suscripción para ahorrar dinero',
    xpReward: 75,
    unlocked: false,
    icon: '🏦',
    category: 'financial'
  },
  {
    id: 'organizer',
    title: 'Organizador',
    description: 'Categoriza todas tus suscripciones',
    xpReward: 80,
    unlocked: false,
    icon: '📁',
    category: 'discovery'
  },
  {
    id: 'tracker',
    title: 'Rastreador',
    description: 'Usa la app durante 7 días consecutivos',
    xpReward: 120,
    unlocked: false,
    icon: '📅',
    category: 'consistency'
  }
]

// Temas desbloqueables por nivel
const THEME_UNLOCKS: Record<number, AppTheme[]> = {
  1: ['default'],
  3: ['minimal'],
  5: ['neon'],
  8: ['gradient'],
  10: ['brutalist']
}

export function useGamification(): UseGamificationReturn {
  const { value: userXP, setValue: setUserXP, isLoading: xpLoading } = useLocalStorage('userXP', 0)
  const { value: userLevel, setValue: setUserLevel, isLoading: levelLoading } = useLocalStorage('userLevel', 1)
  const { value: achievements, setValue: setAchievements, isLoading: achievementsLoading } = useLocalStorage('achievements', ACHIEVEMENTS)
  const { toast } = useToast()

  const isLoading = xpLoading || levelLoading || achievementsLoading

  // Calcular nivel basado en XP
  const calculateLevel = useCallback((xp: number): number => {
    return Math.floor(xp / 200) + 1
  }, [])

  // XP necesario para el siguiente nivel
  const getXPForNextLevel = useCallback((): number => {
    const nextLevel = userLevel + 1
    const xpForNextLevel = (nextLevel - 1) * 200
    return xpForNextLevel - userXP
  }, [userLevel, userXP])

  // Progreso hacia el siguiente nivel (0-100)
  const getLevelProgress = useCallback((): number => {
    const currentLevelXP = (userLevel - 1) * 200
    const nextLevelXP = userLevel * 200
    const progress = ((userXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
    return Math.min(Math.max(progress, 0), 100)
  }, [userLevel, userXP])

  // Temas disponibles basado en nivel
  const availableThemes = useMemo((): AppTheme[] => {
    const themes: AppTheme[] = []
    Object.entries(THEME_UNLOCKS).forEach(([level, levelThemes]) => {
      if (userLevel >= parseInt(level)) {
        themes.push(...levelThemes)
      }
    })
    return themes
  }, [userLevel])

  // Logros desbloqueados
  const unlockedAchievements = useMemo(() => {
    return achievements.filter(achievement => achievement.unlocked)
  }, [achievements])

  // Añadir XP y verificar nivel
  const addXP = useCallback((amount: number, reason: string) => {
    const newXP = userXP + amount
    const newLevel = calculateLevel(newXP)
    
    setUserXP(newXP)
    
    if (newLevel > userLevel) {
      setUserLevel(newLevel)
      toast({
        title: `¡Nivel ${newLevel}!`,
        description: `Has subido de nivel. ¡Felicidades!`,
      })
      
      // Verificar si se desbloquean nuevos temas
      const newThemes = THEME_UNLOCKS[newLevel]
      if (newThemes) {
        toast({
          title: "¡Nuevos temas desbloqueados!",
          description: `Temas disponibles: ${newThemes.join(', ')}`,
        })
      }
    }
    
    toast({
      title: `+${amount} XP`,
      description: reason,
    })
  }, [userXP, userLevel, calculateLevel, setUserXP, setUserLevel, toast])

  // Verificar logros
  const checkAchievements = useCallback((subscriptions: Subscription[], budget: number, totalMonthly: number) => {
    const updatedAchievements = achievements.map(achievement => {
      if (achievement.unlocked) return achievement

      let shouldUnlock = false

      switch (achievement.id) {
        case 'first_subscription':
          shouldUnlock = subscriptions.length >= 1
          break
        case 'subscription_master':
          shouldUnlock = subscriptions.length >= 5
          break
        case 'budget_keeper':
          shouldUnlock = totalMonthly <= budget
          break
        case 'organizer':
          shouldUnlock = subscriptions.every(sub => sub.category)
          break
        // Agregar más lógica de logros aquí
      }

      if (shouldUnlock) {
        addXP(achievement.xpReward, `Logro desbloqueado: ${achievement.title}`)
        toast({
          title: "¡Logro desbloqueado!",
          description: `${achievement.icon} ${achievement.title}`,
        })
        
        return {
          ...achievement,
          unlocked: true,
          unlockedAt: new Date().toISOString()
        }
      }

      return achievement
    })

    setAchievements(updatedAchievements)
  }, [achievements, addXP, setAchievements, toast])

  return {
    userXP,
    userLevel,
    achievements,
    unlockedAchievements,
    availableThemes,
    addXP,
    checkAchievements,
    getXPForNextLevel,
    getLevelProgress,
    isLoading
  }
}