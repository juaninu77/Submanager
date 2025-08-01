import React, { useState, useCallback, useMemo } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Settings, 
  X, 
  GripVertical, 
  TrendingUp, 
  Calendar,
  PieChart,
  DollarSign,
  Target,
  Bell,
  BarChart3,
  Activity,
  CreditCard,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { useSubscriptionsContext } from '@/contexts/AppContext'
import { useMicroInteractions } from '@/hooks/use-haptics'

// Widget types and configurations
export type WidgetType = 
  | 'spending_overview'
  | 'upcoming_payments' 
  | 'budget_progress'
  | 'category_breakdown'
  | 'monthly_trends'
  | 'quick_stats'
  | 'recent_activity'
  | 'savings_goals'
  | 'price_alerts'
  | 'usage_insights'

export interface Widget {
  id: string
  type: WidgetType
  title: string
  size: 'small' | 'medium' | 'large'
  position: { x: number; y: number }
  settings: Record<string, any>
  enabled: boolean
}

export interface WidgetDefinition {
  type: WidgetType
  title: string
  description: string
  icon: React.ReactNode
  defaultSize: Widget['size']
  component: React.ComponentType<WidgetProps>
  settings?: WidgetSetting[]
}

export interface WidgetSetting {
  key: string
  label: string
  type: 'toggle' | 'select' | 'number' | 'color'
  options?: { value: string; label: string }[]
  defaultValue: any
}

export interface WidgetProps {
  widget: Widget
  onUpdateSettings: (settings: Record<string, any>) => void
  onRemove: () => void
}

// Widget definitions
const WIDGET_DEFINITIONS: WidgetDefinition[] = [
  {
    type: 'spending_overview',
    title: 'Resumen de Gastos',
    description: 'Vista general de tus gastos mensuales',
    icon: <DollarSign className="w-5 h-5" />,
    defaultSize: 'medium',
    component: SpendingOverviewWidget,
    settings: [
      { key: 'showComparison', label: 'Mostrar comparación', type: 'toggle', defaultValue: true },
      { key: 'period', label: 'Período', type: 'select', options: [
        { value: 'month', label: 'Mes actual' },
        { value: 'quarter', label: 'Trimestre' },
        { value: 'year', label: 'Año' }
      ], defaultValue: 'month' }
    ]
  },
  {
    type: 'upcoming_payments',
    title: 'Próximos Pagos',
    description: 'Pagos programados para los próximos días',
    icon: <Calendar className="w-5 h-5" />,
    defaultSize: 'medium',
    component: UpcomingPaymentsWidget,
    settings: [
      { key: 'daysAhead', label: 'Días por adelantado', type: 'number', defaultValue: 7 },
      { key: 'showAmount', label: 'Mostrar montos', type: 'toggle', defaultValue: true }
    ]
  },
  {
    type: 'budget_progress',
    title: 'Progreso del Presupuesto',
    description: 'Seguimiento de tu presupuesto mensual',
    icon: <Target className="w-5 h-5" />,
    defaultSize: 'small',
    component: BudgetProgressWidget
  },
  {
    type: 'category_breakdown',
    title: 'Gastos por Categoría',
    description: 'Distribución de gastos por categorías',
    icon: <PieChart className="w-5 h-5" />,
    defaultSize: 'large',
    component: CategoryBreakdownWidget
  },
  {
    type: 'monthly_trends',
    title: 'Tendencias Mensuales',
    description: 'Gráfico de evolución de gastos',
    icon: <TrendingUp className="w-5 h-5" />,
    defaultSize: 'large',
    component: MonthlyTrendsWidget
  },
  {
    type: 'quick_stats',
    title: 'Estadísticas Rápidas',
    description: 'Métricas clave en un vistazo',
    icon: <BarChart3 className="w-5 h-5" />,
    defaultSize: 'small',
    component: QuickStatsWidget
  }
]

// Default dashboard layout
const DEFAULT_WIDGETS: Widget[] = [
  {
    id: 'spending-overview-1',
    type: 'spending_overview',
    title: 'Resumen de Gastos',
    size: 'medium',
    position: { x: 0, y: 0 },
    settings: { showComparison: true, period: 'month' },
    enabled: true
  },
  {
    id: 'upcoming-payments-1',
    type: 'upcoming_payments',
    title: 'Próximos Pagos',
    size: 'medium',
    position: { x: 1, y: 0 },
    settings: { daysAhead: 7, showAmount: true },
    enabled: true
  },
  {
    id: 'budget-progress-1',
    type: 'budget_progress',
    title: 'Progreso del Presupuesto',
    size: 'small',
    position: { x: 0, y: 1 },
    settings: {},
    enabled: true
  },
  {
    id: 'quick-stats-1',
    type: 'quick_stats',
    title: 'Estadísticas Rápidas',
    size: 'small',
    position: { x: 1, y: 1 },
    settings: {},
    enabled: true
  }
]

