"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Target, Check, Clock, Gift, Zap, TrendingDown, DollarSign, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import type { Subscription, AppTheme } from "@/types/subscription"
import { storage } from "@/lib/storage" // Importar la utilidad de almacenamiento

interface Challenge {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  reward: number
  progress: number
  target: number
  completed: boolean
  category: "savings" | "management" | "organization" | "special"
  expiresAt: string
}

interface MonthlyChallengesProps {
  subscriptions: Subscription[]
  budget: number
  totalMonthly: number
  onXPEarned: (amount: number, reason: string) => void
  darkMode?: boolean
  appTheme?: AppTheme
}

export default function MonthlyChallenges({
  subscriptions,
  budget,
  totalMonthly,
  onXPEarned,
  darkMode = true,
  appTheme = "default",
}: MonthlyChallengesProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([])
  const [completedChallenges, setCompletedChallenges] = useState<Challenge[]>([])
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "savings" | "management" | "organization" | "special"
  >("all")
  const { toast } = useToast()

  const generateMonthlyChallenges = () => {
    const now = new Date()
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const expiresAt = lastDayOfMonth.toISOString()

    const newChallenges: Challenge[] = [
      {
        id: "budget-under",
        title: "Presupuesto controlado",
        description: "Mantén tus gastos por debajo del 80% de tu presupuesto",
        icon: <DollarSign className="h-5 w-5 text-green-400" />,
        reward: 100,
        progress: 0, // Se calculará en el siguiente useEffect
        target: 20,
        completed: false,
        category: "savings",
        expiresAt,
      },
      {
        id: "organize-subs",
        title: "Organización total",
        description: "Asigna categorías a todas tus suscripciones",
        icon: <Target className="h-5 w-5 text-blue-400" />,
        reward: 75,
        progress: 0,
        target: 100,
        completed: false,
        category: "organization",
        expiresAt,
      },
      {
        id: "reduce-monthly",
        title: "Reducción de gastos",
        description: "Reduce tu gasto mensual en un 5% respecto al mes anterior",
        icon: <TrendingDown className="h-5 w-5 text-purple-400" />,
        reward: 150,
        progress: 0,
        target: 5,
        completed: false,
        category: "savings",
        expiresAt,
      },
      {
        id: "review-all",
        title: "Revisión completa",
        description: "Revisa todas tus suscripciones activas este mes",
        icon: <Check className="h-5 w-5 text-yellow-400" />,
        reward: 50,
        progress: 0,
        target: 100,
        completed: false,
        category: "management",
        expiresAt,
      },
      {
        id: "add-descriptions",
        title: "Documentación detallada",
        description: "Añade descripciones a todas tus suscripciones",
        icon: <Zap className="h-5 w-5 text-orange-400" />,
        reward: 80,
        progress: 0,
        target: 100,
        completed: false,
        category: "organization",
        expiresAt,
      },
    ]

    setChallenges(newChallenges)
    storage.setItem("monthlyChallenges", newChallenges)
  }

  // Cargar desafíos al montar el componente
  useEffect(() => {
    const savedChallenges = storage.getItem("monthlyChallenges", [])
    if (savedChallenges.length > 0) {
      const currentDate = new Date()
      const expired = savedChallenges.some((c: Challenge) => new Date(c.expiresAt) < currentDate)
      if (expired) {
        generateMonthlyChallenges()
      } else {
        setChallenges(savedChallenges)
      }
    } else {
      generateMonthlyChallenges()
    }
  }, [])

  // Actualizar desafíos activos y completados cuando 'challenges' cambia
  useEffect(() => {
    setActiveChallenges(challenges.filter((c) => !c.completed))
    setCompletedChallenges(challenges.filter((c) => c.completed))
  }, [challenges])

  // Actualizar progreso de los desafíos basado en datos externos
  useEffect(() => {
    if (challenges.length === 0) return

    // Usar el setter funcional para evitar incluir 'challenges' en las dependencias
    setChallenges((prevChallenges) => {
      const updatedChallenges = prevChallenges.map((challenge) => {
        let updatedProgress = challenge.progress
        let isCompleted = challenge.completed

        switch (challenge.id) {
          case "budget-under":
            updatedProgress = budget > 0 ? Math.max(0, (1 - totalMonthly / budget) * 100) : 0
            isCompleted = updatedProgress >= challenge.target
            break
          case "organize-subs":
            const categorizedSubs = subscriptions.filter((sub) => sub.category !== "other").length
            updatedProgress = subscriptions.length > 0 ? (categorizedSubs / subscriptions.length) * 100 : 0
            isCompleted = updatedProgress >= challenge.target
            break
          case "add-descriptions":
            const subsWithDesc = subscriptions.filter((sub) => sub.description && sub.description.trim() !== "").length
            updatedProgress = subscriptions.length > 0 ? (subsWithDesc / subscriptions.length) * 100 : 0
            isCompleted = updatedProgress >= challenge.target
            break
        }

        if (isCompleted && !challenge.completed) {
          onXPEarned(challenge.reward, `Completar desafío: ${challenge.title}`)
          toast({
            title: "¡Desafío completado!",
            description: `Has completado "${challenge.title}" y ganado ${challenge.reward} XP`,
          })
        }

        return { ...challenge, progress: updatedProgress, completed: isCompleted }
      })

      // Solo actualizar el estado si hay cambios reales para evitar re-renders innecesarios
      if (JSON.stringify(updatedChallenges) !== JSON.stringify(prevChallenges)) {
        storage.setItem("monthlyChallenges", updatedChallenges)
        return updatedChallenges
      }
      return prevChallenges
    })
  }, [subscriptions, budget, totalMonthly, onXPEarned, toast]) // Dependencias externas

  // Marcar un desafío como completado manualmente
  const completeChallenge = (id: string) => {
    setChallenges((prevChallenges) => {
      const updatedChallenges = prevChallenges.map((challenge) => {
        if (challenge.id === id && (id === "review-all" || id === "reduce-monthly") && !challenge.completed) {
          onXPEarned(challenge.reward, `Completar desafío: ${challenge.title}`)
          toast({
            title: "¡Desafío completado!",
            description: `Has completado "${challenge.title}" y ganado ${challenge.reward} XP`,
          })
          return { ...challenge, progress: 100, completed: true }
        }
        return challenge
      })
      storage.setItem("monthlyChallenges", updatedChallenges)
      return updatedChallenges
    })
  }

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

  const filteredActiveChallenges = activeChallenges.filter(
    (c) => selectedCategory === "all" || c.category === selectedCategory,
  )
  const filteredCompletedChallenges = completedChallenges.filter(
    (c) => selectedCategory === "all" || c.category === selectedCategory,
  )

  return (
    <div className={getContainerStyle()}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm uppercase tracking-wider flex items-center text-venetian-light">
          <Target className="h-4 w-4 mr-2 text-fiery-light" />
          Desafíos Mensuales
        </h3>
        <Badge className="bg-venetian-light/20 text-venetian-light">
          <Calendar className="h-3 w-3 mr-1" />
          <span>{new Date().toLocaleDateString("es-ES", { month: "long" })}</span>
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {(["all", "savings", "management", "organization", "special"] as const).map((cat) => (
          <Badge
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            className="cursor-pointer capitalize"
            onClick={() => setSelectedCategory(cat)}
          >
            {cat === "all" ? "Todos" : cat}
          </Badge>
        ))}
      </div>

      <div className="space-y-4 mb-6">
        <h4 className="text-sm font-medium text-venetian-light">Desafíos activos:</h4>
        {filteredActiveChallenges.length === 0 ? (
          <div className="text-center py-4 text-venetian-light/50">No hay desafíos activos en esta categoría.</div>
        ) : (
          filteredActiveChallenges.map((challenge) => (
            <motion.div
              key={challenge.id}
              className={`p-4 rounded-xl ${appTheme === "neon" ? "bg-fence-light/30 border border-venetian-light/10" : "bg-fence-light/20"}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 bg-fence-dark">
                  {challenge.icon}
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-venetian-light">{challenge.title}</h5>
                  <p className="text-xs text-venetian-light/70">{challenge.description}</p>
                </div>
                <Badge className="bg-blue-500/20 text-blue-400 flex items-center">
                  <Gift className="h-3 w-3 mr-1" />
                  {challenge.reward} XP
                </Badge>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-xs text-venetian-light/70 mb-1">
                  <span>Progreso: {Math.round(challenge.progress)}%</span>
                  <span>Meta: {challenge.target}%</span>
                </div>
                <Progress
                  value={challenge.progress}
                  className="h-2 bg-fence-dark"
                  indicatorClassName={challenge.progress >= challenge.target ? "bg-green-500" : "bg-blue-500"}
                />
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center text-xs text-venetian-light/70">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>
                    Expira:{" "}
                    {new Date(challenge.expiresAt).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                  </span>
                </div>
                {(challenge.id === "review-all" || challenge.id === "reduce-monthly") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => completeChallenge(challenge.id)}
                    className="h-7 text-xs rounded-lg border-venetian-light/30 text-venetian-light hover:bg-venetian-light hover:text-fence-dark"
                  >
                    Completar
                  </Button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {filteredCompletedChallenges.length > 0 && (
        <div className="mt-6 pt-4 border-t border-venetian-light/10">
          <h4 className="text-sm font-medium text-venetian-light mb-3">Completados:</h4>
          <div className="space-y-2">
            {filteredCompletedChallenges.map((challenge) => (
              <div
                key={challenge.id}
                className="flex justify-between items-center p-3 rounded-lg bg-fence-light/10 hover:bg-fence-light/20 transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center mr-2 bg-green-500/20">
                    <Check className="h-3 w-3 text-green-400" />
                  </div>
                  <span className="text-sm text-venetian-light">{challenge.title}</span>
                </div>
                <Badge className="bg-green-500/20 text-green-400">+{challenge.reward} XP</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
