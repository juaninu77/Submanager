"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Trophy, Star, Award, Crown, Zap, ArrowUp, Gift, Check, Lock } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import type { Subscription, AppTheme } from "@/types/subscription"
import confetti from "canvas-confetti"
import { storage } from "@/lib/storage" // Importar la utilidad de almacenamiento

interface UserLevelSystemProps {
  subscriptions: Subscription[]
  budget: number
  totalMonthly: number
  achievementsUnlocked: number
  userXP: number
  userLevel: number
  onXPEarned: (amount: number, reason: string) => void
  darkMode?: boolean
  appTheme?: AppTheme
}

interface UserLevel {
  level: number
  title: string
  icon: React.ReactNode
  requiredXP: number
  benefits: string[]
}

export const USER_LEVELS: UserLevel[] = [
  {
    level: 1,
    title: "Principiante",
    icon: <Zap className="h-5 w-5 text-blue-400" />,
    requiredXP: 0,
    benefits: ["Acceso a estadísticas básicas", "Seguimiento de suscripciones"],
  },
  {
    level: 2,
    title: "Gestor Novato",
    icon: <Star className="h-5 w-5 text-green-400" />,
    requiredXP: 100,
    benefits: ["Desbloqueo de etiquetas personalizadas", "Consejos de ahorro básicos"],
  },
  {
    level: 3,
    title: "Administrador",
    icon: <Award className="h-5 w-5 text-yellow-400" />,
    requiredXP: 300,
    benefits: ["Análisis de tendencias avanzado", "Comparación mensual detallada", "Exportación de datos"],
  },
  {
    level: 4,
    title: "Experto Financiero",
    icon: <Trophy className="h-5 w-5 text-orange-400" />,
    requiredXP: 700,
    benefits: ["Predicciones de gastos futuros", "Recomendaciones personalizadas", "Temas exclusivos"],
  },
  {
    level: 5,
    title: "Maestro del Presupuesto",
    icon: <Crown className="h-5 w-5 text-purple-400" />,
    requiredXP: 1500,
    benefits: [
      "Todas las funciones desbloqueadas",
      "Insignia de maestro en tu perfil",
      "Acceso anticipado a nuevas funciones",
    ],
  },
]

