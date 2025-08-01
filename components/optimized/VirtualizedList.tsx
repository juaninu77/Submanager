import React, { memo, useMemo, useState, useCallback, useEffect } from 'react'
import { FixedSizeList as List } from 'react-window'
import type { Subscription } from '@/types/subscription'
import OptimizedSubscriptionCard from './OptimizedSubscriptionCard'

interface VirtualizedListProps {
  subscriptions: Subscription[]
  onEdit: (subscription: Subscription) => void
  onRemove: (id: string) => void
  height?: number
  itemHeight?: number
  upcomingPayments?: string[]
  className?: string
}

interface ListItemProps {
  index: number
  style: React.CSSProperties
  data: {
    subscriptions: Subscription[]
    onEdit: (subscription: Subscription) => void
    onRemove: (id: string) => void
    upcomingPayments: string[]
  }
}

const ListItem = memo<ListItemProps>(({ index, style, data }) => {
  const { subscriptions, onEdit, onRemove, upcomingPayments } = data
  const subscription = subscriptions[index]
  const isUpcoming = upcomingPayments.includes(subscription.id)

  return (
    <div style={style} className="px-2 py-1">
      <OptimizedSubscriptionCard
        subscription={subscription}
        onEdit={onEdit}
        onRemove={onRemove}
        isUpcoming={isUpcoming}
      />
    </div>
  )
})

ListItem.displayName = 'ListItem'

const VirtualizedList = memo<VirtualizedListProps>(({
  subscriptions,
  onEdit,
  onRemove,
  height = 400,
  itemHeight = 120,
  upcomingPayments = [],
  className = ''
}) => {
  const [containerHeight, setContainerHeight] = useState(height)

  const itemData = useMemo(() => ({
    subscriptions,
    onEdit,
    onRemove,
    upcomingPayments
  }), [subscriptions, onEdit, onRemove, upcomingPayments])

  // Ajustar altura automáticamente si hay pocos elementos
  const adjustedHeight = useMemo(() => {
    const maxHeight = subscriptions.length * itemHeight
    return Math.min(containerHeight, maxHeight)
  }, [subscriptions.length, itemHeight, containerHeight])

  // Hook para detectar cambios en el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      const viewportHeight = window.innerHeight
      const maxListHeight = Math.floor(viewportHeight * 0.6)
      setContainerHeight(Math.min(height, maxListHeight))
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [height])

  if (subscriptions.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height: adjustedHeight }}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p className="text-lg font-medium">No hay suscripciones</p>
          <p className="text-sm">Agrega tu primera suscripción para comenzar</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <List
        height={adjustedHeight}
        itemCount={subscriptions.length}
        itemSize={itemHeight}
        itemData={itemData}
        overscanCount={2}
        className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
      >
        {ListItem}
      </List>
    </div>
  )
})

VirtualizedList.displayName = 'VirtualizedList'

export default VirtualizedList