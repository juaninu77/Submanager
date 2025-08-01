import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNotifications } from '@/hooks/use-pwa'
import { useLocalStorage } from '@/hooks/use-local-storage'
import type { Subscription } from '@/types/subscription'

interface NotificationSettings {
  enabled: boolean
  upcomingPayments: {
    enabled: boolean
    daysBefore: number[]
  }
  budgetAlerts: {
    enabled: boolean
    thresholds: number[] // Percentages: [75, 90, 100]
  }
  unusedSubscriptions: {
    enabled: boolean
    daysThreshold: number
  }
  priceChanges: {
    enabled: boolean
    trackIncreases: boolean
    trackDecreases: boolean
  }
  weeklyDigest: {
    enabled: boolean
    day: number // 0-6 (Sunday-Saturday)
    time: string // "09:00"
  }
  smartSuggestions: {
    enabled: boolean
    categories: string[]
  }
}

interface SmartNotification {
  id: string
  type: 'upcoming_payment' | 'budget_alert' | 'unused_subscription' | 'price_change' | 'suggestion' | 'digest'
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  scheduledFor: Date
  data?: any
  actions?: NotificationAction[]
  recurring?: boolean
  viewed?: boolean
  dismissed?: boolean
}

interface NotificationAction {
  id: string
  label: string
  action: 'mark_paid' | 'snooze' | 'cancel_subscription' | 'view_details' | 'dismiss'
  primary?: boolean
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  upcomingPayments: {
    enabled: true,
    daysBefore: [3, 1]
  },
  budgetAlerts: {
    enabled: true,
    thresholds: [75, 90, 100]
  },
  unusedSubscriptions: {
    enabled: true,
    daysThreshold: 30
  },
  priceChanges: {
    enabled: true,
    trackIncreases: true,
    trackDecreases: false
  },
  weeklyDigest: {
    enabled: true,
    day: 0, // Sunday
    time: "09:00"
  },
  smartSuggestions: {
    enabled: true,
    categories: ['entertainment', 'productivity', 'utilities']
  }
}

