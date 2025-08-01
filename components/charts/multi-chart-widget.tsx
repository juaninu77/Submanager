'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PieChart, 
  BarChart3, 
  TrendingUp, 
  Calendar,
  DollarSign,
  Percent,
  Filter,
  RotateCcw,
  ChevronDown,
  Eye,
  EyeOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { cn } from '@/lib/utils'
import type { Subscription, SubscriptionCategory } from '@/types/subscription'
import { componentStyles } from '@/lib/design-tokens'

// Chart utilities

interface MultiChartWidgetProps {
  subscriptions: Subscription[]
  totalMonthly: number
  budget: number
  className?: string
}

type ChartType = 'circle' | 'bar' | 'timeline' | 'comparison'
type FilterBy = 'category' | 'amount' | 'percentage' | 'date'
type SortBy = 'amount-desc' | 'amount-asc' | 'name' | 'date'

const chartTypes = [
  {
    id: 'circle' as ChartType,
    name: 'Circular',
    description: 'Vista de suscripciones individuales',
    icon: PieChart,
    bestFor: 'Visualizar proporciones'
  },
  {
    id: 'bar' as ChartType,
    name: 'Barras',
    description: 'Comparación por montos',
    icon: BarChart3,
    bestFor: 'Comparar valores exactos'
  },
  {
    id: 'timeline' as ChartType,
    name: 'Cronología',
    description: 'Vista temporal de pagos',
    icon: Calendar,
    bestFor: 'Ver patrones temporales'
  },
  {
    id: 'comparison' as ChartType,
    name: 'Comparativo',
    description: 'Análisis detallado',
    icon: TrendingUp,
    bestFor: 'Análisis profundo'
  }
]

const filterOptions = [
  { id: 'amount' as FilterBy, name: 'Monto', icon: DollarSign },
  { id: 'percentage' as FilterBy, name: 'Porcentaje', icon: Percent },
  { id: 'category' as FilterBy, name: 'Categoría', icon: Filter },
  { id: 'date' as FilterBy, name: 'Fecha', icon: Calendar }
]

const categoryConfig = {
  video: { name: 'Video', color: '#FF4458' },
  music: { name: 'Música', color: '#1DB954' },
  productivity: { name: 'Productividad', color: '#0ea5e9' },
  gaming: { name: 'Gaming', color: '#8b5cf6' },
  utilities: { name: 'Servicios', color: '#f59e0b' },
  entertainment: { name: 'Entretenimiento', color: '#ec4899' },
  other: { name: 'Otros', color: '#6b7280' }
}

