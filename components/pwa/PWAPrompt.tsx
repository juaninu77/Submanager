'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Download, X, Smartphone, Monitor, Wifi, WifiOff } from 'lucide-react'
import { usePWAInstallation, useNetworkStatus, pwaUtils } from '@/hooks/use-pwa'
import { useLocalStorage } from '@/hooks/use-local-storage'

interface PWAPromptProps {
  className?: string
}

export function PWAPrompt({ className }: PWAPromptProps) {
  const { canInstall, install, isInstalled } = usePWAInstallation()
  const { value: isDismissed, setValue: setIsDismissed } = useLocalStorage('pwa-prompt-dismissed', false)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Show prompt after 10 seconds if app is installable and not dismissed
    const timer = setTimeout(() => {
      if (canInstall && !isDismissed && !isInstalled) {
        setShowPrompt(true)
      }
    }, 10000)

    return () => clearTimeout(timer)
  }, [canInstall, isDismissed, isInstalled])

  const handleInstall = async () => {
    await install()
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setIsDismissed(true)
  }

  if (!showPrompt || isInstalled) {
    return null
  }

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-50 ${className}`}>
      <Card className="border-primary-200 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900 dark:to-primary-800">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-lg bg-primary-500 flex items-center justify-center">
                <Download className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-base">¡Instala Submanager!</CardTitle>
                <CardDescription>
                  Accede más rápido desde tu dispositivo
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0"
              aria-label="Cerrar prompt de instalación"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              <Smartphone className="w-3 h-3 mr-1" />
              Funciona offline
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Monitor className="w-3 h-3 mr-1" />
              Acceso rápido
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Download className="w-3 h-3 mr-1" />
              Sin Play Store
            </Badge>
          </div>
          
          <div className="flex space-x-2">
            <Button onClick={handleInstall} size="sm" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Instalar App
            </Button>
            <Button variant="outline" onClick={handleDismiss} size="sm">
              Ahora no
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Network status indicator
export function NetworkStatus() {
  const { isOnline, isSlowConnection, connectionType } = useNetworkStatus()
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    setShowIndicator(!isOnline || isSlowConnection)
  }, [isOnline, isSlowConnection])

  if (!showIndicator) {
    return null
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-40">
      <Card className={`
        ${!isOnline ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' : 
          'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'}
      `}>
        <CardContent className="flex items-center space-x-3 py-3">
          {!isOnline ? (
            <WifiOff className="h-5 w-5 text-red-600 dark:text-red-400" />
          ) : (
            <Wifi className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          )}
          
          <div className="flex-1">
            <p className={`text-sm font-medium ${
              !isOnline ? 'text-red-900 dark:text-red-100' : 
                         'text-yellow-900 dark:text-yellow-100'
            }`}>
              {!isOnline ? 'Sin conexión' : 'Conexión lenta'}
            </p>
            <p className={`text-xs ${
              !isOnline ? 'text-red-600 dark:text-red-400' : 
                         'text-yellow-600 dark:text-yellow-400'
            }`}>
              {!isOnline 
                ? 'Trabajando en modo offline' 
                : `Conexión ${connectionType} detectada`
              }
            </p>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowIndicator(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Update available notification
export function UpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Listen for update available events
    const handleUpdateAvailable = () => {
      setShowPrompt(true)
    }

    window.addEventListener('updateavailable', handleUpdateAvailable)
    return () => window.removeEventListener('updateavailable', handleUpdateAvailable)
  }, [])

  const handleUpdate = () => {
    window.location.reload()
    setShowPrompt(false)
    window.location.reload()
  }

  if (!showPrompt) {
    return null
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50">
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
        <CardContent className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Nueva actualización disponible
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Actualiza para obtener las últimas mejoras
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={handleUpdate}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Actualizar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPrompt(false)}
            >
              Después
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Share functionality
interface ShareButtonProps {
  title?: string
  text?: string
  url?: string
  className?: string
}

export function ShareButton({ 
  title = 'Submanager', 
  text = 'Gestiona tus suscripciones fácilmente', 
  url = window.location.href,
  className 
}: ShareButtonProps) {
  const [canShare, setCanShare] = useState(false)

  useEffect(() => {
    setCanShare(pwaUtils.canShare())
  }, [])

  const handleShare = async () => {
    const success = await pwaUtils.share({ title, text, url })
    
    if (!success) {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url)
        // Show toast notification
      } catch (error) {
        console.error('Share failed:', error)
      }
    }
  }

  if (!canShare) {
    return null
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className={className}
    >
      Compartir
    </Button>
  )
}