export default function UserLevelSystem({
  subscriptions,
  budget,
  totalMonthly,
  achievementsUnlocked,
  userXP,
  userLevel,
  onXPEarned,
  darkMode = true,
  appTheme = "default",
}: UserLevelSystemProps) {
  const [currentLevel, setCurrentLevel] = useState(userLevel)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [xpProgress, setXPProgress] = useState(0)
  const [xpToNextLevel, setXPToNextLevel] = useState(0)
  const [levelDetails, setLevelDetails] = useState<UserLevel | null>(null)
  const [xpHistory, setXPHistory] = useState<{ date: string; amount: number; reason: string }[]>([])
  const { toast } = useToast()

  useEffect(() => {
    setXPHistory(storage.getItem("xpHistory", []))
  }, [])

  const addXP = useCallback(
    (amount: number, reason: string) => {
      onXPEarned(amount, reason) // Notifica al componente padre
      const newEntry = {
        date: new Date().toISOString().split("T")[0],
        amount,
        reason,
      }
      setXPHistory((prevHistory) => {
        const updatedHistory = [...prevHistory, newEntry]
        storage.setItem("xpHistory", updatedHistory)
        return updatedHistory
      })
    },
    [onXPEarned],
  )

  // Calcular nivel y progreso
  useEffect(() => {
    let newLevel = 1
    let nextLevelXP = 0

    for (let i = 0; i < USER_LEVELS.length; i++) {
      if (userXP >= USER_LEVELS[i].requiredXP) {
        newLevel = USER_LEVELS[i].level
        nextLevelXP = i < USER_LEVELS.length - 1 ? USER_LEVELS[i + 1].requiredXP : USER_LEVELS[i].requiredXP
      } else {
        break
      }
    }

    if (newLevel > currentLevel) {
      setShowLevelUp(true)
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
      toast({
        title: `¡Has subido al nivel ${newLevel}!`,
        description: `Ahora eres ${USER_LEVELS[newLevel - 1].title}`,
      })
      setTimeout(() => setShowLevelUp(false), 5000)
    }

    setCurrentLevel(newLevel)
    setLevelDetails(USER_LEVELS[newLevel - 1])

    const currentLevelXP = USER_LEVELS[newLevel - 1].requiredXP
    const progress =
      nextLevelXP > currentLevelXP ? ((userXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100 : 100
    setXPProgress(progress)
    setXPToNextLevel(nextLevelXP - userXP)
  }, [userXP, currentLevel, toast]) // userXP y currentLevel son las dependencias correctas aquí

  // Simular ganancia de XP basada en acciones del usuario (solo una vez por día/condición)
  useEffect(() => {
    const isInitialized = storage.getItem("xpSystemInitialized", false)
    const today = new Date().toISOString().split("T")[0]

    if (!isInitialized) {
      addXP(50, "Bienvenido a la aplicación")
      storage.setItem("xpSystemInitialized", true)
    } else {
      // XP por mantener presupuesto
      if (totalMonthly <= budget && budget > 0) {
        const existingBudgetXP = xpHistory.some(
          (entry) => entry.date === today && entry.reason === "Mantener presupuesto",
        )
        if (!existingBudgetXP) {
          addXP(20, "Mantener presupuesto")
        }
      }

      // XP por logros desbloqueados (ejemplo, esto debería ser más sofisticado)
      if (achievementsUnlocked > 0) {
        const existingAchievementXP = xpHistory.some(
          (entry) => entry.date === today && entry.reason.includes("Desbloquear logros"),
        )
        if (!existingAchievementXP) {
          addXP(achievementsUnlocked * 30, `Desbloquear ${achievementsUnlocked} logros`)
        }
      }

      // XP por gestionar múltiples suscripciones
      if (subscriptions.length >= 5) {
        const existingSubsXP = xpHistory.some(
          (entry) => entry.date === today && entry.reason === "Gestionar 5+ suscripciones",
        )
        if (!existingSubsXP) {
          addXP(50, "Gestionar 5+ suscripciones")
        }
      }
    }
  }, [subscriptions, budget, totalMonthly, achievementsUnlocked, xpHistory, addXP])

  const getContainerStyle = () => {
    switch (appTheme) {
      case "neon":
        return "border border-fiery-light/30 bg-fence-dark/80 backdrop-blur-md rounded-3xl p-6 shadow-glow"
      case "minimal":
        return "border-0 bg-fence-dark/50 rounded-3xl p-6"
      case "gradient":
        return "border-0 bg-gradient-to-br from-fence-dark via-fence-light/5 to-fence-dark/90 backdrop-blur-md rounded-3xl p-6"
      default:
        return "border border-venetian-light/10 bg-fence-dark rounded-3xl p-6"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "numeric" })
  }

  return (
    <>
      <AnimatePresence>
        {showLevelUp && levelDetails && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-4 right-4 left-4 z-50 max-w-md mx-auto"
          >
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 rounded-xl shadow-lg text-white text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-4"
              >
                {levelDetails.icon}
              </motion.div>
              <motion.h3
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-2xl font-bold mb-2"
              >
                ¡Nivel {currentLevel} Desbloqueado!
              </motion.h3>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="text-lg mb-4"
              >
                Ahora eres {levelDetails.title}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={getContainerStyle()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm uppercase tracking-wider flex items-center text-venetian-light">
            <Trophy className="h-4 w-4 mr-2 text-fiery-light" />
            Nivel de Usuario
          </h3>
          {levelDetails && (
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              {levelDetails.icon}
              <span className="ml-1">Nivel {currentLevel}</span>
            </Badge>
          )}
        </div>

        {levelDetails && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mr-3">
                  {levelDetails.icon}
                </div>
                <div>
                  <h4 className="font-medium text-venetian-light">{levelDetails.title}</h4>
                  <p className="text-xs text-venetian-light/70">
                    {currentLevel < USER_LEVELS.length
                      ? `${xpToNextLevel} XP para nivel ${currentLevel + 1}`
                      : "Nivel máximo alcanzado"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-venetian-light">{userXP} XP</span>
              </div>
            </div>
            <Progress
              value={xpProgress}
              className="h-2 bg-fence-light/30"
              indicatorClassName="bg-gradient-to-r from-blue-500 to-purple-500"
            />
            {currentLevel < USER_LEVELS.length && (
              <div className="flex justify-between text-xs text-venetian-light/70 mt-1">
                <span>Nivel {currentLevel}</span>
                <span>Nivel {currentLevel + 1}</span>
              </div>
            )}
          </div>
        )}

        {levelDetails && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-venetian-light mb-2">Beneficios actuales:</h4>
            <ul className="space-y-1 text-sm text-venetian-light/80">
              {levelDetails.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-400 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {currentLevel < USER_LEVELS.length && (
          <div className="p-3 rounded-lg bg-fence-light/20 border border-venetian-light/10">
            <h4 className="text-sm font-medium text-venetian-light mb-2 flex items-center">
              <ArrowUp className="h-4 w-4 mr-1 text-blue-400" />
              Próximo nivel: {USER_LEVELS[currentLevel].title}
            </h4>
            <p className="text-xs text-venetian-light/70 mb-2">
              Desbloquea al alcanzar {USER_LEVELS[currentLevel].requiredXP} XP
            </p>
            <div className="text-xs text-venetian-light/80">
              <span className="font-medium">Nuevos beneficios:</span>
              <ul className="mt-1 space-y-1">
                {USER_LEVELS[currentLevel].benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <Lock className="h-3 w-3 mr-1 text-venetian-light/50 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-venetian-light/10">
          <h4 className="text-sm font-medium text-venetian-light mb-2">Historial de XP reciente:</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {xpHistory.length > 0 ? (
              [...xpHistory]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map((entry, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 rounded-lg bg-fence-light/10 hover:bg-fence-light/20 transition-colors"
                  >
                    <div className="flex items-center">
                      <Gift className="h-3 w-3 mr-2 text-green-400" />
                      <div>
                        <span className="text-xs text-venetian-light">{entry.reason}</span>
                        <div className="text-[10px] text-venetian-light/50">{formatDate(entry.date)}</div>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400">+{entry.amount} XP</Badge>
                  </div>
                ))
            ) : (
              <div className="text-center py-2 text-venetian-light/50 text-xs">No hay historial de XP</div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
