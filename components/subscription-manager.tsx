"use client"

import { useState, useEffect } from "react"
import { Moon, Sun, CalendarIcon, Settings, PaletteIcon, Trophy, User } from "lucide-react"
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

export default function SubscriptionManager() {
  const [darkMode, setDarkMode] = useState(true)
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

    const firstVisit = storage.getItem("firstVisit", true)
    if (firstVisit) {
      setShowOnboarding(true)
      storage.setItem("firstVisit", false)
    }
  }, [])

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
    if (newDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
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
    switch (appTheme) {
      case "neon":
        return {
          cardBg: "bg-fence-dark/90 backdrop-blur-md border border-fiery-light/30 shadow-glow",
          buttonStyle: "border-fiery-light/50 text-fiery-light hover:bg-fiery-light hover:text-fence-dark",
          tabsBg: "bg-fence-light/50 backdrop-blur-md",
          font: "font-mono tracking-wide",
          cardRadius: "rounded-3xl",
          buttonRadius: "rounded-2xl",
          accent: "text-fiery-light",
        }
      case "minimal":
        return {
          cardBg: "bg-fence-dark border-0 shadow-none",
          buttonStyle: "border-venetian-light/20 text-venetian-light/80 hover:bg-venetian-light/10",
          tabsBg: "bg-fence-light/30",
          font: "font-sans tracking-normal",
          cardRadius: "rounded-xl",
          buttonRadius: "rounded-xl",
          accent: "text-venetian-light",
        }
      case "gradient":
        return {
          cardBg: "bg-gradient-to-br from-fence-dark via-fence-light/10 to-fence-dark/80 backdrop-blur-md border-0",
          buttonStyle: "border-0 bg-gradient-to-r from-fiery-light to-pumpkin-light text-white hover:opacity-90",
          tabsBg: "bg-gradient-to-r from-fence-light/40 to-fence-light/20",
          font: "font-sans tracking-wide",
          cardRadius: "rounded-2xl",
          buttonRadius: "rounded-xl",
          accent: "text-pumpkin-light",
        }
      case "brutalist":
        return {
          cardBg: "bg-white border-2 border-black",
          buttonStyle:
            "border-2 border-black text-black hover:bg-black hover:text-white font-bold uppercase tracking-wider",
          tabsBg: "bg-white border-2 border-black",
          font: "font-mono uppercase tracking-wider",
          cardRadius: "rounded-none",
          buttonRadius: "rounded-none",
          accent: "text-red-600",
        }
      default:
        return {
          cardBg: "bg-fence-dark",
          buttonStyle: "border-venetian-light/30 text-venetian-light hover:bg-venetian-light hover:text-fence-dark",
          tabsBg: "bg-fence-light",
          font: "font-mono",
          cardRadius: "rounded-2xl",
          buttonRadius: "rounded-xl",
          accent: "text-fiery-light",
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

  return (
    <div
      className={`w-full max-w-md mx-auto ${darkMode ? "dark" : ""} ${appTheme === "brutalist" ? "theme-brutalist" : ""}`}
    >
      {showOnboarding && <OnboardingTour onComplete={() => setShowOnboarding(false)} />}
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

      <Card
        className={`overflow-hidden ${themeClasses.cardRadius} transition-all duration-300 animate-fade-in ${themeClasses.cardBg}`}
      >
        <div
          className={`${darkMode ? "text-venetian-light" : "text-fence-dark"} p-6 ${themeClasses.font} transition-colors duration-300 relative`}
        >
          <div className="flex justify-between items-center mb-6">
            <h1 className={`text-2xl uppercase tracking-wide font-bold ${themeClasses.font}`}>Suscripciones</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={`${themeClasses.buttonRadius} h-9 w-9`}>
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowGamification(true)}>
                  <Trophy className="mr-2 h-4 w-4" />
                  <span>Gamificación</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowSettings(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Presupuesto</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={cycleAppTheme}>
                  <PaletteIcon className="mr-2 h-4 w-4" />
                  <span>Cambiar Tema</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleDarkMode}>
                  {darkMode ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  <span>{darkMode ? "Modo Claro" : "Modo Oscuro"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className={`grid w-full grid-cols-3 p-1 ${themeClasses.cardRadius} ${themeClasses.tabsBg}`}>
              <TabsTrigger value="dashboard" className={`${themeClasses.buttonRadius} data-[state=active]:shadow-glow`}>
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="calendar" className={`${themeClasses.buttonRadius} data-[state=active]:shadow-glow`}>
                Calendario
              </TabsTrigger>
              <TabsTrigger value="cards" className={`${themeClasses.buttonRadius} data-[state=active]:shadow-glow`}>
                Tarjetas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-6">
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
            </TabsContent>

            <TabsContent value="calendar" className="mt-6">
              <div className="mb-3 text-sm uppercase tracking-wider flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2 text-fiery-light" />
                {monthNames[currentMonth]} {currentYear}
              </div>
              <Calendar
                month={currentMonth}
                year={currentYear}
                subscriptions={filteredSubscriptions}
                onPrevMonth={prevMonth}
                onNextMonth={nextMonth}
                darkMode={darkMode}
              />
            </TabsContent>

            <TabsContent value="cards" className="mt-6">
              <SubscriptionCardView
                subscriptions={filteredSubscriptions}
                onEdit={handleEditSubscription}
                onRemove={removeSubscription}
              />
            </TabsContent>
          </Tabs>
        </div>
      </Card>

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
