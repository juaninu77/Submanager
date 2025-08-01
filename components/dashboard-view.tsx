"use client"

import React, { useState } from "react"
import { Plus, ArrowRight, Search, Filter, Sparkles, Wallet, TrendingUp, TrendingDown, Calendar, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { Subscription, SubscriptionCategory } from "@/types/subscription"
import SavingsTips from "@/components/savings-tips"
import { EmptySubscriptions, EmptySearchResults } from "@/components/ui/empty-state"
import EnhancedChartsWidget from "@/components/enhanced-charts-widget"
import { motion, AnimatePresence } from "framer-motion"
import { GlassmorphismCard } from "@/components/ui/glassmorphism-card"
import { MagneticButton } from "@/components/ui/micro-interactions"

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

  // Show empty state when no subscriptions at all
  if (subscriptions.length === 0) {
    return <EmptySubscriptions onAddSubscription={() => setShowAddForm(true)} />
  }

  // Show search empty state when search has no results
  if (filteredSubscriptions.length === 0 && (searchQuery || activeFilter !== "all")) {
    return (
      <div className="space-y-6">
        <EmptySearchResults onClearSearch={() => {
          setSearchQuery("")
          setActiveFilter("all")
        }} />
      </div>
    )
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Row 1: Enhanced Circular Chart as Main Feature */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <EnhancedChartsWidget 
          subscriptions={subscriptions}
          className="w-full"
        />
      </motion.div>

      {/* Row 2: Budget Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Budget Status Card */}
          <GlassmorphismCard variant="premium" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className={`p-2 rounded-xl mr-3 ${
                  totalMonthly > budget
                    ? 'bg-red-50 dark:bg-red-900/20'
                    : totalMonthly > budget * 0.8
                    ? 'bg-yellow-50 dark:bg-yellow-900/20'
                    : 'bg-green-50 dark:bg-green-900/20'
                }`}>
                  {totalMonthly > budget ? (
                    <TrendingUp className="h-5 w-5 text-red-600 dark:text-red-400" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-green-600 dark:text-green-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    Estado del Presupuesto
                  </h3>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Gasto actual</span>
                <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  ${totalMonthly.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Presupuesto</span>
                <span className="text-lg font-semibold text-neutral-700 dark:text-neutral-300">
                  ${budget.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-neutral-200 dark:border-neutral-700">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {budget - totalMonthly >= 0 ? 'Disponible' : 'Excedido'}
                </span>
                <span className={`text-xl font-bold ${
                  budget - totalMonthly < 0 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  ${Math.abs(budget - totalMonthly).toFixed(0)}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="relative h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((totalMonthly / budget) * 100, 100)}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      totalMonthly > budget
                        ? "bg-gradient-to-r from-red-500 to-red-600"
                        : totalMonthly > budget * 0.8
                        ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                        : "bg-gradient-to-r from-green-500 to-green-600"
                    }`}
                  />
                </div>
                <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  <span>0%</span>
                  <span className="font-medium">
                    {Math.min((totalMonthly / budget) * 100, 100).toFixed(0)}%
                  </span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </GlassmorphismCard>

          {/* Statistics Card */}
          <GlassmorphismCard variant="interactive" className="p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl mr-3">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                Estadísticas
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Total de servicios</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {filteredSubscriptions.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Promedio por servicio</span>
                <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  ${(totalMonthly / (filteredSubscriptions.length || 1)).toFixed(0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Total anual proyectado</span>
                <span className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                  ${totalYearly.toFixed(0)}
                </span>
              </div>
            </div>
          </GlassmorphismCard>

          {/* Quick Actions Card */}
          <GlassmorphismCard variant="interactive" className="p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl mr-3">
                <Plus className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                Acciones Rápidas
              </h3>
            </div>
            
            <div className="space-y-3">
              <MagneticButton
                onClick={() => setShowAddForm(true)}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center group"
              >
                <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Añadir Suscripción
              </MagneticButton>
              
              <Button
                onClick={() => setShowSummary(true)}
                variant="outline"
                className="w-full border-2 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 py-3"
              >
                Ver Resumen Completo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </GlassmorphismCard>
        </div>
      </motion.div>

      {/* Row 3: Upcoming Payments & Additional Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upcoming Payments Widget */}
          <GlassmorphismCard variant="interactive" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl mr-3">
                  <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100">
                  Próximos Pagos
                </h3>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                  ${(() => {
                    const today = new Date();
                    const currentDate = today.getDate();
                    const upcomingPayments = filteredSubscriptions.filter((sub) => {
                      const daysUntilPayment = sub.paymentDate - currentDate;
                      return daysUntilPayment >= 0 && daysUntilPayment <= 7;
                    });
                    return upcomingPayments.reduce((sum, sub) => sum + sub.amount, 0).toFixed(2);
                  })()}
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  esta semana
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              {(() => {
                const today = new Date();
                const currentDate = today.getDate();
                const upcomingPayments = filteredSubscriptions
                  .filter((sub) => {
                    const daysUntilPayment = sub.paymentDate - currentDate;
                    return daysUntilPayment >= 0 && daysUntilPayment <= 7;
                  })
                  .sort((a, b) => a.paymentDate - b.paymentDate)
                  .slice(0, 4);

                if (upcomingPayments.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <div className="text-neutral-400 dark:text-neutral-500 mb-4">
                        <Calendar className="h-12 w-12 mx-auto mb-3 opacity-40" />
                      </div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                        ¡Perfecto! No hay pagos esta semana
                      </p>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500">
                        Disfruta tu dinero libre de compromisos
                      </p>
                    </div>
                  );
                }

                return upcomingPayments.map((sub) => {
                  const daysLeft = sub.paymentDate - currentDate;
                  const isToday = daysLeft === 0;
                  const isTomorrow = daysLeft === 1;
                  
                  return (
                    <div 
                      key={sub.id} 
                      className={`flex items-center justify-between p-4 rounded-xl ${
                        isToday 
                          ? 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 border border-red-200 dark:border-red-700 shadow-sm' 
                          : isTomorrow
                          ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/10 border border-yellow-200 dark:border-yellow-700'
                          : 'bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                      } transition-all duration-200 hover:scale-[1.02]`}
                    >
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-3" 
                          style={{ backgroundColor: sub.color }}
                        />
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-neutral-100">
                            {sub.name}
                          </p>
                          <p className={`text-sm ${
                            isToday ? 'text-red-600 dark:text-red-400' : 'text-neutral-500 dark:text-neutral-400'
                          }`}>
                            {isToday ? 'Hoy' : isTomorrow ? 'Mañana' : `En ${daysLeft} días`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                          ${sub.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </GlassmorphismCard>

          {/* Additional Tools Card */}
          <GlassmorphismCard variant="interactive" className="p-6">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl mr-3">
                <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100">
                Herramientas
              </h3>
            </div>
            
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() => setShowSavingsTipsLocal(true)}
                className="w-full hover:bg-orange-50 dark:hover:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 py-3"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Consejos de Ahorro
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowSummary(true)}
                className="w-full hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 py-3"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Análisis Detallado
              </Button>
              
              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700">
                <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                  Salud Financiera
                </div>
                <div className="flex items-center justify-between">
                  <span className={`font-semibold ${
                    totalMonthly > budget
                      ? 'text-red-600 dark:text-red-400'
                      : totalMonthly > budget * 0.8
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    {totalMonthly > budget ? 'Crítica' : totalMonthly > budget * 0.8 ? 'Precaución' : 'Excelente'}
                  </span>
                  <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {Math.round((totalMonthly / budget) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </GlassmorphismCard>
        </div>
      </motion.div>

      {/* Row 4: Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <GlassmorphismCard variant="interactive" className="p-6">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Buscar suscripciones..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 border-neutral-200 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors duration-200 ${
                  showFilters ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800' : ''
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros {activeFilter !== 'all' && <span className="ml-1 text-xs">•</span>}
              </Button>
            </div>
            
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4"
                >
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={activeFilter === "all" ? "default" : "secondary"}
                      className="cursor-pointer hover:scale-105 transition-transform duration-200"
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
                        variant={activeFilter === category ? "default" : "secondary"}
                        className="cursor-pointer hover:scale-105 transition-transform duration-200"
                        onClick={() => setActiveFilter(category)}
                      >
                        {getCategoryLabel(category)}
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Results Summary */}
            <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400">
              <span>
                Mostrando {filteredSubscriptions.length} de {subscriptions.length} suscripciones
              </span>
              {(searchQuery || activeFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setActiveFilter('all')
                  }}
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        </GlassmorphismCard>
      </motion.div>

      {showSavingsTipsLocal && (
        <SavingsTips
          subscriptions={subscriptions}
          budget={budget}
          onClose={() => setShowSavingsTipsLocal(false)}
          darkMode={darkMode}
        />
      )}

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