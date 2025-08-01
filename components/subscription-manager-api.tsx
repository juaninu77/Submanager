"use client"

import { useState, useEffect } from "react"
import { Moon, Sun, CalendarIcon, Settings, PaletteIcon, Trophy, User, TrendingUp, LogOut } from "lucide-react"
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
import { useMounted } from "@/hooks/use-mounted"
import ImprovedLayout from "@/components/improved-layout"
import UnifiedNavigation from "@/components/navigation/unified-navigation"
import SmartActionMenu from "@/components/ui/smart-action-menu"
import AppHeader from "@/components/layout/app-header"
import { componentStyles } from "@/lib/design-tokens"
import { AnimatePresence } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { useSubscriptionsApi } from "@/hooks/use-subscriptions-api"
import { storage } from "@/lib/storage"

export default function SubscriptionManagerApi() {
  const mounted = useMounted()
  const { user, logout } = useAuth()
  const { 
    subscriptions, 
    loading: subscriptionsLoading, 
    addSubscription: apiAddSubscription,
    updateSubscription: apiUpdateSubscription,
    deleteSubscription: apiDeleteSubscription
  } = useSubscriptionsApi()
  
  const [darkMode, setDarkMode] = useState(false)
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

  // Cargar configuraciones del usuario desde localStorage
  useEffect(() => {
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

  // Filtrar suscripciones
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

  // Calcular totales y notificaciones
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

  const addSubscription = async (subscription: Subscription) => {
    try {
      await apiAddSubscription(subscription)
      setShowAddForm(false)
    } catch (error) {
      // Error ya manejado en el hook
    }
  }

  const editSubscription = async (updatedSubscription: Subscription) => {
    try {
      await apiUpdateSubscription(updatedSubscription.id, updatedSubscription)
      setShowEditForm(false)
      setEditingSubscription(null)
    } catch (error) {
      // Error ya manejado en el hook
    }
  }

  const removeSubscription = async (id: string) => {
    try {
      await apiDeleteSubscription(id)
    } catch (error) {
      // Error ya manejado en el hook
    }
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

  const handleLogout = async () => {
    await logout()
  }

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
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

  if (!mounted || subscriptionsLoading) {
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
              {subscriptionsLoading ? "Cargando tus suscripciones..." : "Preparando tu experiencia financiera orgánica"}
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
          <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  Hola, {user?.name || user?.email}
                </h1>
              </div>
              
              <div className="flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="rounded-full">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowSettings(true)}>
                      <Settings className="mr-2 h-4 w-4" />
                      Configuración
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

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