export function useSmartNotifications(subscriptions: Subscription[], budget: number, totalMonthly: number) {
  const { showNotification } = useNotifications()
  const { value: settings, setValue: setSettings } = useLocalStorage('notification-settings', DEFAULT_SETTINGS)
  const { value: notifications, setValue: setNotifications } = useLocalStorage<SmartNotification[]>('smart-notifications', [])
  const { value: lastProcessed, setValue: setLastProcessed } = useLocalStorage('notifications-last-processed', Date.now())

  // Generate smart notifications based on subscriptions and settings
  const generateNotifications = useCallback(() => {
    if (!settings.enabled) return []

    const newNotifications: SmartNotification[] = []
    const now = new Date()

    // 1. Upcoming Payment Notifications
    if (settings.upcomingPayments.enabled) {
      subscriptions.forEach(subscription => {
        settings.upcomingPayments.daysBefore.forEach(days => {
          const paymentDate = new Date(now.getFullYear(), now.getMonth(), subscription.paymentDate)
          if (paymentDate < now) {
            paymentDate.setMonth(paymentDate.getMonth() + 1)
          }
          
          const notificationDate = new Date(paymentDate)
          notificationDate.setDate(notificationDate.getDate() - days)

          if (notificationDate > now && notificationDate <= new Date(now.getTime() + 24 * 60 * 60 * 1000)) {
            newNotifications.push({
              id: `upcoming-${subscription.id}-${days}`,
              type: 'upcoming_payment',
              title: `Pago próximo: ${subscription.name}`,
              message: `$${subscription.amount} se cobrará en ${days} día${days > 1 ? 's' : ''}`,
              priority: days === 1 ? 'high' : 'medium',
              scheduledFor: notificationDate,
              data: { subscription, daysUntil: days },
              actions: [
                { id: 'mark_paid', label: 'Marcar como pagado', action: 'mark_paid' },
                { id: 'view_details', label: 'Ver detalles', action: 'view_details' },
                { id: 'snooze', label: 'Recordar mañana', action: 'snooze' }
              ]
            })
          }
        })
      })
    }

    // 2. Budget Alert Notifications
    if (settings.budgetAlerts.enabled && budget > 0) {
      const budgetUsage = (totalMonthly / budget) * 100
      
      settings.budgetAlerts.thresholds.forEach(threshold => {
        if (budgetUsage >= threshold) {
          const priority = threshold >= 100 ? 'urgent' : threshold >= 90 ? 'high' : 'medium'
          
          newNotifications.push({
            id: `budget-alert-${threshold}`,
            type: 'budget_alert',
            title: threshold >= 100 ? '⚠️ Presupuesto excedido' : `Presupuesto al ${threshold}%`,
            message: threshold >= 100 
              ? `Has excedido tu presupuesto por $${(totalMonthly - budget).toFixed(2)}`
              : `Has usado $${totalMonthly.toFixed(2)} de $${budget} (${budgetUsage.toFixed(1)}%)`,
            priority,
            scheduledFor: now,
            data: { budget, totalMonthly, usage: budgetUsage },
            actions: [
              { id: 'view_details', label: 'Ver gastos', action: 'view_details', primary: true },
              { id: 'adjust_budget', label: 'Ajustar presupuesto', action: 'view_details' }
            ]
          })
        }
      })
    }

    // 3. Unused Subscription Detection
    if (settings.unusedSubscriptions.enabled) {
      const thresholdDate = new Date(now.getTime() - settings.unusedSubscriptions.daysThreshold * 24 * 60 * 60 * 1000)
      
      subscriptions.forEach(subscription => {
        // Simulate usage tracking (in real app, track actual usage)
        const lastUsed = new Date(subscription.startDate || now)
        
        if (lastUsed < thresholdDate) {
          newNotifications.push({
            id: `unused-${subscription.id}`,
            type: 'unused_subscription',
            title: `¿Sigues usando ${subscription.name}?`,
            message: `No has usado esta suscripción en ${settings.unusedSubscriptions.daysThreshold} días. Podrías ahorrar $${subscription.amount}/mes`,
            priority: 'low',
            scheduledFor: now,
            data: { subscription, daysSinceUsed: settings.unusedSubscriptions.daysThreshold },
            actions: [
              { id: 'cancel_subscription', label: 'Cancelar suscripción', action: 'cancel_subscription', primary: true },
              { id: 'mark_used', label: 'Marcar como usada', action: 'dismiss' },
              { id: 'remind_later', label: 'Recordar en 1 semana', action: 'snooze' }
            ]
          })
        }
      })
    }

    // 4. Weekly Digest
    if (settings.weeklyDigest.enabled) {
      const today = now.getDay()
      const currentHour = now.getHours()
      const [digestHour] = settings.weeklyDigest.time.split(':').map(Number)
      
      if (today === settings.weeklyDigest.day && currentHour === digestHour) {
        const totalSavings = budget > totalMonthly ? budget - totalMonthly : 0
        
        newNotifications.push({
          id: `weekly-digest-${now.getTime()}`,
          type: 'digest',
          title: '📊 Resumen semanal',
          message: `${subscriptions.length} suscripciones activas, $${totalMonthly.toFixed(2)} gastados este mes${totalSavings > 0 ? `, ahorraste $${totalSavings.toFixed(2)}` : ''}`,
          priority: 'low',
          scheduledFor: now,
          data: { subscriptions: subscriptions.length, totalMonthly, savings: totalSavings },
          actions: [
            { id: 'view_report', label: 'Ver reporte completo', action: 'view_details', primary: true }
          ]
        })
      }
    }

    // 5. Smart Suggestions (simplified)
    if (settings.smartSuggestions.enabled) {
      // Example: Suggest similar but cheaper alternatives
      const expensiveSubscriptions = subscriptions
        .filter(sub => sub.amount > 20)
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 2)

      expensiveSubscriptions.forEach(subscription => {
        newNotifications.push({
          id: `suggestion-${subscription.id}`,
          type: 'suggestion',
          title: `💡 Sugerencia de ahorro`,
          message: `Podrías ahorrar hasta $10/mes con alternativas a ${subscription.name}`,
          priority: 'low',
          scheduledFor: now,
          data: { subscription, potentialSavings: 10 },
          actions: [
            { id: 'view_alternatives', label: 'Ver alternativas', action: 'view_details', primary: true },
            { id: 'not_interested', label: 'No me interesa', action: 'dismiss' }
          ]
        })
      })
    }

    return newNotifications
  }, [subscriptions, budget, totalMonthly, settings])

  // Process and send notifications
  const processNotifications = useCallback(async () => {
    const newNotifications = generateNotifications()
    const now = Date.now()
    
    // Only process if enough time has passed (prevent spam)
    if (now - lastProcessed < 60 * 60 * 1000) return // 1 hour cooldown
    
    // Filter out already sent notifications
    const existingIds = notifications.map(n => n.id)
    const freshNotifications = newNotifications.filter(n => !existingIds.includes(n.id))
    
    // Send immediate notifications
    for (const notification of freshNotifications) {
      if (notification.scheduledFor <= new Date()) {
        try {
          await showNotification(notification.title, {
            body: notification.message,
            tag: notification.id,
            data: notification.data,
            actions: notification.actions?.slice(0, 2).map(action => ({
              action: action.id,
              title: action.label
            })),
            requireInteraction: notification.priority === 'urgent'
          })
        } catch (error) {
          console.error('Failed to show notification:', error)
        }
      }
    }
    
    // Update stored notifications
    const updatedNotifications = [...notifications, ...freshNotifications]
      .filter(n => !n.dismissed)
      .sort((a, b) => b.scheduledFor.getTime() - a.scheduledFor.getTime())
      .slice(0, 50) // Keep only recent 50
    
    setNotifications(updatedNotifications)
    setLastProcessed(now)
  }, [notifications, generateNotifications, showNotification, lastProcessed, setNotifications, setLastProcessed])

  // Auto-process notifications
  useEffect(() => {
    const interval = setInterval(processNotifications, 15 * 60 * 1000) // Every 15 minutes
    processNotifications() // Initial check
    
    return () => clearInterval(interval)
  }, [processNotifications])

  // Mark notification as viewed/dismissed
  const markNotification = useCallback((id: string, status: 'viewed' | 'dismissed') => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, [status]: true } : n
    ))
  }, [setNotifications])

  // Get pending notifications
  const pendingNotifications = useMemo(() => {
    return notifications.filter(n => !n.dismissed && !n.viewed)
  }, [notifications])

  // Get unread count
  const unreadCount = useMemo(() => {
    return pendingNotifications.filter(n => n.priority === 'high' || n.priority === 'urgent').length
  }, [pendingNotifications])

  return {
    settings,
    setSettings,
    notifications: pendingNotifications,
    unreadCount,
    markNotification,
    processNotifications
  }
}