// Main dashboard component
interface CustomizableDashboardProps {
  className?: string
}

export function CustomizableDashboard({ className = '' }: CustomizableDashboardProps) {
  const { value: widgets, setValue: setWidgets } = useLocalStorage('dashboard-widgets', DEFAULT_WIDGETS)
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [showAddWidget, setShowAddWidget] = useState(false)
  const { triggerMicroInteraction } = useMicroInteractions()

  const enabledWidgets = useMemo(() => widgets.filter(w => w.enabled), [widgets])

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination || !isCustomizing) return

    const newWidgets = Array.from(enabledWidgets)
    const [reorderedWidget] = newWidgets.splice(result.source.index, 1)
    newWidgets.splice(result.destination.index, 0, reorderedWidget)

    // Update positions
    const updatedWidgets = newWidgets.map((widget, index) => ({
      ...widget,
      position: { x: index % 2, y: Math.floor(index / 2) }
    }))

    setWidgets(prev => prev.map(w => {
      const updated = updatedWidgets.find(uw => uw.id === w.id)
      return updated || w
    }))

    triggerMicroInteraction('drag_end')
  }, [enabledWidgets, isCustomizing, setWidgets, triggerMicroInteraction])

  const addWidget = useCallback((type: WidgetType) => {
    const definition = WIDGET_DEFINITIONS.find(d => d.type === type)
    if (!definition) return

    const newWidget: Widget = {
      id: `${type}-${Date.now()}`,
      type,
      title: definition.title,
      size: definition.defaultSize,
      position: { x: 0, y: Math.ceil(enabledWidgets.length / 2) },
      settings: definition.settings?.reduce((acc, setting) => ({
        ...acc,
        [setting.key]: setting.defaultValue
      }), {}) || {},
      enabled: true
    }

    setWidgets(prev => [...prev, newWidget])
    setShowAddWidget(false)
    triggerMicroInteraction('add')
  }, [enabledWidgets.length, setWidgets, triggerMicroInteraction])

  const removeWidget = useCallback((widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId))
    triggerMicroInteraction('delete')
  }, [setWidgets, triggerMicroInteraction])

  const updateWidgetSettings = useCallback((widgetId: string, settings: Record<string, any>) => {
    setWidgets(prev => prev.map(w => 
      w.id === widgetId ? { ...w, settings: { ...w.settings, ...settings } } : w
    ))
  }, [setWidgets])

  const getGridClasses = (size: Widget['size']) => {
    switch (size) {
      case 'small': return 'col-span-1 row-span-1'
      case 'medium': return 'col-span-1 md:col-span-1 row-span-1'
      case 'large': return 'col-span-1 md:col-span-2 row-span-1'
      default: return 'col-span-1 row-span-1'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Dashboard Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard
        </h2>
        <div className="flex items-center space-x-2">
          <Button
            variant={isCustomizing ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setIsCustomizing(!isCustomizing)
              triggerMicroInteraction('toggle')
            }}
          >
            <Settings className="w-4 h-4 mr-2" />
            {isCustomizing ? 'Guardar' : 'Personalizar'}
          </Button>
          
          <Dialog open={showAddWidget} onOpenChange={setShowAddWidget}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Widget
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Agregar Widget</DialogTitle>
                <DialogDescription>
                  Selecciona un widget para agregar a tu dashboard
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                {WIDGET_DEFINITIONS.map((definition) => (
                  <Card 
                    key={definition.type}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => addWidget(definition.type)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="text-primary-600">
                          {definition.icon}
                        </div>
                        <div>
                          <CardTitle className="text-sm">{definition.title}</CardTitle>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {definition.description}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Widget Grid */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard" direction="horizontal">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`
                grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min
                ${snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4' : ''}
                transition-all duration-200
              `}
            >
              <AnimatePresence>
                {enabledWidgets.map((widget, index) => (
                  <Draggable 
                    key={widget.id} 
                    draggableId={widget.id} 
                    index={index}
                    isDragDisabled={!isCustomizing}
                  >
                    {(provided, snapshot) => (
                      <motion.div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`
                          ${getGridClasses(widget.size)}
                          ${snapshot.isDragging ? 'z-10 rotate-2 scale-105' : ''}
                          transition-all duration-200
                        `}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        <WidgetContainer
                          widget={widget}
                          isCustomizing={isCustomizing}
                          dragHandleProps={provided.dragHandleProps}
                          onUpdateSettings={(settings) => updateWidgetSettings(widget.id, settings)}
                          onRemove={() => removeWidget(widget.id)}
                        />
                      </motion.div>
                    )}
                  </Draggable>
                ))}
              </AnimatePresence>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}

// Widget container with controls
interface WidgetContainerProps {
  widget: Widget
  isCustomizing: boolean
  dragHandleProps: any
  onUpdateSettings: (settings: Record<string, any>) => void
  onRemove: () => void
}

function WidgetContainer({ 
  widget, 
  isCustomizing, 
  dragHandleProps, 
  onUpdateSettings, 
  onRemove 
}: WidgetContainerProps) {
  const definition = WIDGET_DEFINITIONS.find(d => d.type === widget.type)
  const WidgetComponent = definition?.component

  if (!WidgetComponent || !definition) {
    return <div className="p-4 text-center text-gray-500">Widget no encontrado</div>
  }

  return (
    <Card className={`h-full ${isCustomizing ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
        {isCustomizing && (
          <div className="flex items-center space-x-1">
            <div
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <GripVertical className="w-4 h-4 text-gray-400" />
            </div>
            
            {definition.settings && definition.settings.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Settings className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="p-2 space-y-2">
                    {definition.settings.map(setting => (
                      <WidgetSettingControl
                        key={setting.key}
                        setting={setting}
                        value={widget.settings[setting.key] ?? setting.defaultValue}
                        onChange={(value) => onUpdateSettings({ [setting.key]: value })}
                      />
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        <WidgetComponent
          widget={widget}
          onUpdateSettings={onUpdateSettings}
          onRemove={onRemove}
        />
      </CardContent>
    </Card>
  )
}

// Widget setting control
interface WidgetSettingControlProps {
  setting: WidgetSetting
  value: any
  onChange: (value: any) => void
}

function WidgetSettingControl({ setting, value, onChange }: WidgetSettingControlProps) {
  // Implementation for different setting types would go here
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{setting.label}</span>
      {/* Setting control based on type */}
    </div>
  )
}

// Example widget components (simplified)
function SpendingOverviewWidget({ widget }: WidgetProps) {
  const { totalMonthly } = useSubscriptionsContext()
  
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          ${totalMonthly.toFixed(2)}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Gasto este mes
        </div>
      </div>
      {widget.settings.showComparison && (
        <div className="flex items-center justify-center space-x-2 text-sm">
          <TrendingUp className="w-4 h-4 text-green-500" />
          <span className="text-green-600">+5% vs mes anterior</span>
        </div>
      )}
    </div>
  )
}

function UpcomingPaymentsWidget({ widget }: WidgetProps) {
  const { upcomingPayments } = useSubscriptionsContext()
  const daysAhead = widget.settings.daysAhead || 7
  
  const filteredPayments = upcomingPayments.slice(0, 3)
  
  return (
    <div className="space-y-3">
      {filteredPayments.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-4">
          <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Sin pagos próximos</p>
        </div>
      ) : (
        filteredPayments.map((payment) => (
          <div key={payment.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: payment.color }}
              />
              <span className="text-sm font-medium">{payment.name}</span>
            </div>
            {widget.settings.showAmount && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ${payment.amount}
              </span>
            )}
          </div>
        ))
      )}
    </div>
  )
}

function BudgetProgressWidget(): React.ReactElement {
  const { totalMonthly } = useSubscriptionsContext()
  const budget = 200 // From context
  const percentage = budget > 0 ? (totalMonthly / budget) * 100 : 0
  
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-lg font-semibold">
          {percentage.toFixed(1)}%
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          del presupuesto usado
        </div>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <motion.div
          className={`h-2 rounded-full ${
            percentage > 100 ? 'bg-red-500' : 
            percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      <div className="text-center text-xs text-gray-600 dark:text-gray-400">
        ${totalMonthly.toFixed(2)} / ${budget.toFixed(2)}
      </div>
    </div>
  )
}

function CategoryBreakdownWidget(): React.ReactElement {
  // Implementation would include a pie chart
  return <div className="text-center text-gray-500">Gráfico de categorías</div>
}

function MonthlyTrendsWidget(): React.ReactElement {
  // Implementation would include a line chart
  return <div className="text-center text-gray-500">Gráfico de tendencias</div>
}

function QuickStatsWidget(): React.ReactElement {
  const { subscriptions, totalMonthly } = useSubscriptionsContext()
  
  const stats = [
    { label: 'Suscripciones', value: subscriptions.length },
    { label: 'Promedio', value: `$${(totalMonthly / Math.max(subscriptions.length, 1)).toFixed(0)}` },
    { label: 'Más caro', value: `$${Math.max(...subscriptions.map(s => s.amount), 0).toFixed(0)}` }
  ]
  
  return (
    <div className="space-y-3">
      {stats.map((stat, index) => (
        <div key={index} className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</span>
          <span className="font-medium">{stat.value}</span>
        </div>
      ))}
    </div>
  )
}