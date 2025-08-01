import React, { memo, useCallback } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, AlertCircle } from 'lucide-react'
import type { Subscription } from '@/types/subscription'

interface OptimizedSubscriptionCardProps {
  subscription: Subscription
  onEdit: (subscription: Subscription) => void
  onRemove: (id: string) => void
  isUpcoming?: boolean
  className?: string
}

const OptimizedSubscriptionCard = memo<OptimizedSubscriptionCardProps>(({
  subscription,
  onEdit,
  onRemove,
  isUpcoming = false,
  className = ''
}) => {
  const handleEdit = useCallback(() => {
    onEdit(subscription)
  }, [onEdit, subscription])

  const handleRemove = useCallback(() => {
    onRemove(subscription.id)
  }, [onRemove, subscription.id])

  const formatAmount = useCallback((amount: number, cycle: string = 'monthly') => {
    const symbol = cycle === 'yearly' ? '/año' : cycle === 'quarterly' ? '/trim' : '/mes'
    return `$${amount.toFixed(2)}${symbol}`
  }, [])

  const getCategoryColor = useCallback((category: string) => {
    const colors = {
      entertainment: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      productivity: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      utilities: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      gaming: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      music: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      video: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
    return colors[category as keyof typeof colors] || colors.other
  }, [])

  return (
    <Card 
      className={`
        relative transition-all duration-200 hover:shadow-lg hover:-translate-y-1
        ${isUpcoming ? 'ring-2 ring-orange-500 ring-opacity-50' : ''}
        ${className}
      `}
      style={{ borderLeft: `4px solid ${subscription.color}` }}
    >
      {isUpcoming && (
        <div className="absolute -top-2 -right-2 z-10">
          <Badge variant="destructive" className="animate-pulse">
            <AlertCircle className="w-3 h-3 mr-1" />
            Próximo
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: subscription.color }}
              aria-label={`Logo de ${subscription.name}`}
            >
              {subscription.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                {subscription.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                {subscription.description}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="h-8 w-8 p-0"
              aria-label={`Editar suscripción ${subscription.name}`}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              aria-label={`Eliminar suscripción ${subscription.name}`}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {formatAmount(subscription.amount, subscription.billingCycle)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Pago el día {subscription.paymentDate}
            </p>
          </div>
          
          <Badge 
            className={getCategoryColor(subscription.category)}
            variant="secondary"
          >
            {subscription.category}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
})

OptimizedSubscriptionCard.displayName = 'OptimizedSubscriptionCard'

export default OptimizedSubscriptionCard