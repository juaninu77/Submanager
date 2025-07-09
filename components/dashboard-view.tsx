"use client"

import { Plus, ArrowRight, Search, Filter, Sparkles, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { Subscription, SubscriptionCategory } from "@/types/subscription"
import SavingsTips from "@/components/savings-tips"
import { useState } from "react"
import SubscriptionRingChart from "./subscription-ring-chart"

interface DashboardViewProps {
  totalMonthly: number
  totalYearly: number
  budget: number
  subscriptions: Subscription[]
  filteredSubscriptions: Subscription[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  activeFilter: SubscriptionCategory | "all"
  setActiveFilter: (filter: SubscriptionCategory | "all") => void
  showFilters: boolean
  setShowFilters: (show: boolean) => void
  setShowAddForm: (show: boolean) => void
  setShowSummary: (show: boolean) => void
  themeClasses: {
    cardBg: string
    buttonStyle: string
    tabsBg: string
    font: string
    cardRadius: string
    buttonRadius: string
    accent: string
  }
  darkMode: boolean
}

export default function DashboardView({
  totalMonthly,
  totalYearly,
  budget,
  subscriptions,
  filteredSubscriptions,
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
  showFilters,
  setShowFilters,
  setShowAddForm,
  setShowSummary,
  themeClasses,
  darkMode,
}: DashboardViewProps) {
  const [showSavingsTipsLocal, setShowSavingsTipsLocal] = useState(false)

  const getCategoryLabel = (category: SubscriptionCategory): string => {
    const labels: Record<SubscriptionCategory, string> = {
      entertainment: "Entretenimiento",
      productivity: "Productividad",
      utilities: "Servicios",
      gaming: "Juegos",
      music: "Música",
      video: "Video",
      other: "Otros",
    }
    return labels[category] || "Otros"
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6 items-center">
        {/* Budget Summary */}
        <div
          className={`
        flex flex-col justify-center h-full
        ${themeClasses.font}
        ${
          themeClasses.accent === "text-red-600"
            ? "border-2 border-black p-6"
            : "bg-gradient-to-r from-transparent via-white/10 to-transparent p-6 rounded-3xl shadow-inner-soft backdrop-blur-sm"
        }
        ${themeClasses.accent === "text-fiery-light" ? "border border-fiery-light/20" : ""}
      `}
        >
          <div className="flex flex-col items-start mb-4">
            <div className={`text-4xl font-bold tracking-tight ${themeClasses.accent}`}>${totalMonthly.toFixed(1)}</div>
            <div className="text-xl font-medium text-venetian-light/70 mt-1">Presupuesto: ${budget.toFixed(1)}</div>
          </div>
          <div className={`h-0.5 ${darkMode ? "bg-venetian-light" : "bg-fence-dark"} my-4 opacity-20 rounded-full`} />
          <div className="flex justify-between items-baseline">
            <div className="text-sm uppercase tracking-wider">Restante</div>
            <div
              className={`text-xl font-medium transition-colors ${
                budget - totalMonthly < 0 ? `${themeClasses.accent} animate-pulse-subtle` : ""
              }`}
            >
              ${(budget - totalMonthly).toFixed(1)}
            </div>
          </div>
          <div
            className={`mt-4 relative h-2 ${themeClasses.accent === "text-red-600" ? "bg-gray-200" : "bg-white/10"} ${themeClasses.cardRadius} overflow-hidden`}
          >
            <div
              className={`absolute left-0 top-0 h-full transition-all duration-500 ${
                themeClasses.accent === "text-red-600"
                  ? totalMonthly > budget
                    ? "bg-red-600"
                    : "bg-gradient-to-r from-orange-600 to-red-600"
                  : totalMonthly > budget
                    ? "bg-fiery-light"
                    : "bg-pumpkin-light"
              } ${themeClasses.accent === "text-red-600" ? "" : themeClasses.cardRadius}`}
              style={{ width: `${Math.min((totalMonthly / budget) * 100, 100)}%` }}
            />
          </div>
          <div className="text-xs mt-2 text-right opacity-70">Gasto anual: ${totalYearly.toFixed(2)}</div>
        </div>
        <SubscriptionRingChart subscriptions={subscriptions} themeClasses={themeClasses} />
      </div>

      {/* Search and Filter */}
      <div>
        <div className="flex items-center">
          <div
            className={`flex items-center flex-1 px-4 py-2 ${themeClasses.cardRadius} ${
              themeClasses.accent === "text-red-600" ? "bg-white border-2 border-black" : "bg-fence-light"
            }`}
          >
            <Search className="h-4 w-4 mr-3 opacity-70" />
            <Input
              placeholder="Buscar suscripciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-none bg-transparent focus:ring-0 placeholder-current placeholder-opacity-50"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={`ml-2 ${themeClasses.buttonRadius} h-8 w-8`}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {showFilters && (
          <div
            className={`flex flex-wrap gap-2 mt-4 p-4 ${themeClasses.cardRadius} animate-scale-in ${
              themeClasses.accent === "text-red-600" ? "bg-white border-2 border-black" : "bg-fence-light"
            }`}
          >
            <Badge
              variant={activeFilter === "all" ? "default" : "outline"}
              className={`cursor-pointer ${themeClasses.buttonRadius} px-4 py-1 transition-all hover:scale-105`}
              onClick={() => setActiveFilter("all")}
            >
              Todas
            </Badge>
            {(
              [
                "entertainment",
                "productivity",
                "utilities",
                "gaming",
                "music",
                "video",
                "other",
              ] as SubscriptionCategory[]
            ).map((category) => (
              <Badge
                key={category}
                variant={activeFilter === category ? "default" : "outline"}
                className={`cursor-pointer ${themeClasses.buttonRadius} px-4 py-1 transition-all hover:scale-105`}
                onClick={() => setActiveFilter(category)}
              >
                {getCategoryLabel(category)}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div
          className={`p-4 ${themeClasses.cardRadius} ${themeClasses.accent === "text-red-600" ? "bg-gray-100 border-2 border-black" : "bg-fence-light"}`}
        >
          <h4 className="text-sm opacity-70 mb-1">Suscripciones</h4>
          <p className="text-2xl font-bold">
            {filteredSubscriptions.length}
            {filteredSubscriptions.length === 0 && (
              <span className="text-xs text-venetian-light/50 block">No hay suscripciones</span>
            )}
          </p>
        </div>
        <div
          className={`p-4 ${themeClasses.cardRadius} ${themeClasses.accent === "text-red-600" ? "bg-gray-100 border-2 border-black" : "bg-fence-light"}`}
        >
          <h4 className="text-sm opacity-70 mb-1">Más cara</h4>
          <p className="text-2xl font-bold">
            ${Math.max(...filteredSubscriptions.map((s) => s.amount), 0).toFixed(2)}
            {filteredSubscriptions.length === 0 && <span className="text-xs text-venetian-light/50 block">N/A</span>}
          </p>
        </div>
      </div>

      {/* Insights Section */}
      <div
        className={`p-6 rounded-2xl ${themeClasses.accent === "text-red-600" ? "bg-white border-2 border-black" : "bg-fence-light"}`}
      >
        <div className="flex items-center mb-4">
          <Sparkles className="h-5 w-5 mr-2 text-fiery-light" />
          <h3 className="font-bold text-lg">Insights</h3>
        </div>

        <div className="space-y-4">
          <div className={`p-4 rounded-xl ${darkMode ? "bg-fence-dark" : "bg-white/50"} backdrop-blur-sm`}>
            <p className="font-bold mb-1">Gasto mensual promedio</p>
            <p className="opacity-80 text-sm">
              Tu gasto mensual es un{" "}
              {totalMonthly > budget
                ? Math.round((totalMonthly / budget - 1) * 100)
                : Math.round((1 - totalMonthly / budget) * 100)}
              % {totalMonthly > budget ? "mayor" : "menor"} que tu presupuesto.
            </p>
          </div>

          <Button
            variant="outline"
            className={`w-full ${themeClasses.buttonRadius} transition-all hover:scale-105 ${themeClasses.buttonStyle}`}
            onClick={() => setShowSavingsTipsLocal(true)}
          >
            <Wallet className="h-4 w-4 mr-2" />
            Ver consejos de ahorro
          </Button>

          {showSavingsTipsLocal && (
            <SavingsTips
              subscriptions={subscriptions}
              budget={budget}
              onClose={() => setShowSavingsTipsLocal(false)}
              darkMode={darkMode}
            />
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          className={`${themeClasses.buttonRadius} px-6 transition-all hover:scale-105 ${themeClasses.buttonStyle}`}
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Añadir
        </Button>
        <Button
          variant="outline"
          className={`${themeClasses.buttonRadius} px-6 transition-all hover:scale-105 ${themeClasses.buttonStyle}`}
          onClick={() => setShowSummary(true)}
        >
          Resumen
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {totalMonthly > budget && (
        <div
          className={`${
            themeClasses.accent === "text-red-600"
              ? "bg-red-600 border-t-2 border-black"
              : "bg-gradient-to-r from-fiery-dark to-fiery-light"
          } p-6 text-white ${themeClasses.font} flex items-center justify-between rounded-b-3xl`}
        >
          <div className="flex items-center">
            <div
              className={`w-8 h-8 ${
                themeClasses.accent === "text-red-600" ? "border-2" : "rounded-full border-2"
              } border-white flex items-center justify-center mr-3 animate-pulse-subtle`}
            >
              !
            </div>
            <span className="text-lg tracking-wide">PRESUPUESTO EXCEDIDO</span>
          </div>
          <ArrowRight className="h-6 w-6" />
        </div>
      )}
    </div>
  )
}
