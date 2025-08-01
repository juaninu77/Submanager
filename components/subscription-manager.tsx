"use client"

import { useState, useEffect } from "react"
import { Moon, Sun, CalendarIcon, Settings, PaletteIcon, Trophy, User, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Calendar from "@/components/calendar"
import SubscriptionSummary from "@/components/subscription-summary"
import AddSubscriptionForm from "@/components/add-subscription-form"
import EditSubscriptionForm from "@/components/edit-subscription-form"
import BudgetSettings from "@/components/budget-settings"
import NotificationBanner from "@/components/notification-banner"
import SavingsTips from "@/components/savings-tips"
import OnboardingTour from "@/components/onboarding-tour"
import type { Subscription, SubscriptionCategory, AppTheme } from "@/types/subscription"
import { useToast } from "@/hooks/use-toast"
import SubscriptionCardView from "@/components/subscription-card-view"
import GamificationModal from "@/components/gamification-modal"
import DashboardView from "@/components/dashboard-view"
import { storage } from "@/lib/storage" // Importar la utilidad de almacenamiento
import { useMounted } from "@/hooks/use-mounted"
import ImprovedLayout from "@/components/improved-layout"
import UnifiedNavigation from "@/components/navigation/unified-navigation"
import SmartActionMenu from "@/components/ui/smart-action-menu"
import AppHeader from "@/components/layout/app-header"
import { componentStyles } from "@/lib/design-tokens"
import { AnimatePresence } from "framer-motion"

export default function SubscriptionManager() {
  const mounted = useMounted()
  const [darkMode, setDarkMode] = useState(false)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([])
  const [showSummary, setShowSummary] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showSavingsTips, setShowSavingsTips] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [totalMonthly, setTotalMonthly] = useState(0)
  const [totalYearly, setTotalYearly] = useState(0)
  const [budget, setBudget] = useState(200)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showNotification, setShowNotification] = useState(false)
  const [upcomingPayments, setUpcomingPayments] = useState<Subscription[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<SubscriptionCategory | "all">("all")
  const [showFilters, setShowFilters] = useState(false)
  const { toast } = useToast()
  const [appTheme, setAppTheme] = useState<AppTheme>("default")
  const [userXP, setUserXP] = useState(0)
  const [userLevel, setUserLevel] = useState(1)
  const [achievementsUnlocked, setAchievementsUnlocked] = useState(0)
  const [showGamification, setShowGamification] = useState(false)

  useEffect(() => {
    const initialSubscriptions = storage.getItem("subscriptions", [])
    if (initialSubscriptions.length === 0) {
      const sampleSubscriptions: Subscription[] = [
        {
          id: "1",
          name: "Netflix",
          amount: 15.99,
          paymentDate: 5,
          logo: "/netflix-logo.svg",
          color: "#E50914",
          category: "video",
          billingCycle: "monthly",
          description: "Streaming de películas y series",
          startDate: "2023-01-05",
        },
        {
          id: "2",
          name: "Spotify",
          amount: 9.99,
          paymentDate: 15,
          logo: "/spotify-logo.svg",
          color: "#1DB954",
          category: "music",
          billingCycle: "monthly",
          description: "Servicio de música en streaming",
          startDate: "2023-02-15",
        },
        {
          id: "3",
          name: "Amazon Prime",
          amount: 14.99,
          paymentDate: 22,
          logo: "/amazon-logo.svg",
          color: "#FF9900",
          category: "entertainment",
          billingCycle: "monthly",
          description: "Envíos gratis y Prime Video",
          startDate: "2023-03-22",
        },
        {
          id: "4",
          name: "Adobe CC",
          amount: 52.99,
          paymentDate: 10,
          logo: "/placeholder.svg?height=16&width=16",
          color: "#FF0000",
          category: "productivity",
          billingCycle: "monthly",
          description: "Suite de diseño y creatividad",
          startDate: "2023-01-10",
        },
      ]
      setSubscriptions(sampleSubscriptions)
      storage.setItem("subscriptions", sampleSubscriptions)
    } else {
      setSubscriptions(initialSubscriptions)
    }

    setBudget(storage.getItem("budget", 200))
    setUserXP(storage.getItem("userXP", 0))
    setUserLevel(storage.getItem("userLevel", 1))

    const savedDarkMode = storage.getItem("darkMode", true)
    setDarkMode(savedDarkMode)
    if (savedDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    setAppTheme(storage.getItem("appTheme", "default"))
    setDarkMode(storage.getItem("darkMode", true))

    const firstVisit = storage.getItem("firstVisit", true)
    if (firstVisit) {
      setShowOnboarding(true)
      storage.setItem("firstVisit", false)
    }
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  useEffect(() => {
    let result = [...subscriptions]
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (sub) => sub.name.toLowerCase().includes(query) || sub.description?.toLowerCase().includes(query),
      )
    }
    if (activeFilter !== "all") {
      result = result.filter((sub) => sub.category === activeFilter)
    }
    setFilteredSubscriptions(result)
  }, [subscriptions, searchQuery, activeFilter])

  useEffect(() => {
    const monthly = subscriptions.reduce((sum, sub) => {
      if (sub.billingCycle === "yearly") return sum + sub.amount / 12
      if (sub.billingCycle === "quarterly") return sum + sub.amount / 3
      return sum + sub.amount
    }, 0)
    setTotalMonthly(monthly)
    setTotalYearly(monthly * 12)

    const today = new Date()
    const currentDate = today.getDate()
    const upcomingSubs = subscriptions.filter((sub) => {
      const daysUntilPayment = sub.paymentDate - currentDate
      return daysUntilPayment >= 0 && daysUntilPayment <= 5
    })
    setUpcomingPayments(upcomingSubs)
    setShowNotification(upcomingSubs.length > 0)
  }, [subscriptions])

  const addSubscription = (subscription: Subscription) => {
    const newSubscriptions = [...subscriptions, subscription]
    setSubscriptions(newSubscriptions)
    storage.setItem("subscriptions", newSubscriptions)
    setShowAddForm(false)
    toast({
      title: "Suscripción añadida",
      description: `${subscription.name} ha sido añadida.`,
    })
  }

  const editSubscription = (updatedSubscription: Subscription) => {
    const newSubscriptions = subscriptions.map((sub) => (sub.id === updatedSubscription.id ? updatedSubscription : sub))
    setSubscriptions(newSubscriptions)
    storage.setItem("subscriptions", newSubscriptions)
    setShowEditForm(false)
    setEditingSubscription(null)
    toast({
      title: "Suscripción actualizada",
      description: `${updatedSubscription.name} ha sido actualizada.`,
    })
  }

  const removeSubscription = (id: string) => {
    const subToRemove = subscriptions.find((sub) => sub.id === id)
    const newSubscriptions = subscriptions.filter((sub) => sub.id !== id)
    setSubscriptions(newSubscriptions)
    storage.setItem("subscriptions", newSubscriptions)
    toast({
      title: "Suscripción eliminada",
      description: subToRemove ? `${subToRemove.name} ha sido eliminada.` : "Suscripción eliminada.",
    })
  }

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    storage.setItem("darkMode", newDarkMode)
  }

  const cycleAppTheme = () => {
    const themes: AppTheme[] = ["default", "neon", "minimal", "gradient", "brutalist"]
    const currentIndex = themes.indexOf(appTheme)
    const nextIndex = (currentIndex + 1) % themes.length
    const newTheme = themes[nextIndex]
    setAppTheme(newTheme)
    storage.setItem("appTheme", newTheme)
    toast({
      title: "Tema cambiado",
      description: `Tema: ${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)}`,
    })
  }

  const updateBudget = (newBudget: number) => {
    setBudget(newBudget)
    storage.setItem("budget", newBudget)
    setShowSettings(false)
    toast({
      title: "Presupuesto actualizado",
      description: `Tu presupuesto mensual ahora es $${newBudget.toFixed(2)}.`,
    })
  }

  const handleEditSubscription = (subscription: Subscription) => {
    setEditingSubscription(subscription)
    setShowEditForm(true)
  }

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  const nextMonth = () => {
    setCurrentMonth((prev) => (prev === 11 ? 0 : prev + 1))
    if (currentMonth === 11) setCurrentYear((prev) => prev + 1)
  }

  const prevMonth = () => {
    setCurrentMonth((prev) => (prev === 0 ? 11 : prev - 1))
    if (currentMonth === 0) setCurrentYear((prev) => prev - 1)
  }

  const getThemeClasses = () => {
    const mode = darkMode ? 'dark' : 'light'
    
    switch (appTheme) {
      case "revival":
        return {
          cardBg: darkMode 
            ? "bg-neutral-900/95 backdrop-blur-md border border-orange-500/30 shadow-glow" 
            : "bg-white/95 backdrop-blur-md border border-red-800/30 shadow-lg",
          buttonStyle: darkMode
            ? "border-yellow-400/50 text-yellow-400 hover:bg-yellow-400 hover:text-red-900 font-semibold"
            : "border-red-800/50 text-red-800 hover:bg-red-800 hover:text-white font-semibold",
          tabsBg: darkMode ? "bg-neutral-800/50 backdrop-blur-md" : "bg-neutral-100/50 backdrop-blur-md",
          font: "font-sans tracking-wide",
          cardRadius: "rounded-2xl",
          buttonRadius: "rounded-xl",
          accent: darkMode ? "text-yellow-400" : "text-red-800",
        }
      case "venetian":
        return {
          cardBg: darkMode 
            ? "bg-teal-900/95 backdrop-blur-md border border-amber-200/30 shadow-glow"
            : "bg-amber-50/95 backdrop-blur-md border border-orange-600/30 shadow-lg",
          buttonStyle: darkMode
            ? "border-amber-200/50 text-amber-200 hover:bg-amber-200 hover:text-teal-900 font-medium"
            : "border-orange-600/50 text-orange-600 hover:bg-orange-600 hover:text-white font-medium",
          tabsBg: darkMode ? "bg-teal-800/50 backdrop-blur-md" : "bg-amber-100/50 backdrop-blur-md",
          font: "font-serif tracking-normal",
          cardRadius: "rounded-3xl",
          buttonRadius: "rounded-2xl",
          accent: darkMode ? "text-amber-200" : "text-orange-600",
        }
      case "gaming":
        return {
          cardBg: darkMode 
            ? "bg-neutral-900/98 backdrop-blur-md border border-green-400/30 shadow-[0_0_20px_rgba(0,255,136,0.15)]"
            : "bg-white/98 backdrop-blur-md border border-green-500/30 shadow-lg",
          buttonStyle: darkMode
            ? "border-green-400/50 text-green-400 hover:bg-green-400 hover:text-black font-bold tracking-wide"
            : "border-green-500/50 text-green-500 hover:bg-green-500 hover:text-white font-bold tracking-wide",
          tabsBg: darkMode ? "bg-neutral-800/50 backdrop-blur-md" : "bg-neutral-50/50 backdrop-blur-md",
          font: "font-mono tracking-wider uppercase",
          cardRadius: "rounded-xl",
          buttonRadius: "rounded-lg",
          accent: darkMode ? "text-green-400" : "text-green-500",
        }
      default:
        return {
          cardBg: darkMode 
            ? "bg-neutral-900/95 backdrop-blur-md border border-primary-400/30 shadow-glow"
            : "bg-white/95 backdrop-blur-md border border-primary-200/50 shadow-lg",
          buttonStyle: darkMode
            ? "border-primary-400/50 text-primary-400 hover:bg-primary-400 hover:text-neutral-900 font-medium"
            : "border-primary-600/50 text-primary-600 hover:bg-primary-600 hover:text-white font-medium",
          tabsBg: darkMode ? "bg-neutral-800/50 backdrop-blur-md" : "bg-primary-50/50 backdrop-blur-md",
          font: "font-sans tracking-normal",
          cardRadius: "rounded-2xl",
          buttonRadius: "rounded-xl",
          accent: darkMode ? "text-primary-400" : "text-primary-600",
        }
    }
  }

  const themeClasses = getThemeClasses()

  const handleXPEarned = (amount: number, reason: string) => {
    setUserXP((prev) => {
      const newXP = prev + amount
      storage.setItem("userXP", newXP)
      return newXP
    })
    toast({
      title: `+${amount} XP`,
      description: reason,
    })
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface-paper via-primary-50/30 to-surface-elevated dark:from-neutral-950 dark:via-primary-950/30 dark:to-neutral-900 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 rounded-3xl mx-auto flex items-center justify-center animate-pulse shadow-xl">
            <span className="text-white font-display font-bold text-3xl">S</span>
          </div>
          <div className="space-y-3">
            <h2 className={`${componentStyles.text.headline} text-2xl`}>
              Cargando Submanager
            </h2>
            <p className={componentStyles.text.description}>
              Preparando tu experiencia financiera orgánica
            </p>
            <div className="flex justify-center">
              <div className="flex space-x-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full animate-pulse"
                    style={{
                      animationDelay: `${i * 0.3}s`,
                      animationDuration: "1.2s"
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${darkMode ? "dark" : ""} ${appTheme === "brutalist" ? "theme-brutalist" : ""}`}>
      {showOnboarding && <OnboardingTour onComplete={() => setShowOnboarding(false)} darkMode={darkMode} />}
      {showNotification && (
        <NotificationBanner subscriptions={upcomingPayments} onDismiss={() => setShowNotification(false)} />
      )}
      {showGamification && (
        <GamificationModal
          isOpen={showGamification}
          onClose={() => setShowGamification(false)}
          subscriptions={subscriptions}
          budget={budget}
          totalMonthly={totalMonthly}
          userXP={userXP}
          userLevel={userLevel}
          achievementsUnlocked={achievementsUnlocked}
          onXPEarned={handleXPEarned}
          onThemeUnlock={(theme) => setAppTheme(theme as AppTheme)}
          darkMode={darkMode}
          appTheme={appTheme}
        />
      )}

      <div className="flex h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
        {/* Unified Navigation */}
        <UnifiedNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onAddSubscription={() => setShowAddForm(true)}
          onToggleDarkMode={toggleDarkMode}
          onCycleTheme={cycleAppTheme}
          onShowGamification={() => setShowGamification(true)}
          onShowSettings={() => setShowSettings(true)}
          darkMode={darkMode}
          currentTheme={appTheme}
          onThemeChange={(theme) => setAppTheme(theme as any)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Enhanced App Header */}
          <AppHeader
            activeTab={activeTab}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            darkMode={darkMode}
            onToggleDarkMode={toggleDarkMode}
            currentTheme={appTheme}
            onThemeChange={(theme) => setAppTheme(theme as any)}
            onShowGamification={() => setShowGamification(true)}
            onShowSettings={() => setShowSettings(true)}
          />

          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="min-h-full p-4 sm:p-6 lg:p-8 pb-20 sm:pb-24">
              <div className="max-w-full mx-auto">


        {/* Content Area */}
        <div className="space-y-4 lg:space-y-6">
          {activeTab === 'dashboard' && (
            <DashboardView
              totalMonthly={totalMonthly}
              totalYearly={totalYearly}
              budget={budget}
              subscriptions={subscriptions}
              filteredSubscriptions={filteredSubscriptions}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              setShowAddForm={setShowAddForm}
              setShowSummary={setShowSummary}
              themeClasses={themeClasses}
              darkMode={darkMode}
            />
          )}

          {activeTab === 'calendar' && (
            <div className="space-y-4 lg:space-y-6">
              <div className="flex items-center text-sm uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {monthNames[currentMonth]} {currentYear}
              </div>
              <div className="lg:max-w-none">
                <Calendar
                  month={currentMonth}
                  year={currentYear}
                  subscriptions={filteredSubscriptions}
                  onPrevMonth={prevMonth}
                  onNextMonth={nextMonth}
                  darkMode={darkMode}
                />
              </div>
            </div>
          )}

          {activeTab === 'cards' && (
            <SubscriptionCardView
              subscriptions={filteredSubscriptions}
              onEdit={handleEditSubscription}
              onRemove={removeSubscription}
              onAdd={() => setShowAddForm(true)}
            />
          )}

          {/* Placeholder for other tabs */}
          {activeTab === 'analytics' && (
            <div className="text-center py-12">
              <TrendingUp className="mx-auto h-12 w-12 text-neutral-400" />
              <h3 className="mt-4 text-lg font-medium">Análisis en desarrollo</h3>
              <p className="mt-2 text-neutral-500">Esta sección estará disponible pronto</p>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="text-center py-12">
              <Trophy className="mx-auto h-12 w-12 text-neutral-400" />
              <h3 className="mt-4 text-lg font-medium">Logros en desarrollo</h3>
              <p className="mt-2 text-neutral-500">Sistema de logros expandido próximamente</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="text-center py-12">
              <Settings className="mx-auto h-12 w-12 text-neutral-400" />
              <h3 className="mt-4 text-lg font-medium">Configuración en desarrollo</h3>
              <p className="mt-2 text-neutral-500">Panel de configuración avanzado próximamente</p>
            </div>
          )}
        </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Smart Action Menu - Context-aware actions */}
      <SmartActionMenu
        activeTab={activeTab}
        onAddSubscription={() => setShowAddForm(true)}
        onQuickAdd={() => setShowAddForm(true)}
        onImport={() => {
          // TODO: Implement import functionality
        }}
        onExport={() => {
          // TODO: Implement export functionality
        }}
      />

      <AnimatePresence>
        {showSummary && (
          <SubscriptionSummary
            subscriptions={filteredSubscriptions}
            total={totalMonthly}
            onClose={() => setShowSummary(false)}
            onRemove={removeSubscription}
            onEdit={handleEditSubscription}
            darkMode={darkMode}
          />
        )}
      </AnimatePresence>

      {showAddForm && (
        <AddSubscriptionForm onAdd={addSubscription} onCancel={() => setShowAddForm(false)} darkMode={darkMode} />
      )}

      {showEditForm && editingSubscription && (
        <EditSubscriptionForm
          subscription={editingSubscription}
          onUpdate={editSubscription}
          onCancel={() => {
            setShowEditForm(false)
            setEditingSubscription(null)
          }}
          darkMode={darkMode}
        />
      )}

      {showSettings && (
        <BudgetSettings
          currentBudget={budget}
          onSave={updateBudget}
          onCancel={() => setShowSettings(false)}
          darkMode={darkMode}
        />
      )}

      {showSavingsTips && (
        <SavingsTips
          subscriptions={subscriptions}
          budget={budget}
          onClose={() => setShowSavingsTips(false)}
          darkMode={darkMode}
        />
      )}
    </div>
  )
}
