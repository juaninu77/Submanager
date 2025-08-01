"use client"

import { useState, useMemo } from "react"
import type { Subscription } from "@/types/subscription"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Calendar, TrendingUp, DollarSign, PieChart, BarChart3, Activity, Grid3x3 } from "lucide-react"

interface EnhancedChartsWidgetProps {
  subscriptions: Subscription[]
  className?: string
}

type TimePeriod = "monthly" | "quarterly" | "yearly"
type ChartType = "donut" | "pie" | "bar" | "treemap"

const periodLabels: Record<TimePeriod, string> = {
  monthly: "Mensual",
  quarterly: "Trimestral", 
  yearly: "Anual"
}

const periodIcons: Record<TimePeriod, React.ComponentType<{ className?: string }>> = {
  monthly: Calendar,
  quarterly: TrendingUp,
  yearly: DollarSign
}

const chartTypes = [
  { id: "donut" as ChartType, name: "Dona", icon: PieChart, description: "Gráfico circular con iconos" },
  { id: "pie" as ChartType, name: "Torta", icon: PieChart, description: "Gráfico de sectores clásico" },
  { id: "bar" as ChartType, name: "Barras", icon: BarChart3, description: "Comparación horizontal" },
  { id: "treemap" as ChartType, name: "Mosaico", icon: Grid3x3, description: "Cuadros proporcionales" }
]

const getAmountForPeriod = (sub: Subscription, period: TimePeriod): number => {
  switch (period) {
    case "monthly":
      if (sub.billingCycle === "yearly") return sub.amount / 12
      if (sub.billingCycle === "quarterly") return sub.amount / 3
      return sub.amount
    case "quarterly":
      if (sub.billingCycle === "yearly") return sub.amount / 4
      if (sub.billingCycle === "monthly") return sub.amount * 3
      return sub.amount
    case "yearly":
      if (sub.billingCycle === "monthly") return sub.amount * 12
      if (sub.billingCycle === "quarterly") return sub.amount * 4
      return sub.amount
    default:
      return 0
  }
}

