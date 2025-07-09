"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Zap } from "lucide-react"
import { useState, useEffect } from "react"
import {
  Gift,
  Check,
  Trophy,
  DollarSignIcon,
  MinimizeIcon,
  PaletteIcon,
  DownloadIcon,
  TrendingUpIcon,
  SquareIcon,
  Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import type { Subscription, AppTheme } from "@/types/subscription"
import confetti from "canvas-confetti"
import { storage } from "@/lib/storage" // Importar la utilidad de almacenamiento
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

interface Reward {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: "badge" | "theme" | "feature"
  rarity: "common" | "rare" | "epic" | "legendary"
  unlocked: boolean
  condition: string
  conditionMet: boolean
}

// Catálogo de recompensas definido fuera del componente para estabilidad
const REWARDS_CATALOG: Reward[] = [
  {
    id: "badge-saver",
    name: "Ahorrador",
    description: "Mantén tus gastos por debajo del 50% de tu presupuesto",
    icon: <DollarSignIcon className="h-5 w-5 text-green-400" />,
    category: "badge",
    rarity: "common",
    unlocked: false,
    condition: "Gastos < 50% del presupuesto",
    conditionMet: false,
  },
  {
    id: "badge-collector",
    name: "Coleccionista",
    description: "Registra más de 10 suscripciones",
    icon: <Trophy className="h-5 w-5 text-blue-400" />,
    category: "badge",
    rarity: "common",
    unlocked: false,
    condition: "10+ suscripciones",
    conditionMet: false,
  },
  {
    id: "badge-master",
    name: "Maestro del Presupuesto",
    description: "Alcanza el nivel 3 de usuario",
    icon: <Trophy className="h-5 w-5 text-yellow-400" />,
    category: "badge",
    rarity: "rare",
    unlocked: false,
    condition: "Nivel 3+",
    conditionMet: false,
  },
  {
    id: "badge-achiever",
    name: "Logrador",
    description: "Desbloquea 5 logros",
    icon: <Trophy className="h-5 w-5 text-purple-400" />,
    category: "badge",
    rarity: "rare",
    unlocked: false,
    condition: "5+ logros",
    conditionMet: false,
  },
  {
    id: "theme-neon",
    name: "Tema Neón",
    description: "Un tema brillante con efectos de neón",
    icon: <Zap className="h-5 w-5 text-pink-400" />,
    category: "theme",
    rarity: "rare",
    unlocked: false,
    condition: "Nivel 2+",
    conditionMet: false,
  },
  {
    id: "theme-minimal",
    name: "Tema Minimalista",
    description: "Un tema limpio y minimalista",
    icon: <MinimizeIcon className="h-5 w-5 text-blue-400" />,
    category: "theme",
    rarity: "rare",
    unlocked: false,
    condition: "Nivel 2+",
    conditionMet: false,
  },
  {
    id: "theme-gradient",
    name: "Tema Gradiente",
    description: "Un tema con hermosos degradados",
    icon: <PaletteIcon className="h-5 w-5 text-orange-400" />,
    category: "theme",
    rarity: "epic",
    unlocked: false,
    condition: "Nivel 3+",
    conditionMet: false,
  },
  {
    id: "theme-brutalist",
    name: "Tema Brutalista",
    description: "Un tema minimalista y audaz inspirado en el diseño brutalista",
    icon: <SquareIcon className="h-5 w-5 text-red-400" />,
    category: "theme",
    rarity: "epic",
    unlocked: false,
    condition: "Nivel 3+",
    conditionMet: false,
  },
  {
    id: "feature-export",
    name: "Exportación Avanzada",
    description: "Exporta tus datos en múltiples formatos",
    icon: <DownloadIcon className="h-5 w-5 text-green-400" />,
    category: "feature",
    rarity: "epic",
    unlocked: false,
    condition: "Nivel 4+",
    conditionMet: false,
  },
  {
    id: "feature-predictions",
    name: "Predicciones",
    description: "Predicciones de gastos futuros",
    icon: <TrendingUpIcon className="h-5 w-5 text-blue-400" />,
    category: "feature",
    rarity: "legendary",
    unlocked: false,
    condition: "Nivel 5",
    conditionMet: false,
  },
]

interface RewardsSystemProps {
  subscriptions: Subscription[]
  budget: number
  totalMonthly: number
  userLevel: number
  achievementsUnlocked: number
  onThemeUnlock: (theme: string) => void
  darkMode?: boolean
  appTheme?: AppTheme
}

export default function RewardsSystem({
  subscriptions,
  budget,
  totalMonthly,
  userLevel,
  achievementsUnlocked,
  onThemeUnlock,
  darkMode = true,
  appTheme = "default",
}: RewardsSystemProps) {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [activeTab, setActiveTab] = useState<"all" | "badges" | "themes" | "features">("all")
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false)
  const [unlockedReward, setUnlockedReward] = useState<Reward | null>(null)
  const { toast } = useToast()

  // Inicializar recompensas desde localStorage o con el catálogo predefinido
  useEffect(() => {
    const savedRewards = storage.getItem("userRewards", REWARDS_CATALOG)
    setRewards(savedRewards)
  }, [])

  // Verificar condiciones para desbloquear recompensas
  useEffect(() => {
    // Usar el setter funcional para evitar incluir 'rewards' en las dependencias
    setRewards((prevRewards) => {
      const updatedRewards = prevRewards.map((reward) => {
        let conditionMet = reward.conditionMet

        // Verificar condiciones según el ID de la recompensa
        switch (reward.id) {
          case "badge-saver":
            conditionMet = budget > 0 && totalMonthly < budget * 0.5
            break
          case "badge-collector":
            conditionMet = subscriptions.length >= 10
            break
          case "badge-master":
            conditionMet = userLevel >= 3
            break
          case "badge-achiever":
            conditionMet = achievementsUnlocked >= 5
            break
          case "theme-neon":
          case "theme-minimal":
            conditionMet = userLevel >= 2
            break
          case "theme-gradient":
          case "theme-brutalist":
            conditionMet = userLevel >= 3
            break
          case "feature-export":
            conditionMet = userLevel >= 4
            break
          case "feature-predictions":
            conditionMet = userLevel >= 5
            break
        }

        // Si la condición se cumple y la recompensa no está desbloqueada, mostrar animación
        if (conditionMet && !reward.unlocked && !reward.conditionMet) {
          // Marcar para mostrar animación
          setTimeout(() => {
            setUnlockedReward(reward)
            setShowUnlockAnimation(true)

            // Lanzar confeti para recompensas raras o mejores
            if (reward.rarity !== "common") {
              confetti({
                particleCount: reward.rarity === "legendary" ? 150 : 100,
                spread: 70,
                origin: { y: 0.6 },
              })
            }
          }, 1000)
        }

        return {
          ...reward,
          conditionMet,
        }
      })

      // Solo actualizar el estado si hay cambios reales para evitar re-renders innecesarios
      if (JSON.stringify(updatedRewards) !== JSON.stringify(prevRewards)) {
        storage.setItem("userRewards", updatedRewards)
        return updatedRewards
      }
      return prevRewards
    })
  }, [subscriptions, budget, totalMonthly, userLevel, achievementsUnlocked]) // Dependencias externas

  // Desbloquear una recompensa
  const unlockReward = (id: string) => {
    setRewards((prevRewards) => {
      const updatedRewards = prevRewards.map((reward) => {
        if (reward.id === id && reward.conditionMet) {
          // Si es un tema, notificar al componente padre
          if (reward.category === "theme") {
            const themeName = id.replace("theme-", "")
            onThemeUnlock(themeName)

            toast({
              title: "¡Tema desbloqueado!",
              description: `Has desbloqueado el tema ${reward.name}`,
            })
          } else {
            toast({
              title: "¡Recompensa desbloqueada!",
              description: `Has desbloqueado: ${reward.name}`,
            })
          }

          return {
            ...reward,
            unlocked: true,
          }
        }
        return reward
      })
      storage.setItem("userRewards", updatedRewards)
      return updatedRewards
    })
    setShowUnlockAnimation(false)
  }

  // Obtener el color según la rareza
  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case "common":
        return "text-blue-400 bg-blue-400/20"
      case "rare":
        return "text-purple-400 bg-purple-400/20"
      case "epic":
        return "text-orange-400 bg-orange-400/20"
      case "legendary":
        return "text-yellow-400 bg-yellow-400/20"
      default:
        return "text-gray-400 bg-gray-400/20"
    }
  }

  // Obtener el estilo del contenedor según el tema
  const getContainerStyle = () => {
    switch (appTheme) {
      case "neon":
        return "border border-fiery-light/30 bg-fence-dark/80 backdrop-blur-md rounded-3xl p-6 shadow-glow"
      case "minimal":
        return "border-0 bg-fence-dark/50 rounded-3xl p-6"
      case "gradient":
        return "border-0 bg-gradient-to-br from-fence-dark via-fence-light/5 to-fence-dark/90 backdrop-blur-md rounded-3xl p-6"
      case "brutalist":
        return "border-2 border-red-500 bg-gray-900 rounded-none p-4 shadow-none"
      default:
        return "border border-venetian-light/10 bg-fence-dark rounded-3xl p-6"
    }
  }

  // Filtrar recompensas según la pestaña activa
  const filteredRewards = rewards.filter((reward) => {
    if (activeTab === "all") return true
    return reward.category === activeTab.slice(0, -1) // Quitar la 's' del final
  })

  return (
    <>
      {/* Animación de desbloqueo */}
      {showUnlockAnimation && unlockedReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-gradient-to-r from-fence-dark to-fence-light/50 p-8 rounded-2xl shadow-lg max-w-sm w-full text-center"
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-venetian-light mb-2"
            >
              ¡Nueva Recompensa!
            </motion.div>

            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-fence-light to-fence-dark flex items-center justify-center mx-auto my-6"
            >
              {unlockedReward.icon}
            </motion.div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
              <h3 className="text-xl font-bold text-venetian-light mb-2">{unlockedReward.name}</h3>
              <p className="text-venetian-light/70 mb-6">{unlockedReward.description}</p>

              <Badge className={`mb-6 ${getRarityColor(unlockedReward.rarity)}`}>
                {unlockedReward.rarity.charAt(0).toUpperCase() + unlockedReward.rarity.slice(1)}
              </Badge>

              <Button
                onClick={() => unlockReward(unlockedReward.id)}
                className="bg-fiery-light hover:bg-fiery-dark text-white"
              >
                Reclamar
              </Button>
            </motion.div>
          </motion.div>
        </div>
      )}

      {/* Sistema de recompensas */}
      <div className={getContainerStyle()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm uppercase tracking-wider flex items-center text-venetian-light">
            <Gift className="h-4 w-4 mr-2 text-fiery-light" />
            Recompensas
          </h3>

          <Badge className="bg-venetian-light/20 text-venetian-light">
            {rewards.filter((r) => r.unlocked).length}/{rewards.length}
          </Badge>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="badges">Insignias</TabsTrigger>
            <TabsTrigger value="themes">Temas</TabsTrigger>
            <TabsTrigger value="features">Funciones</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredRewards.length === 0 ? (
              <div className="text-center py-4 text-venetian-light/50">No hay recompensas disponibles</div>
            ) : (
              filteredRewards.map((reward) => (
                <div
                  key={reward.id}
                  className={`p-4 rounded-xl ${
                    reward.unlocked ? "bg-fence-light/30 border border-venetian-light/20" : "bg-fence-light/10"
                  } transition-all hover:bg-fence-light/40`}
                >
                  <div className="flex items-start">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
                        reward.unlocked ? "bg-gradient-to-br from-fence-light to-fence-dark" : "bg-fence-dark"
                      }`}
                    >
                      {reward.unlocked ? reward.icon : <Lock className="h-5 w-5 text-venetian-light/50" />}
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4
                          className={`font-medium ${
                            reward.unlocked ? "text-venetian-light" : "text-venetian-light/50"
                          }`}
                        >
                          {reward.name}
                        </h4>
                        <Badge className={`${getRarityColor(reward.rarity)}`}>
                          {reward.rarity.charAt(0).toUpperCase() + reward.rarity.slice(1)}
                        </Badge>
                      </div>

                      <p
                        className={`text-xs mt-1 ${
                          reward.unlocked ? "text-venetian-light/70" : "text-venetian-light/40"
                        }`}
                      >
                        {reward.description}
                      </p>

                      <div className="flex justify-between items-center mt-3">
                        <div
                          className={`text-xs flex items-center ${
                            reward.conditionMet ? "text-green-400" : "text-venetian-light/50"
                          }`}
                        >
                          {reward.conditionMet ? <Check className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
                          <span>{reward.condition}</span>
                        </div>

                        {reward.conditionMet && !reward.unlocked && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => unlockReward(reward.id)}
                            className="h-7 text-xs rounded-lg border-venetian-light/30 text-venetian-light hover:bg-venetian-light hover:text-fence-dark"
                          >
                            Desbloquear
                          </Button>
                        )}

                        {reward.unlocked && <Badge className="bg-green-500/20 text-green-400">Desbloqueado</Badge>}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
