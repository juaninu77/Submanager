import React, { memo, useMemo, useCallback, Suspense, lazy } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import { useSubscriptionsContext } from '@/contexts/AppContext'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy load heavy components
const LazyChart = lazy(() => import('@/components/subscription-ring-chart'))
const LazyVirtualizedList = lazy(() => import('./VirtualizedList'))

interface StatsCardProps {
  title: string
  value: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
  description?: string
}

const StatsCard = memo<StatsCardProps>(({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon, 
  description 
}) => {
  const changeColor = useMemo(() => {
    switch (changeType) {
      case 'positive': return 'text-green-600 dark:text-green-400'
      case 'negative': return 'text-red-600 dark:text-red-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }, [changeType])

  const changeIcon = useMemo(() => {
    switch (changeType) {
      case 'positive': return <TrendingUp className="w-3 h-3" />
      case 'negative': return <TrendingDown className="w-3 h-3" />
      default: return null
    }
  }, [changeType])

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </CardTitle>
        <div className="text-gray-500 dark:text-gray-400">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {value}
        </div>
        {change && (
          <div className={`flex items-center text-xs ${changeColor} mt-1`}>
            {changeIcon}
            <span className="ml-1">{change}</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
})

StatsCard.displayName = 'StatsCard'

interface OptimizedDashboardProps {
  budget: number
  className?: string
}

const OptimizedDashboard = memo<OptimizedDashboardProps>(({ budget, className = '' }) => {
  const {
    subscriptions,
    filteredSubscriptions,
    totalMonthly,
    totalYearly,
    upcomingPayments
  } = useSubscriptionsContext()

  // Memoizar cálculos costosos
  const stats = useMemo(() => {
    const budgetUsage = totalMonthly > 0 ? (totalMonthly / budget) * 100 : 0
    const avgSubscription = subscriptions.length > 0 ? totalMonthly / subscriptions.length : 0
    const savings = Math.max(0, budget - totalMonthly)
    
    return {
      budgetUsage: budgetUsage.toFixed(1),
      avgSubscription: avgSubscription.toFixed(2),
      savings: savings.toFixed(2),
      budgetStatus: budgetUsage > 100 ? 'negative' : budgetUsage > 80 ? 'neutral' : 'positive'
    }
  }, [totalMonthly, budget, subscriptions.length])

  const upcomingPaymentIds = useMemo(() => 
    upcomingPayments.map(sub => sub.id), 
    [upcomingPayments]
  )

  // Callbacks memoizados
  const handleEdit = useCallback((subscription: any) => {
    // Implementar lógica de edición
    console.log('Edit subscription:', subscription)
  }, [])

  const handleRemove = useCallback((id: string) => {
    // Implementar lógica de eliminación
    console.log('Remove subscription:', id)
  }, [])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Gasto Mensual"
          value={`$${totalMonthly.toFixed(2)}`}
          change={`${stats.budgetUsage}% del presupuesto`}
          changeType={stats.budgetStatus as any}
          icon={<DollarSign className="w-4 h-4" />}
          description="Total de suscripciones activas"
        />
        
        <StatsCard
          title="Gasto Anual"
          value={`$${totalYearly.toFixed(2)}`}
          change={`${subscriptions.length} suscripciones`}
          icon={<Calendar className="w-4 h-4" />}
          description="Proyección anual"
        />
        
        <StatsCard
          title="Promedio por Suscripción"
          value={`$${stats.avgSubscription}`}
          icon={<TrendingUp className="w-4 h-4" />}
          description="Costo promedio mensual"
        />
        
        <StatsCard
          title="Ahorro Disponible"
          value={`$${stats.savings}`}
          changeType={parseFloat(stats.savings) > 0 ? 'positive' : 'negative'}
          icon={<DollarSign className="w-4 h-4" />}
          description="Presupuesto restante"
        />
      </div>

      {/* Upcoming Payments Alert */}
      {upcomingPayments.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
          <CardHeader>
            <CardTitle className="text-orange-800 dark:text-orange-200 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Próximos Pagos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {upcomingPayments.map(sub => (
                <Badge 
                  key={sub.id}
                  variant="outline" 
                  className="border-orange-300 text-orange-800 dark:border-orange-600 dark:text-orange-200"
                >
                  {sub.name} - ${sub.amount} (día {sub.paymentDate})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <LazyChart
                subscriptions={subscriptions}
                total={totalMonthly}
                budget={budget}
              />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Suscripciones Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <LazyVirtualizedList
                subscriptions={filteredSubscriptions.slice(0, 5)}
                onEdit={handleEdit}
                onRemove={handleRemove}
                upcomingPayments={upcomingPaymentIds}
                height={300}
                itemHeight={100}
              />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
})

OptimizedDashboard.displayName = 'OptimizedDashboard'

export default OptimizedDashboard