const EnhancedChartsWidget = ({ subscriptions, className }: EnhancedChartsWidgetProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("monthly")
  const [chartType, setChartType] = useState<ChartType>("donut")
  const [hoveredSubscription, setHoveredSubscription] = useState<string | null>(null)

  const { chartData, totalForPeriod } = useMemo(() => {
    if (subscriptions.length === 0) return { chartData: [], totalForPeriod: 0 }

    const total = subscriptions.reduce((acc, sub) => acc + getAmountForPeriod(sub, selectedPeriod), 0)
    if (total === 0) return { chartData: [], totalForPeriod: 0 }

    let cumulativeAngle = 0 // Start from 0 degrees (right side)
    const data = subscriptions
      .filter((sub) => sub.amount > 0)
      .map((sub) => ({
        ...sub,
        periodAmount: getAmountForPeriod(sub, selectedPeriod),
      }))
      .sort((a, b) => b.periodAmount - a.periodAmount)
      .map((sub) => {
        const percentage = (sub.periodAmount / total) * 100
        const angle = (percentage / 100) * 360
        const startAngle = cumulativeAngle
        const endAngle = cumulativeAngle + angle
        cumulativeAngle = endAngle
        return { ...sub, percentage, startAngle, endAngle, angle }
      })

    return { chartData: data, totalForPeriod: total }
  }, [subscriptions, selectedPeriod])

  // Fixed polar coordinates function - no double rotation
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    }
  }

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle)
    const end = polarToCartesian(x, y, radius, startAngle)
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"
    return ["M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(" ")
  }

  const size = 400
  const radius = 160 
  const strokeWidth = 50

  // Donut Chart Component
  const DonutChart = () => (
    <div className="relative flex-shrink-0">
      <motion.div
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.1 }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90" // Only rotate the SVG, not the coordinates
        >
          <defs>
            {chartData.map((sub) => (
              <linearGradient key={`gradient-${sub.id}`} id={`gradient-${sub.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={sub.color} stopOpacity={0.9} />
                <stop offset="100%" stopColor={sub.color} stopOpacity={0.7} />
              </linearGradient>
            ))}
            <filter id="drop-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="black" floodOpacity="0.1"/>
            </filter>
          </defs>

          <g transform={`translate(${size / 2}, ${size / 2})`}>
            <circle cx="0" cy="0" r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} opacity={0.1} />
            
            <AnimatePresence>
              {chartData.map((sub, index) => (
                <motion.path
                  key={sub.id}
                  d={describeArc(0, 0, radius, sub.startAngle, sub.endAngle)}
                  fill="none"
                  stroke={`url(#gradient-${sub.id})`}
                  strokeWidth={hoveredSubscription === sub.id ? strokeWidth + 10 : strokeWidth}
                  strokeLinecap="round"
                  filter="url(#drop-shadow)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ 
                    pathLength: 1, 
                    opacity: hoveredSubscription === sub.id ? 1 : hoveredSubscription === null ? 0.9 : 0.5
                  }}
                  transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                  className="cursor-pointer transition-all duration-300"
                  onMouseEnter={() => setHoveredSubscription(sub.id)}
                  onMouseLeave={() => setHoveredSubscription(null)}
                />
              ))}
            </AnimatePresence>
          </g>
        </svg>

        {/* Fixed icon positioning - compensate for SVG rotation */}
        <div className="absolute inset-0 pointer-events-none">
          {chartData.map((sub, index) => {
            if (sub.angle < 15) return null
            
            const midAngle = sub.startAngle + sub.angle / 2 - 90 // Compensate for SVG rotation
            const iconRadius = radius - strokeWidth / 2
            const iconCenter = polarToCartesian(size / 2, size / 2, iconRadius, midAngle)

            return (
              <motion.div
                key={`icon-${sub.id}`}
                className="absolute flex items-center justify-center"
                style={{
                  left: iconCenter.x,
                  top: iconCenter.y,
                  transform: "translate(-50%, -50%)",
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: hoveredSubscription === sub.id ? 1.3 : 1, 
                  opacity: 1 
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.8 + index * 0.15 }}
              >
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all duration-300",
                  "bg-white dark:bg-neutral-900 backdrop-blur-sm border-2",
                  hoveredSubscription === sub.id ? "shadow-2xl scale-125 border-4" : "shadow-lg"
                )}
                style={{
                  borderColor: sub.color,
                  boxShadow: hoveredSubscription === sub.id 
                    ? `0 0 25px ${sub.color}60, 0 8px 32px rgba(0,0,0,0.3)` 
                    : `0 0 10px ${sub.color}30, 0 4px 16px rgba(0,0,0,0.2)`
                }}>
                  <Image
                    src={sub.logo || "/placeholder.svg"}
                    alt={sub.name}
                    width={24}
                    height={24}
                    className="object-contain rounded"
                    style={{ width: 'auto', height: 'auto', maxWidth: '24px', maxHeight: '24px' }}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <motion.div
            key={selectedPeriod}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="text-sm text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-medium">
              Total {selectedPeriod === "monthly" ? "Mensual" : selectedPeriod === "quarterly" ? "Trimestral" : "Anual"}
            </div>
            <div className="text-5xl font-bold bg-gradient-to-br from-neutral-900 to-neutral-600 dark:from-neutral-100 dark:to-neutral-400 bg-clip-text text-transparent">
              ${totalForPeriod.toFixed(0)}
            </div>
            <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {subscriptions.length} suscripciones
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )

  // Pie Chart Component
  const PieChart = () => (
    <div className="relative flex-shrink-0">
      <motion.div
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.1 }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            {chartData.map((sub) => (
              <linearGradient key={`pie-gradient-${sub.id}`} id={`pie-gradient-${sub.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={sub.color} stopOpacity={0.9} />
                <stop offset="100%" stopColor={sub.color} stopOpacity={0.7} />
              </linearGradient>
            ))}
          </defs>

          <g transform={`translate(${size / 2}, ${size / 2})`}>
            <AnimatePresence>
              {chartData.map((sub, index) => {
                const startAngle = sub.startAngle
                const endAngle = sub.endAngle
                const startAngleRad = (startAngle * Math.PI) / 180
                const endAngleRad = (endAngle * Math.PI) / 180
                const pieRadius = 180

                const x1 = pieRadius * Math.cos(startAngleRad)
                const y1 = pieRadius * Math.sin(startAngleRad)
                const x2 = pieRadius * Math.cos(endAngleRad)
                const y2 = pieRadius * Math.sin(endAngleRad)

                const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0

                const pathData = [
                  'M', 0, 0,
                  'L', x1, y1,
                  'A', pieRadius, pieRadius, 0, largeArcFlag, 1, x2, y2,
                  'Z'
                ].join(' ')

                return (
                  <motion.path
                    key={sub.id}
                    d={pathData}
                    fill={`url(#pie-gradient-${sub.id})`}
                    stroke="white"
                    strokeWidth="2"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: hoveredSubscription === sub.id ? 1.1 : 1,
                      opacity: hoveredSubscription === sub.id ? 1 : 0.9 
                    }}
                    transition={{ duration: 0.5, delay: index * 0.1, type: "spring" }}
                    className="cursor-pointer transition-all duration-300"
                    onMouseEnter={() => setHoveredSubscription(sub.id)}
                    onMouseLeave={() => setHoveredSubscription(null)}
                    style={{
                      filter: hoveredSubscription === sub.id 
                        ? `drop-shadow(0 8px 16px ${sub.color}40)` 
                        : "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
                      transformOrigin: "center"
                    }}
                  />
                )
              })}
            </AnimatePresence>
          </g>
        </svg>

        {/* Labels for pie chart */}
        <div className="absolute inset-0 pointer-events-none">
          {chartData.map((sub) => {
            if (sub.percentage < 5) return null
            
            const midAngle = sub.startAngle + sub.angle / 2
            const labelRadius = 120
            const labelCenter = polarToCartesian(size / 2, size / 2, labelRadius, midAngle)

            return (
              <motion.div
                key={`pie-label-${sub.id}`}
                className="absolute text-white font-bold text-sm"
                style={{
                  left: labelCenter.x,
                  top: labelCenter.y,
                  transform: "translate(-50%, -50%)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 + chartData.indexOf(sub) * 0.1 }}
              >
                {sub.percentage.toFixed(0)}%
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )

  // Bar Chart Component
  const BarChart = () => (
    <div className="space-y-4">
      <div className="max-h-96 overflow-y-auto space-y-3">
        {chartData.map((sub, index) => {
          const maxAmount = Math.max(...chartData.map(d => d.periodAmount))
          const widthPercentage = (sub.periodAmount / maxAmount) * 100
          
          return (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 cursor-pointer",
                hoveredSubscription === sub.id 
                  ? "bg-neutral-100 dark:bg-neutral-800 scale-[1.02]" 
                  : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
              )}
              onMouseEnter={() => setHoveredSubscription(sub.id)}
              onMouseLeave={() => setHoveredSubscription(null)}
            >
              <div className="flex items-center space-x-3 w-32 flex-shrink-0">
                <Image
                  src={sub.logo || "/placeholder.svg"}
                  alt={sub.name}
                  width={24}
                  height={24}
                  className="object-contain rounded"
                  style={{ width: 'auto', height: 'auto', maxWidth: '24px', maxHeight: '24px' }}
                />
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate">
                  {sub.name}
                </span>
              </div>
              
              <div className="flex-1 relative h-8 bg-neutral-100 dark:bg-neutral-700 rounded-lg overflow-hidden">
                <motion.div
                  className="h-full rounded-lg flex items-center justify-end pr-3"
                  style={{ backgroundColor: sub.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPercentage}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                >
                  <span className="text-sm font-bold text-white">
                    ${sub.periodAmount.toFixed(2)}
                  </span>
                </motion.div>
              </div>
              
              <div className="w-16 text-right text-sm text-neutral-500 dark:text-neutral-400">
                {sub.percentage.toFixed(1)}%
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )

  // Treemap Component
  const TreemapChart = () => {
    const treemapData = useMemo(() => {
      const totalArea = 350 * 250 // Available area
      return chartData.map(sub => ({
        ...sub,
        area: (sub.percentage / 100) * totalArea,
        width: Math.sqrt((sub.percentage / 100) * totalArea * 1.6), // Golden ratio approximation
        height: Math.sqrt((sub.percentage / 100) * totalArea / 1.6)
      }))
    }, [chartData])

    return (
      <div className="relative w-full h-64 bg-neutral-50 dark:bg-neutral-800 rounded-xl overflow-hidden">
        <motion.div 
          className="flex flex-wrap p-2 gap-1 h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {treemapData.map((sub, index) => (
            <motion.div
              key={sub.id}
              className={cn(
                "relative rounded-lg flex flex-col items-center justify-center text-white font-semibold text-xs overflow-hidden cursor-pointer transition-all duration-300",
                hoveredSubscription === sub.id ? "scale-105 z-10" : ""
              )}
              style={{
                backgroundColor: sub.color,
                width: Math.max(sub.width, 60),
                height: Math.max(sub.height, 40),
                minWidth: "60px",
                minHeight: "40px"
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1, type: "spring" }}
              onMouseEnter={() => setHoveredSubscription(sub.id)}
              onMouseLeave={() => setHoveredSubscription(null)}
            >
              <Image
                src={sub.logo || "/placeholder.svg"}
                alt={sub.name}
                width={20}
                height={20}
                className="object-contain rounded mb-1"
                style={{ width: 'auto', height: 'auto', maxWidth: '20px', maxHeight: '20px' }}
              />
              <div className="text-center px-1">
                <div className="text-xs font-bold">${sub.periodAmount.toFixed(0)}</div>
                <div className="text-xs opacity-90 truncate">{sub.name}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    )
  }

  const renderChart = () => {
    switch (chartType) {
      case "donut": return <DonutChart />
      case "pie": return <PieChart />
      case "bar": return <BarChart />
      case "treemap": return <TreemapChart />
      default: return <DonutChart />
    }
  }

  if (subscriptions.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 rounded-3xl border border-neutral-200 dark:border-neutral-700", className)}>
        <div className="p-12 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-neutral-300 to-neutral-400 dark:from-neutral-600 dark:to-neutral-700 rounded-full flex items-center justify-center">
            <DollarSign className="w-12 h-12 text-neutral-500 dark:text-neutral-400" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            Sin suscripciones
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400">
            Añade tu primera suscripción para ver el análisis visual
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-800 rounded-3xl border border-neutral-200 dark:border-neutral-700 overflow-hidden", className)}>
      {/* Header with Controls */}
      <div className="p-6 pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Análisis de Gastos
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              {chartTypes.find(c => c.id === chartType)?.description}
            </p>
          </div>

          {/* Chart Type Selector */}
          <div className="flex gap-2">
            {chartTypes.map(type => {
              const Icon = type.icon
              return (
                <motion.button
                  key={type.id}
                  onClick={() => setChartType(type.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300",
                    chartType === type.id
                      ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm"
                      : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{type.name}</span>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Period Toggle */}
        <div className="flex justify-center">
          <div className="inline-flex bg-neutral-100 dark:bg-neutral-800 rounded-2xl p-1 gap-1">
            {(["monthly", "quarterly", "yearly"] as TimePeriod[]).map((period) => {
              const Icon = periodIcons[period]
              const isSelected = selectedPeriod === period
              
              return (
                <motion.button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300",
                    isSelected 
                      ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-lg shadow-black/5" 
                      : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-white/50 dark:hover:bg-neutral-700/50"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{periodLabels[period]}</span>
                  {isSelected && (
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10"
                      layoutId="period-background"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Chart Content */}
      <div className="p-8">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Chart */}
          <div className="flex-shrink-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={chartType}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                {renderChart()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Legend/Details - Only show for donut and pie charts */}
          {(chartType === "donut" || chartType === "pie") && (
            <div className="flex-1 min-w-0">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
                  Desglose Detallado
                </h3>
                
                <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                  <AnimatePresence>
                    {chartData.map((sub, index) => (
                      <motion.div
                        key={sub.id}
                        initial={{ x: 40, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-2xl transition-all duration-300 cursor-pointer group",
                          "bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-700/50",
                          hoveredSubscription === sub.id 
                            ? "bg-white dark:bg-neutral-800 shadow-lg scale-[1.02] border-neutral-300 dark:border-neutral-600" 
                            : "hover:bg-white/80 dark:hover:bg-neutral-800/80"
                        )}
                        onMouseEnter={() => setHoveredSubscription(sub.id)}
                        onMouseLeave={() => setHoveredSubscription(null)}
                      >
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-5 h-5 rounded-full shadow-sm transition-all duration-300"
                            style={{ 
                              backgroundColor: sub.color,
                              boxShadow: hoveredSubscription === sub.id ? `0 0 20px ${sub.color}60` : undefined
                            }}
                          />
                          
                          <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center overflow-hidden">
                            <Image
                              src={sub.logo || "/placeholder.svg"}
                              alt={sub.name}
                              width={24}
                              height={24}
                              className="object-contain"
                              style={{ width: 'auto', height: 'auto', maxWidth: '24px', maxHeight: '24px' }}
                            />
                          </div>
                          
                          <div>
                            <div className="font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors">
                              {sub.name}
                            </div>
                            <div className="text-sm text-neutral-500 dark:text-neutral-400">
                              {sub.percentage.toFixed(1)}% del total • {sub.billingCycle}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                            ${sub.periodAmount.toFixed(2)}
                          </div>
                          <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            {selectedPeriod === "monthly" ? "por mes" : selectedPeriod === "quarterly" ? "por trimestre" : "por año"}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EnhancedChartsWidget