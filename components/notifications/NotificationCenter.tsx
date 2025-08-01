import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Settings, Check, Clock, AlertTriangle, Lightbulb, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { useSmartNotifications } from '@/hooks/use-smart-notifications'
import { useSubscriptionsContext } from '@/contexts/AppContext'
import { useMicroInteractions } from '@/hooks/use-haptics'
import type { SmartNotification } from '@/hooks/use-smart-notifications'

interface NotificationCenterProps {
  className?: string
}

export function NotificationCenter({ className = '' }: NotificationCenterProps) {
  const { subscriptions, totalMonthly } = useSubscriptionsContext()
  const { notifications, unreadCount, settings, setSettings, markNotification } = useSmartNotifications(
    subscriptions, 
    200, // budget from context
    totalMonthly
  )
  const { triggerMicroInteraction } = useMicroInteractions()
  const [isOpen, setIsOpen] = useState(false)

  const handleNotificationClick = (notification: SmartNotification) => {
    triggerMicroInteraction('card_tap')
    markNotification(notification.id, 'viewed')
  }

  const handleNotificationDismiss = (notification: SmartNotification) => {
    triggerMicroInteraction('swipe')
    markNotification(notification.id, 'dismissed')
  }

  const getNotificationIcon = (type: SmartNotification['type']) => {
    switch (type) {
      case 'upcoming_payment': return <Clock className="w-4 h-4" />
      case 'budget_alert': return <AlertTriangle className="w-4 h-4" />
      case 'unused_subscription': return <Clock className="w-4 h-4" />
      case 'suggestion': return <Lightbulb className="w-4 h-4" />
      case 'digest': return <BarChart3 className="w-4 h-4" />
      default: return <Bell className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: SmartNotification['priority']) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50 dark:bg-red-900/20'
      case 'high': return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
      case 'medium': return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
      case 'low': return 'border-gray-300 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={`relative ${className}`}
          onClick={() => triggerMicroInteraction('button_press')}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end">
        <Tabs defaultValue="notifications" className="w-full">
          <div className="border-b border-border">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="notifications">
                Notificaciones
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="notifications" className="m-0">
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay notificaciones</p>
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  <AnimatePresence>
                    {notifications.map((notification) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        onView={() => handleNotificationClick(notification)}
                        onDismiss={() => handleNotificationDismiss(notification)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="m-0">
            <NotificationSettings
              settings={settings}
              onSettingsChange={setSettings}
            />
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}

// Individual notification card
interface NotificationCardProps {
  notification: SmartNotification
  onView: () => void
  onDismiss: () => void
}

function NotificationCard({ notification, onView, onDismiss }: NotificationCardProps) {
  const { triggerMicroInteraction } = useMicroInteractions()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={`cursor-pointer transition-all hover:shadow-md border-l-4 ${getPriorityColor(notification.priority)}`}
        onClick={onView}
      >
        <CardContent className="p-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-2 flex-1">
              <div className="mt-1">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {notification.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {notification.message}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {notification.type.replace('_', ' ')}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {formatRelativeTime(notification.scheduledFor)}
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                triggerMicroInteraction('swipe')
                onDismiss()
              }}
              className="h-6 w-6 p-0 ml-2 opacity-50 hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {notification.actions && notification.actions.length > 0 && (
            <div className="flex space-x-2 mt-3">
              {notification.actions.slice(0, 2).map((action) => (
                <Button
                  key={action.id}
                  variant={action.primary ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    triggerMicroInteraction('button_press')
                    // Handle action
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Notification settings panel
interface NotificationSettingsProps {
  settings: any
  onSettingsChange: (settings: any) => void
}

function NotificationSettings({ settings, onSettingsChange }: NotificationSettingsProps) {
  const updateSetting = (path: string, value: any) => {
    const keys = path.split('.')
    const newSettings = { ...settings }
    let current = newSettings
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]]
    }
    current[keys[keys.length - 1]] = value
    
    onSettingsChange(newSettings)
  }

  return (
    <div className="p-4 space-y-6 max-h-96 overflow-y-auto">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="notifications-enabled" className="text-sm font-medium">
            Activar notificaciones
          </Label>
          <Switch
            id="notifications-enabled"
            checked={settings.enabled}
            onCheckedChange={(checked) => updateSetting('enabled', checked)}
          />
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Pagos próximos
          </h4>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Activar recordatorios</Label>
            <Switch
              checked={settings.upcomingPayments.enabled}
              onCheckedChange={(checked) => updateSetting('upcomingPayments.enabled', checked)}
            />
          </div>
          {settings.upcomingPayments.enabled && (
            <div className="space-y-2">
              <Label className="text-sm">
                Días de anticipación: {settings.upcomingPayments.daysBefore.join(', ')}
              </Label>
              <div className="flex space-x-2">
                {[1, 2, 3, 5, 7].map(day => (
                  <Button
                    key={day}
                    variant={settings.upcomingPayments.daysBefore.includes(day) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const current = settings.upcomingPayments.daysBefore
                      const updated = current.includes(day)
                        ? current.filter((d: number) => d !== day)
                        : [...current, day].sort((a, b) => a - b)
                      updateSetting('upcomingPayments.daysBefore', updated)
                    }}
                  >
                    {day}d
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Alertas de presupuesto
          </h4>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Activar alertas</Label>
            <Switch
              checked={settings.budgetAlerts.enabled}
              onCheckedChange={(checked) => updateSetting('budgetAlerts.enabled', checked)}
            />
          </div>
          {settings.budgetAlerts.enabled && (
            <div className="space-y-2">
              <Label className="text-sm">
                Alertar cuando el gasto alcance: {settings.budgetAlerts.thresholds.join('%,  ')}%
              </Label>
              <div className="flex space-x-2">
                {[50, 75, 90, 100].map(threshold => (
                  <Button
                    key={threshold}
                    variant={settings.budgetAlerts.thresholds.includes(threshold) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const current = settings.budgetAlerts.thresholds
                      const updated = current.includes(threshold)
                        ? current.filter((t: number) => t !== threshold)
                        : [...current, threshold].sort((a, b) => a - b)
                      updateSetting('budgetAlerts.thresholds', updated)
                    }}
                  >
                    {threshold}%
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Suscripciones sin usar
          </h4>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Detectar suscripciones sin usar</Label>
            <Switch
              checked={settings.unusedSubscriptions.enabled}
              onCheckedChange={(checked) => updateSetting('unusedSubscriptions.enabled', checked)}
            />
          </div>
          {settings.unusedSubscriptions.enabled && (
            <div className="space-y-2">
              <Label className="text-sm">
                Días sin uso: {settings.unusedSubscriptions.daysThreshold}
              </Label>
              <Slider
                value={[settings.unusedSubscriptions.daysThreshold]}
                onValueChange={([value]) => updateSetting('unusedSubscriptions.daysThreshold', value)}
                min={7}
                max={90}
                step={7}
                className="w-full"
              />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Resumen semanal
          </h4>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Activar resumen semanal</Label>
            <Switch
              checked={settings.weeklyDigest.enabled}
              onCheckedChange={(checked) => updateSetting('weeklyDigest.enabled', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper functions
function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const minutes = Math.floor(Math.abs(diff) / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d`
  if (hours > 0) return `${hours}h`
  if (minutes > 0) return `${minutes}m`
  return 'ahora'
}

function getPriorityColor(priority: SmartNotification['priority']): string {
  switch (priority) {
    case 'urgent': return 'border-red-500 bg-red-50 dark:bg-red-900/20'
    case 'high': return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
    case 'medium': return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
    case 'low': return 'border-gray-300 bg-gray-50 dark:bg-gray-900/20'
  }
}

function getNotificationIcon(type: SmartNotification['type']) {
  switch (type) {
    case 'upcoming_payment': return <Clock className="w-4 h-4" />
    case 'budget_alert': return <AlertTriangle className="w-4 h-4" />
    case 'unused_subscription': return <Clock className="w-4 h-4" />
    case 'suggestion': return <Lightbulb className="w-4 h-4" />
    case 'digest': return <BarChart3 className="w-4 h-4" />
    default: return <Bell className="w-4 h-4" />
  }
}