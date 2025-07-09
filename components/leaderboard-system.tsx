"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { BarChart2, Trophy, Medal, Award, Crown, Users, ArrowUp, ArrowDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import type { AppTheme } from "@/types/subscription"
import { storage } from "@/lib/storage" // Importar la utilidad de almacenamiento

interface LeaderboardEntry {
  id: string
  name: string
  avatar?: string
  score: number
  level: number
  rank: number
  change: number
}

interface LeaderboardSystemProps {
  userScore: number
  userLevel: number
  darkMode?: boolean
  appTheme?: AppTheme
}

export default function LeaderboardSystem({
  userScore,
  userLevel,
  darkMode = true,
  appTheme = "default",
}: LeaderboardSystemProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [userEntry, setUserEntry] = useState<LeaderboardEntry | null>(null)
  const [activeTab, setActiveTab] = useState<"global" | "friends" | "monthly">("global")
  const { toast } = useToast()

  const generateSampleLeaderboard = () => {
    const sampleNames = [
      "Ana",
      "Carlos",
      "Elena",
      "David",
      "Laura",
      "Miguel",
      "Sofía",
      "Javier",
      "Lucía",
      "Pablo",
      "Marta",
      "Diego",
      "Carmen",
      "Alejandro",
      "Isabel",
    ]
    const entries: LeaderboardEntry[] = []
    for (let i = 0; i < 15; i++) {
      const randomScore = Math.floor(Math.random() * 1000) + 500 - i * 50
      const randomLevel = Math.floor(Math.random() * 3) + 1 + Math.floor((15 - i) / 5)
      entries.push({
        id: `user-${i}`,
        name: sampleNames[i],
        score: randomScore,
        level: randomLevel,
        rank: 0,
        change: Math.floor(Math.random() * 5) * (Math.random() > 0.5 ? 1 : -1),
      })
    }
    return entries
  }

  // Función para actualizar la puntuación del usuario y reordenar el leaderboard
  const updateUserScoreAndLeaderboard = (score: number, level: number) => {
    setLeaderboard((prevLeaderboard) => {
      const oldUserEntry = prevLeaderboard.find((e) => e.id === "user")
      const oldRank = oldUserEntry?.rank

      const updatedLeaderboard = prevLeaderboard.map((entry) =>
        entry.id === "user" ? { ...entry, score, level } : entry,
      )

      const sortedLeaderboard = updatedLeaderboard.sort((a, b) => b.score - a.score)

      sortedLeaderboard.forEach((entry, index) => {
        const newRank = index + 1
        if (entry.id === "user") {
          const rankChange = oldRank ? oldRank - newRank : 0
          entry.change = rankChange
          if (rankChange > 0) {
            toast({
              title: "¡Has subido en la clasificación!",
              description: `Has subido ${rankChange} ${rankChange === 1 ? "posición" : "posiciones"}`,
            })
          }
        }
        entry.rank = newRank
      })

      storage.setItem("leaderboard", sortedLeaderboard)
      return sortedLeaderboard
    })
  }

  // Cargar leaderboard al montar el componente
  useEffect(() => {
    const savedLeaderboard = storage.getItem("leaderboard", [])
    if (savedLeaderboard.length > 0) {
      setLeaderboard(savedLeaderboard)
    } else {
      const initialLeaderboard = generateSampleLeaderboard()
      initialLeaderboard.push({
        id: "user",
        name: "Tú",
        score: userScore,
        level: userLevel,
        rank: 0,
        change: 0,
      })
      const sorted = initialLeaderboard.sort((a, b) => b.score - a.score)
      sorted.forEach((e, i) => (e.rank = i + 1))
      setLeaderboard(sorted)
      storage.setItem("leaderboard", sorted)
    }
  }, [])

  // Actualizar la puntuación del usuario cuando cambie (prop userScore o userLevel)
  useEffect(() => {
    const currentUserEntry = leaderboard.find((e) => e.id === "user")
    if (currentUserEntry && (currentUserEntry.score !== userScore || currentUserEntry.level !== userLevel)) {
      updateUserScoreAndLeaderboard(userScore, userLevel)
    }
    setUserEntry(currentUserEntry || null)
  }, [userScore, userLevel, leaderboard]) // Dependencias externas

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-400" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />
    return <Trophy className="h-5 w-5 text-venetian-light/50" />
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

  return (
    <div className={getContainerStyle()}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm uppercase tracking-wider flex items-center text-venetian-light">
          <BarChart2 className="h-4 w-4 mr-2 text-fiery-light" />
          Clasificación
        </h3>
        {userEntry && (
          <Badge className="bg-venetian-light/20 text-venetian-light flex items-center">
            <Trophy className="h-3 w-3 mr-1" />
            <span>Tu posición: #{userEntry.rank}</span>
          </Badge>
        )}
      </div>

      <Tabs defaultValue="global" value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="global">Global</TabsTrigger>
          <TabsTrigger value="friends">Amigos</TabsTrigger>
          <TabsTrigger value="monthly">Mensual</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-2">
          {leaderboard.length === 0 ? (
            <div className="text-center py-4 text-venetian-light/50">No hay datos disponibles</div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {leaderboard.slice(0, 3).map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    className={`p-3 rounded-xl text-center ${
                      entry.id === "user" ? "bg-fiery-light/20 border border-fiery-light/30" : "bg-fence-light/20"
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="flex justify-center mb-2">{getRankIcon(index + 1)}</div>
                    <Avatar className="w-12 h-12 mx-auto mb-2">
                      <AvatarFallback className="bg-fence-light text-venetian-light">
                        {entry.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`font-medium ${entry.id === "user" ? "text-fiery-light" : "text-venetian-light"}`}>
                      {entry.name}
                    </div>
                    <div className="text-sm text-venetian-light/70">{entry.score} pts</div>
                    <Badge className="mt-1 bg-fence-dark/50 text-venetian-light/70">Nivel {entry.level}</Badge>
                  </motion.div>
                ))}
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {leaderboard.slice(3).map((entry) => (
                  <div
                    key={entry.id}
                    className={`flex items-center p-3 rounded-lg ${
                      entry.id === "user"
                        ? "bg-fiery-light/20 border border-fiery-light/30"
                        : "bg-fence-light/10 hover:bg-fence-light/20"
                    } transition-colors`}
                  >
                    <div className="w-8 text-center font-medium text-venetian-light/70">#{entry.rank}</div>
                    <Avatar className="w-8 h-8 mr-3">
                      <AvatarFallback className="bg-fence-light text-venetian-light">
                        {entry.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div
                        className={`font-medium ${entry.id === "user" ? "text-fiery-light" : "text-venetian-light"}`}
                      >
                        {entry.name}
                      </div>
                      <div className="text-xs text-venetian-light/70">Nivel {entry.level}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-venetian-light">{entry.score} pts</div>
                      {entry.change !== 0 && (
                        <div
                          className={`text-xs flex items-center justify-end ${
                            entry.change > 0 ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {entry.change > 0 ? (
                            <ArrowUp className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDown className="h-3 w-3 mr-1" />
                          )}
                          <span>{Math.abs(entry.change)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-6 pt-4 border-t border-venetian-light/10">
        <div className="flex justify-between items-center text-sm text-venetian-light/70">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>Total de usuarios: {leaderboard.length}</span>
          </div>
          <div>Actualizado: {new Date().toLocaleDateString()}</div>
        </div>
      </div>
    </div>
  )
}
