"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Trophy, Check, Lock, DollarSign, Target, TrendingDown, Zap, Star, Award } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import type { Subscription } from "@/types/subscription"
import { storage } from "@/lib/storage"

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  progress: number
  target: number
  completed: boolean
  rewardXP: number
}

interface AchievementSystemProps {
  subscriptions: Subscription[]
  budget: number
  totalMonthly: number
  darkMode?: boolean
  onAchievementUnlocked?: (count: number) => void // Callback para notificar al padre
}

export default function AchievementSystem({
  subscriptions,
  budget,
  totalMonthly,
  darkMode = false,
  onAchievementUnlocked,
}: AchievementSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const { toast } = useToast()

  // Definir logros (fuera del componente para estabilidad)
  const ALL_ACHIEVEMENTS: Achievement[] = [
    {
      id: "first-sub",
      title: "Primer Paso",
      description: "Añade tu primera suscripción",
      icon: <Star className="h-5 w-5 text-yellow-400" />,
      progress: 0,
      target: 1,
      completed: false,
      rewardXP: 20,
    },
    {
      id: "five-subs",
      title: "Coleccionista Novato",
      description: "Añade 5 suscripciones",
      icon: <Star className="h-5 w-5 text-blue-400" />,
      progress: 0,
      target: 5,
      completed: false,
      rewardXP: 50,
    },
    {
      id: "ten-subs",
      title: "Maestro de Suscripciones",
      description: "Añade 10 suscripciones",
      icon: <Award className="h-5 w-5 text-purple-400" />,
      progress: 0,
      target: 10,
      completed: false,
      rewardXP: 100,
    },
    {
      id: "budget-setter",
      title: "Presupuesto Establecido",
      description: "Establece tu presupuesto mensual",
      icon: <DollarSign className="h-5 w-5 text-green-400" />,
      progress: 0,
      target: 1,
      completed: false,
      rewardXP: 30,
    },
    {
      id: "under-budget",
      title: "Control Financiero",
      description: "Mantén tus gastos por debajo del presupuesto",
      icon: <TrendingDown className="h-5 w-5 text-red-400" />,
      progress: 0,
      target: 1,
      completed: false,
      rewardXP: 75,
    },
    {
      id: "categorize-all",
      title: "Organización Perfecta",
      description: "Categoriza todas tus suscripciones",
      icon: <Target className="h-5 w-5 text-orange-400" />,
      progress: 0,
      target: 100, // Porcentaje de suscripciones categorizadas
      completed: false,
      rewardXP: 80,
    },
    {
      id: "description-master",
      title: "Detallista",
      description: "Añade descripciones a todas tus suscripciones",
      icon: <Zap className="h-5 w-5 text-indigo-400" />,
      progress: 0,
      target: 100, // Porcentaje de suscripciones con descripción
      completed: false,
      rewardXP: 60,
    },
  ]

  // Cargar logros desde localStorage o inicializar
  useEffect(() => {
    const savedAchievements = storage.getItem("achievements", ALL_ACHIEVEMENTS)
    setAchievements(savedAchievements)
  }, [])

  // Actualizar progreso y desbloquear logros
  useEffect(() => {
    // Usar el setter funcional para evitar incluir 'achievements' en las dependencias
    setAchievements((prevAchievements) => {
      let unlockedCount = 0
      const updatedAchievements = prevAchievements.map((achievement) => {
        let newProgress = achievement.progress
        let newCompleted = achievement.completed

        switch (achievement.id) {
          case "first-sub":
            newProgress = subscriptions.length >= 1 ? 1 : 0
            newCompleted = newProgress >= achievement.target
            break
          case "five-subs":
            newProgress = subscriptions.length
            newCompleted = newProgress >= achievement.target
            break
          case "ten-subs":
            newProgress = subscriptions.length
            newCompleted = newProgress >= achievement.target
            break
          case "budget-setter":
            newProgress = budget > 0 ? 1 : 0
            newCompleted = newProgress >= achievement.target
            break
          case "under-budget":
            newProgress = totalMonthly <= budget && budget > 0 ? 1 : 0
            newCompleted = newProgress >= achievement.target
            break
          case "categorize-all":
            const categorizedCount = subscriptions.filter((sub) => sub.category !== "other").length
            newProgress = subscriptions.length > 0 ? (categorizedCount / subscriptions.length) * 100 : 0
            newCompleted = newProgress >= achievement.target
            break
          case "description-master":
            const describedCount = subscriptions.filter(
              (sub) => sub.description && sub.description.trim() !== "",
            ).length
            newProgress = subscriptions.length > 0 ? (describedCount / subscriptions.length) * 100 : 0
            newCompleted = newProgress >= achievement.target
            break
        }

        // Si el logro se completó y no estaba marcado como completado antes
        if (newCompleted && !achievement.completed) {
          toast({
            title: "¡Logro desbloqueado!",
            description: `Has completado "${achievement.title}" y ganado ${achievement.rewardXP} XP`,
          })
          // Aquí podrías llamar a onXPEarned si AchievementSystem también gestionara XP
        }

        if (newCompleted) {
          unlockedCount++
        }

        return {
          ...achievement,
          progress: newProgress,
          completed: newCompleted,
        }
      })

      // Solo actualizar el estado si hay cambios reales para evitar re-renders innecesarios
      if (JSON.stringify(updatedAchievements) !== JSON.stringify(prevAchievements)) {
        storage.setItem("achievements", updatedAchievements)
        onAchievementUnlocked?.(unlockedCount) // Notificar al padre el número de logros desbloqueados
        return updatedAchievements
      }
      return prevAchievements
    })
  }, [subscriptions, budget, totalMonthly, toast, onAchievementUnlocked]) // Dependencias externas

  const getProgressValue = (achievement: Achievement) => {
    if (achievement.target === 0) return 0
    if (achievement.id === "categorize-all" || achievement.id === "description-master") {
      return achievement.progress // Ya es un porcentaje
    }
    return Math.min(100, (achievement.progress / achievement.target) * 100)
  }

  return (
    <div
      className={`p-6 rounded-2xl ${
        darkMode ? "bg-fence-dark" : "bg-white/50"
      } backdrop-blur-sm border border-venetian-light/10`}
    >
      <h3 className="font-bold text-lg flex items-center mb-4">
        <Trophy className="h-5 w-5 mr-2 text-fiery-light" />
        Logros
      </h3>

      <div className="space-y-4">
        {achievements.length === 0 ? (
          <div className="text-center py-4 text-venetian-light/50">No hay logros disponibles.</div>
        ) : (
          achievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              className={`p-4 rounded-xl ${
                achievement.completed ? "bg-green-500/10 border border-green-500/20" : "bg-fence-light/10"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 bg-fence-dark">
                  {achievement.completed ? <Check className="h-5 w-5 text-green-400" /> : achievement.icon}
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-venetian-light">{achievement.title}</h5>
                  <p className="text-xs text-venetian-light/70">{achievement.description}</p>
                </div>
                <Badge className="bg-blue-500/20 text-blue-400 flex items-center">+{achievement.rewardXP} XP</Badge>
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-xs text-venetian-light/70 mb-1">
                  <span>Progreso: {Math.round(getProgressValue(achievement))}%</span>
                  <span>
                    Meta:{" "}
                    {achievement.id === "categorize-all" || achievement.id === "description-master"
                      ? `${achievement.target}%`
                      : achievement.target}
                  </span>
                </div>
                <Progress
                  value={getProgressValue(achievement)}
                  className="h-2 bg-fence-dark"
                  indicatorClassName={achievement.completed ? "bg-green-500" : "bg-blue-500"}
                />
              </div>

              <div className="flex justify-end">
                {achievement.completed ? (
                  <Badge className="bg-green-500/20 text-green-400">Completado</Badge>
                ) : (
                  <Badge variant="outline" className="text-venetian-light/50">
                    <Lock className="h-3 w-3 mr-1" />
                    Bloqueado
                  </Badge>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