export default function MultiChartWidget({ 
  subscriptions, 
  totalMonthly, 
  budget,
  className 
}: MultiChartWidgetProps) {
  const [activeChart, setActiveChart] = useState<ChartType>('circle')
  const [filterBy, setFilterBy] = useState<FilterBy>('category')
  const [sortBy, setSortBy] = useState<SortBy>('amount-desc')
  const [hiddenCategories, setHiddenCategories] = useState<Set<SubscriptionCategory>>(new Set())
  const [minAmount, setMinAmount] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  // Filter and sort subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptions
      .filter(sub => !hiddenCategories.has(sub.category))
      .filter(sub => sub.amount >= minAmount)
      .sort((a, b) => {
        switch (sortBy) {
          case 'amount-desc':
            return b.amount - a.amount
          case 'amount-asc':
            return a.amount - b.amount
          case 'name':
            return a.name.localeCompare(b.name)
          case 'date':
            return a.paymentDate - b.paymentDate
          default:
            return 0
        }
      })
  }, [subscriptions, hiddenCategories, minAmount, sortBy])

  // Calculate statistics for different views (Individual subscriptions)
  const chartData = useMemo(() => {
    return filteredSubscriptions.map(sub => ({
      subscription: sub,
      amount: sub.amount,
      percentage: (sub.amount / totalMonthly) * 100,
      config: {
        name: sub.name,
        color: sub.color
      }
    })).sort((a, b) => b.amount - a.amount)
  }, [filteredSubscriptions, totalMonthly])

  const toggleCategoryVisibility = (category: SubscriptionCategory) => {
    const newHidden = new Set(hiddenCategories)
    if (newHidden.has(category)) {
      newHidden.delete(category)
    } else {
      newHidden.add(category)
    }
    setHiddenCategories(newHidden)
  }

  const resetFilters = () => {
    setHiddenCategories(new Set())
    setMinAmount(0)
    setSortBy('amount-desc')
  }

  const renderBarChart = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className={`${componentStyles.text.headline} text-xl`}>
          Gastos por Suscripción
        </h3>
        <div className="text-sm text-neutral-500 dark:text-neutral-400">
          Total: ${filteredSubscriptions.reduce((sum, sub) => sum + sub.amount, 0).toFixed(2)}
        </div>
      </div>
      
      <div className="space-y-3">
        {chartData.slice(0, 10).map((item, index) => {
          const maxAmount = Math.max(...chartData.map(d => d.amount))
          const widthPercentage = (item.amount / maxAmount) * 100
          
          return (
            <motion.div
              key={item.subscription.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-4 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <div className="w-24 text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate">
                {item.config.name}
              </div>
              
              <div className="flex-1 relative h-8 bg-neutral-100 dark:bg-neutral-700 rounded-lg overflow-hidden">
                <motion.div
                  className="h-full rounded-lg"
                  style={{ backgroundColor: item.config.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPercentage}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                />
                <div className="absolute inset-0 flex items-center px-3 text-sm font-medium text-white">
                  ${item.amount.toFixed(2)}
                </div>
              </div>
              
              <div className="w-16 text-right text-sm text-neutral-500 dark:text-neutral-400">
                {item.percentage.toFixed(1)}%
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )

  const renderTimelineChart = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className={`${componentStyles.text.headline} text-xl`}>
          Cronología de Pagos
        </h3>
        <div className="text-sm text-neutral-500 dark:text-neutral-400">
          Este mes
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 py-2">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 31 }, (_, i) => {
          const day = i + 1
          const daySubscriptions = filteredSubscriptions.filter(sub => sub.paymentDate === day)
          const totalAmount = daySubscriptions.reduce((sum, sub) => sum + sub.amount, 0)
          
          return (
            <motion.div
              key={day}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02 }}
              className={cn(
                "aspect-square rounded-lg border-2 flex flex-col items-center justify-center text-xs transition-all duration-200 cursor-pointer",
                daySubscriptions.length > 0
                  ? "border-primary-300 bg-primary-50 dark:bg-primary-900/20 hover:border-primary-500"
                  : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
              )}
            >
              <div className="font-medium">{day}</div>
              {daySubscriptions.length > 0 && (
                <div className="text-primary-600 dark:text-primary-400 font-medium">
                  ${totalAmount.toFixed(0)}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )

  const renderComparisonChart = () => (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h4 className={`${componentStyles.text.headline} text-lg`}>
          Top Suscripciones
        </h4>
        {chartData.slice(0, 8).map((item, index) => (
          <div key={item.subscription.id} className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.config.color }} />
              <span className={componentStyles.text.bodyMedium}>{item.config.name}</span>
            </div>
            <div className="text-right">
              <div className={componentStyles.text.financial}>${item.amount.toFixed(2)}</div>
              <div className="text-xs text-neutral-500">{item.percentage.toFixed(1)}%</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="space-y-4">
        <h4 className={`${componentStyles.text.headline} text-lg`}>
          Análisis de Presupuesto
        </h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <span>Presupuesto mensual</span>
            <span className="font-semibold">${budget.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <span>Gasto actual</span>
            <span className="font-semibold">${totalMonthly.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <span>Disponible</span>
            <span className={`font-semibold ${budget - totalMonthly >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.abs(budget - totalMonthly).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSubscriptionCircle = () => {
    const radius = 90
    const innerRadius = 60
    const centerX = 120
    const centerY = 120
    let currentAngle = -90 // Start from top

    const segments = chartData.slice(0, 8).map((item, index) => {
      const startAngle = currentAngle
      const sweepAngle = (item.percentage / 100) * 360
      currentAngle += sweepAngle

      // Calculate path for donut segment
      const startAngleRad = (startAngle * Math.PI) / 180
      const endAngleRad = ((startAngle + sweepAngle) * Math.PI) / 180

      const x1 = centerX + radius * Math.cos(startAngleRad)
      const y1 = centerY + radius * Math.sin(startAngleRad)
      const x2 = centerX + radius * Math.cos(endAngleRad)
      const y2 = centerY + radius * Math.sin(endAngleRad)

      const x3 = centerX + innerRadius * Math.cos(endAngleRad)
      const y3 = centerY + innerRadius * Math.sin(endAngleRad)
      const x4 = centerX + innerRadius * Math.cos(startAngleRad)
      const y4 = centerY + innerRadius * Math.sin(startAngleRad)

      const largeArcFlag = sweepAngle > 180 ? 1 : 0

      const pathData = [
        `M ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `L ${x3} ${y3}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
        'Z'
      ].join(' ')

      return {
        ...item,
        pathData,
        startAngle,
        sweepAngle
      }
    })

    return (
      <div className="flex flex-col lg:flex-row items-center gap-8">
        <div className="relative">
          <svg width="240" height="240" className="transform">
            {segments.map((segment, index) => (
              <motion.path
                key={segment.subscription.id}
                d={segment.pathData}
                fill={segment.config.color}
                stroke="white"
                strokeWidth="2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="hover:opacity-80 cursor-pointer"
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                ${totalMonthly.toFixed(0)}
              </div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                Total mensual
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <h4 className={`${componentStyles.text.headline} text-lg mb-4`}>
            Desglose por Suscripción
          </h4>
          {segments.map((segment, index) => (
            <motion.div
              key={segment.subscription.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-neutral-50/50 dark:bg-neutral-800/50 rounded-lg hover:bg-neutral-100/80 dark:hover:bg-neutral-700/80 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: segment.config.color }}
                />
                <span className="font-medium text-sm">{segment.config.name}</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">${segment.amount.toFixed(2)}</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {segment.percentage.toFixed(1)}%
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  const renderChart = () => {
    switch (activeChart) {
      case 'circle':
        return renderSubscriptionCircle()
      case 'bar':
        return renderBarChart()
      case 'timeline':
        return renderTimelineChart()
      case 'comparison':
        return renderComparisonChart()
      default:
        return null
    }
  }

  return (
    <div className={cn(componentStyles.card.elevated, "p-6", className)}>
      {/* Header with Chart Type Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className={`${componentStyles.text.headline} text-2xl mb-2`}>
            Análisis de Gastos
          </h2>
          <p className={componentStyles.text.description}>
            {chartTypes.find(c => c.id === activeChart)?.bestFor}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Chart Type Selector */}
          <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1">
            {chartTypes.map(chart => {
              const Icon = chart.icon
              return (
                <Button
                  key={chart.id}
                  variant={activeChart === chart.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveChart(chart.id)}
                  className={cn(
                    "relative px-3 py-2 transition-all duration-200",
                    activeChart === chart.id 
                      ? "bg-white dark:bg-neutral-700 shadow-sm" 
                      : "hover:bg-white/50 dark:hover:bg-neutral-700/50"
                  )}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{chart.name}</span>
                </Button>
              )
            })}
          </div>

          {/* Filters */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {(hiddenCategories.size > 0 || minAmount > 0) && (
                  <Badge variant="secondary" className="ml-2 px-1">
                    {hiddenCategories.size + (minAmount > 0 ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Filtros de visualización</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Category Filters */}
              <div className="p-2">
                <div className="text-sm font-medium mb-2">Categorías</div>
                {Object.entries(categoryConfig).map(([category, config]) => (
                  <DropdownMenuCheckboxItem
                    key={category}
                    checked={!hiddenCategories.has(category as SubscriptionCategory)}
                    onCheckedChange={() => toggleCategoryVisibility(category as SubscriptionCategory)}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.color }} />
                      <span>{config.name}</span>
                    </div>
                  </DropdownMenuCheckboxItem>
                ))}
              </div>
              
              <DropdownMenuSeparator />
              
              {/* Sort Options */}
              <div className="p-2">
                <div className="text-sm font-medium mb-2">Ordenar por</div>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amount-desc">Mayor a menor monto</SelectItem>
                    <SelectItem value="amount-asc">Menor a mayor monto</SelectItem>
                    <SelectItem value="name">Nombre (A-Z)</SelectItem>
                    <SelectItem value="date">Fecha de pago</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={resetFilters}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Restablecer filtros
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Chart Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeChart}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderChart()}
        </motion.div>
      </AnimatePresence>

      {/* Active Filters Summary */}
      {(hiddenCategories.size > 0 || minAmount > 0) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-700 dark:text-blue-300">
              {hiddenCategories.size > 0 && `${hiddenCategories.size} categorías ocultas`}
              {hiddenCategories.size > 0 && minAmount > 0 && ', '}
              {minAmount > 0 && `monto mínimo $${minAmount}`}
            </div>
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <RotateCcw className="h-3 w-3 mr-1" />
              Limpiar
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}