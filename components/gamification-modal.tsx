"use client"

import { Trophy, BarChart2, Gift, Target } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Subscription, AppTheme } from "@/types/subscription"
import UserLevelSystem from "@/components/user-level-system"
import MonthlyChallenges from "@/components/monthly-challenges"
import RewardsSystem from "@/components/rewards-system"
import LeaderboardSystem from "@/components/leaderboard-system"
import AchievementSystem from "@/components/achievement-system" // Importar AchievementSystem
import { useState, useEffect } from "react" // Importar useState y useEffect

interface GamificationModalProps {
  isOpen: boolean
  onClose: () => void
  subscriptions: Subscription[]
  budget: number
  totalMonthly: number
  userXP: number
  userLevel: number
  achievementsUnlocked: number // Prop para el conteo de logros
  onXPEarned: (amount: number, reason: string) => void
  onThemeUnlock: (theme: string) => void
  darkMode?: boolean
  appTheme?: AppTheme
}

export default function GamificationModal({
  isOpen,
  onClose,
  subscriptions,
  budget,
  totalMonthly,
  userXP,
  userLevel,
  achievementsUnlocked: initialAchievementsUnlocked, // Renombrar para usar un estado local
  onXPEarned,
  onThemeUnlock,
  darkMode,
  appTheme,
}: GamificationModalProps) {
  const [currentAchievementsUnlocked, setCurrentAchievementsUnlocked] = useState(initialAchievementsUnlocked)

  // Sincronizar el estado local con la prop si cambia
  useEffect(() => {
    setCurrentAchievementsUnlocked(initialAchievementsUnlocked)
  }, [initialAchievementsUnlocked])

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 bg-fence-dark border-venetian-light/10">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center text-venetian-light">
            <Trophy className="h-5 w-5 mr-2 text-fiery-light" />
            Centro de Gamificación
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <Tabs defaultValue="level" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="level">
                <Trophy className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="challenges">
                <Target className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="rewards">
                <Gift className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="leaderboard">
                <BarChart2 className="h-4 w-4" />
              </TabsTrigger>
              {/* Añadir el TabsTrigger para Logros */}
              <TabsTrigger value="achievements">{/* Icono para Logros */}</TabsTrigger>
            </TabsList>
            <TabsContent value="level" className="mt-4">
              <UserLevelSystem
                subscriptions={subscriptions}
                budget={budget}
                totalMonthly={totalMonthly}
                achievementsUnlocked={currentAchievementsUnlocked} // Usar el estado local
                darkMode={darkMode}
                appTheme={appTheme}
                userXP={userXP}
                userLevel={userLevel}
                onXPEarned={onXPEarned}
              />
            </TabsContent>
            <TabsContent value="challenges" className="mt-4">
              <MonthlyChallenges
                subscriptions={subscriptions}
                budget={budget}
                totalMonthly={totalMonthly}
                onXPEarned={onXPEarned}
                darkMode={darkMode}
                appTheme={appTheme}
              />
            </TabsContent>
            <TabsContent value="rewards" className="mt-4">
              <RewardsSystem
                subscriptions={subscriptions}
                budget={budget}
                totalMonthly={totalMonthly}
                userLevel={userLevel}
                achievementsUnlocked={currentAchievementsUnlocked} // Usar el estado local
                onThemeUnlock={onThemeUnlock}
                darkMode={darkMode}
                appTheme={appTheme}
              />
            </TabsContent>
            <TabsContent value="leaderboard" className="mt-4">
              <LeaderboardSystem userScore={userXP} userLevel={userLevel} darkMode={darkMode} appTheme={appTheme} />
            </TabsContent>
            {/* Añadir la pestaña de Logros */}
            <TabsContent value="achievements" className="mt-4">
              <AchievementSystem
                subscriptions={subscriptions}
                budget={budget}
                totalMonthly={totalMonthly}
                darkMode={darkMode}
                onAchievementUnlocked={setCurrentAchievementsUnlocked} // Callback para actualizar el conteo
              />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
